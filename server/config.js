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

// Database configuration
const poolConfig = {
  connectionString: dbUrl,
  // Configure SSL based on environment
  ssl: {
    rejectUnauthorized: false // Required for most cloud database providers including Vercel PostgreSQL
  }
};

// Create pool instance
const pool = new Pool(poolConfig);

// Test database connection immediately
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Database connection successful'))
  .catch(err => console.error('❌ Database connection failed:', err.message));

module.exports = {
  pool,
  PORT: process.env.PORT || 5001
}; 