const dotenv = require('dotenv');
const { Pool } = require('pg');

// Load environment variables
dotenv.config();

// Database configuration
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  // For Supabase, make sure we use the transaction pooler port 6543
  // and allow self-signed certificates
  ssl: {
    rejectUnauthorized: false
  }
};

// Create pool instance
const pool = new Pool(poolConfig);

module.exports = {
  pool,
  PORT: process.env.PORT || 5000
}; 