const dotenv = require('dotenv');
const { Pool } = require('pg');
const { parse } = require('pg-connection-string');

// Load environment variables
dotenv.config();

// Check for database URL
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('ERROR: DATABASE_URL environment variable is not set!');
  console.error('Please make sure DATABASE_URL is set in your Vercel environment variables.');
  // Don't crash the app, but log the error
}

// Log database connection attempt (sanitized)
console.log(`Attempting to connect to database: ${dbUrl ? dbUrl.split('@')[1] || '(masked URL)' : 'No DATABASE_URL found'}`);

// Check if this is the Supabase pooler URL
const isSupabasePooler = dbUrl && dbUrl.includes('.pooler.supabase.co');
if (!isSupabasePooler && dbUrl) {
  console.warn('WARNING: DATABASE_URL does not appear to be a Supabase connection pooler URL.');
  console.warn('For better performance, use a URL ending with .pooler.supabase.co');
}

// Parse connection string if available
const connectionConfig = dbUrl ? parse(dbUrl) : {};

// Database configuration for Supabase connection pooling
const poolConfig = {
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false // Required for Supabase connection pooling
  },
  // Supabase pooler specific settings
  min: 2, // Minimum pool size
  max: 10, // Maximum pool size
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 5000, // How long to wait for a connection to become available
  
  // Add explicit connection details when available
  ...(connectionConfig && {
    host: connectionConfig.host,
    port: connectionConfig.port,
    database: connectionConfig.database,
    user: connectionConfig.user,
    password: connectionConfig.password
  })
};

// Create pool instance
let pool;
try {
  pool = new Pool(poolConfig);
  
  // Add error handler to pool
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    // Don't crash the app, but log the error
  });
  
  // Test database connection immediately
  pool.query('SELECT NOW()')
    .then(() => console.log('✅ Database connection successful using Supabase connection pooling'))
    .catch(err => console.error('❌ Database connection failed:', err.message));
} catch (error) {
  console.error('Failed to create database pool:', error.message);
  // Create a dummy pool to prevent application crashes
  pool = {
    query: () => Promise.reject(new Error('Database connection not available')),
    connect: () => Promise.reject(new Error('Database connection not available')),
    end: () => Promise.resolve()
  };
}

module.exports = {
  pool,
  PORT: process.env.PORT || 5001
}; 