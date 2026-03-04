/**
 * Run this script to create or reset the admin user with a proper hashed password.
 * Usage: node scripts/createAdmin.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function createAdmin() {
  const username = 'dulaj';
  const email = 'admin@icams.lk';
  const fullName = 'System Administrator';
  const plainPass = 'Admin@123';  // ← change this if you want a different password

  try {
    // Generate a proper bcrypt hash
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(plainPass, salt);

    // Upsert: insert or update if username already exists
    const result = await pool.query(
      `INSERT INTO admin_users (username, email, password, full_name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (username)
       DO UPDATE SET password = $3, email = $2, full_name = $4, updated_at = NOW()
       RETURNING id, username, email, full_name`,
      [username, email, hashed, fullName]
    );

    console.log('✅ Admin user created/updated successfully!');
    console.log('─────────────────────────────────');
    console.log(`   Username : ${result.rows[0].username}`);
    console.log(`   Email    : ${result.rows[0].email}`);
    console.log(`   Name     : ${result.rows[0].full_name}`);
    console.log(`   Password : ${plainPass}`);
    console.log('─────────────────────────────────');
    console.log('✅ You can now log in with these credentials.');

  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
  } finally {
    pool.end();
  }
}

createAdmin();
