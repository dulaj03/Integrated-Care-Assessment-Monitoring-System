const pool = require('../config/db');
const bcrypt = require('bcryptjs');

async function fixAllAdmins() {
  try {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admins = await pool.query('SELECT * FROM admin_users');
    for (const admin of admins.rows) {
        await pool.query('UPDATE admin_users SET password = $1, is_active = TRUE WHERE id = $2', [hashedPassword, admin.id]);
        console.log(`Updated user: ${admin.username} (ID: ${admin.id}) to password: ${password}`);
    }
  } catch (err) {
    console.error("FAIL:", err.message);
  } finally {
    process.exit();
  }
}

fixAllAdmins();
