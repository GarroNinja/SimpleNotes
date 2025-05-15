const dotenv = require('dotenv');
const { Pool } = require('pg');

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
  connectionTimeoutMillis: 5000 // How long to wait for a connection to become available
};

// Create pool instance
const pool = new Pool(poolConfig);

// Test database connection immediately
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Database connection successful using Supabase connection pooling'))
  .catch(err => console.error('❌ Database connection failed:', err.message));

module.exports = {
  pool,
  PORT: process.env.PORT || 5001
}; 