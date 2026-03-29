const pool = require('../config/db');
const bcrypt = require('bcryptjs');

async function addAdmin(username, password, email, fullName) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const existing = await pool.query('SELECT * FROM admin_users WHERE username = $1', [username]);
    
    if (existing.rows.length > 0) {
      console.log(`User '${username}' already exists. Updating password instead.`);
      await pool.query('UPDATE admin_users SET password = $1, email = $2, full_name = $3, is_active = TRUE WHERE username = $4', 
                       [hashedPassword, email, fullName, username]);
    } else {
      await pool.query('INSERT INTO admin_users (username, password, email, full_name, is_active) VALUES ($1, $2, $3, $4, TRUE)', 
                       [username, hashedPassword, email, fullName]);
      console.log(`User '${username}' created successfully.`);
    }
    console.log(`Credentials: Username: ${username}, Password: ${password}`);
  } catch (err) {
    console.error("FAIL:", err.message);
  } finally {
    process.exit();
  }
}

// You can call this script with: node scripts/add_admin.js <username> <password> <email> <fullName>
const args = process.argv.slice(2);
const username = args[0] || 'admin';
const password = args[1] || 'admin123';
const email = args[2] || 'admin@icams.lk';
const fullName = args[3] || 'System Administrator';

addAdmin(username, password, email, fullName);
