const { Pool } = require('pg');
require('dotenv').config();

// Create a PostgreSQL connection pool
// A pool reuses connections instead of creating a new one for every request (faster & efficient)
const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test the connection when the server starts
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Failed to connect to PostgreSQL database:', err.message);
    return;
  }
  console.log('🐘 Connected to PostgreSQL database: ' + process.env.DB_NAME);
  release(); // release the client back to the pool
});

module.exports = pool;
