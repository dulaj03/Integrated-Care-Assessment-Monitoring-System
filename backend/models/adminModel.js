const pool = require('../config/db');

// Find admin by username
const findByUsername = async (username) => {
  const result = await pool.query(
    'SELECT * FROM admin_users WHERE LOWER(username) = LOWER($1) AND is_active = TRUE',
    [username]
  );
  return result.rows[0]; // returns the admin row or undefined
};

// Find admin by email
const findByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM admin_users WHERE LOWER(email) = LOWER($1)',
    [email]
  );
  return result.rows[0];
};

// Find admin by id
const findById = async (id) => {
  const result = await pool.query(
    'SELECT id, username, email, full_name, is_active, created_at FROM admin_users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

// Update admin profile
const update = async (id, { username, email, fullName, password }) => {
  let query = 'UPDATE admin_users SET username = $1, email = $2, full_name = $3';
  const params = [username, email, fullName, id];

  if (password) {
    query += ', password = $5 WHERE id = $4 RETURNING id, username, email, full_name';
    params.push(password);
  } else {
    query += ' WHERE id = $4 RETURNING id, username, email, full_name';
  }

  const result = await pool.query(query, params);
  return result.rows[0];
};

module.exports = { findByUsername, findByEmail, findById, update };
