const pool = require('../config/db');
const bcrypt = require('bcryptjs');

async function finalFix() {
  try {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const res = await pool.query('UPDATE admin_users SET password = $1, is_active = TRUE', [hashedPassword]);
    console.log(`Updated ${res.rowCount} admin accounts.`);
    
    const list = await pool.query('SELECT username FROM admin_users');
    console.log('Admins now active:', list.rows.map(r => r.username).join(', '));
    console.log('Both can now login with password: admin123');
  } catch (err) {
    console.error('FAIL:', err.message);
  } finally {
    process.exit();
  }
}

finalFix();
