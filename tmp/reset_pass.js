const pool = require('../backend/config/db');
const bcrypt = require('bcryptjs');

async function resetPass() {
  try {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const res = await pool.query('UPDATE admin_users SET password = $1 WHERE username = $2', [hashedPassword, 'admin']);
    console.log("Password reset success for 'admin'. Password is: admin123");
  } catch (err) {
    console.error("Error updating admin_users:", err.message);
  } finally {
    process.exit();
  }
}

resetPass();
