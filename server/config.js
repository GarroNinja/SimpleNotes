const dotenv = require('dotenv');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Check for database URL
let dbUrl = process.env.DATABASE_URL;

// Fix potentially truncated URL if needed
if (dbUrl && dbUrl.includes('\n')) {
  console.log('Found newline in DATABASE_URL, fixing...');
  dbUrl = dbUrl.replace(/\s+/g, '');
  
  // Save back the fixed URL to the .env file to prevent future issues
  try {
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(/DATABASE_URL=(.+)/, `DATABASE_URL=${dbUrl}`);
    fs.writeFileSync(envPath, envContent);
    console.log('Fixed DATABASE_URL in .env file');
  } catch (err) {
    console.error('Could not update .env file:', err.message);
  }
}

// Check for missing URL
if (!dbUrl) {
  console.error('ERROR: DATABASE_URL environment variable is not set!');
  console.error('Please make sure DATABASE_URL is set in your environment variables.');
}

// Log database connection attempt (safely, without showing credentials)
const safeDbUrl = dbUrl ? dbUrl.replace(/\/\/([^:]+):[^@]+@/, '//***:***@') : 'No DATABASE_URL found';
console.log(`Attempting to connect to database: ${safeDbUrl}`);

// Check if this is the Supabase pooler URL
const isSupabasePooler = dbUrl && 
  (dbUrl.includes('.pooler.supabase.com') || dbUrl.includes('.pooler.supabase.co'));
console.log(`Using Supabase connection pooler: ${isSupabasePooler ? 'yes' : 'no'}`);

// Database configuration specifically optimized for Supabase connection pooling
const poolConfig = {
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false // Required for Supabase connection
  },
  
  // Connection pool settings optimized for reliability
  min: 0,                // Start with no connections (create on demand)
  max: 5,                // Limit max connections to 5
  idleTimeoutMillis: 30000,         // 30 seconds idle timeout
  connectionTimeoutMillis: 5000,    // 5 seconds connection timeout
  
  // Prevent issues with dropped connections
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
};

// Create connection pool state management
let pool = null;
let dbConnected = false;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

/**
 * Creates a new database connection pool
 */
const createPool = () => {
  if (pool) {
    try {
      // Try to end existing pool
      pool.end().catch(err => {
        console.error('Error ending existing pool:', err.message);
      });
    } catch (err) {
      console.error('Error terminating pool:', err.message);
    }
  }

  try {
    pool = new Pool(poolConfig);
    
    // Add error handler to pool
    pool.on('error', (err, client) => {
      console.error('Unexpected error on idle client', err);
      dbConnected = false;
      
      if (client) {
        try {
          console.log('Removing problematic client from pool');
          client.release(true);
        } catch (releaseErr) {
          console.error('Error releasing client:', releaseErr.message);
        }
      }
    });
    
    return pool;
  } catch (error) {
    console.error('Failed to create database pool:', error.message);
    
    // Create a dummy pool object to prevent crashes
    return {
      query: () => Promise.reject(new Error('Database connection not available')),
      connect: () => Promise.reject(new Error('Database connection not available')),
      end: () => Promise.resolve(),
      on: () => {}
    };
  }
};

/**
 * Tests the database connection
 */
const testConnection = async (force = false) => {
  if (!force && dbConnected) {
    return true; // Already connected
  }

  try {
    console.log('Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful:', result.rows[0].now);
    dbConnected = true;
    connectionAttempts = 0;
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    dbConnected = false;
    connectionAttempts++;
    
    // If we've tried several times, recreate the pool
    if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
      console.log('Maximum connection attempts reached, recreating pool');
      pool = createPool();
      connectionAttempts = 0;
    }
    
    return false;
  }
};

// Create the initial pool
pool = createPool();

// Test connection immediately
testConnection().catch(() => {});

// Export the database interface
module.exports = {
  // Export pool instance accessor to ensure we always get the current pool
  get pool() { return pool; },
  createPool,
  testConnection,
  get dbConnected() { return dbConnected; },
  set dbConnected(value) { dbConnected = value; },
  PORT: process.env.PORT || 5002
}; 