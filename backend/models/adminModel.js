const pool = require('../config/db');

// Find admin by username
const findByUsername = async (username) => {
  const result = await pool.query(
    'SELECT * FROM admin_users WHERE username = $1 AND is_active = TRUE',
    [username]
  );
  return result.rows[0]; // returns the admin row or undefined
};

// Find admin by id
const findById = async (id) => {
  const result = await pool.query(
    'SELECT id, username, email, full_name, is_active, created_at FROM admin_users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

module.exports = { findByUsername, findById };
