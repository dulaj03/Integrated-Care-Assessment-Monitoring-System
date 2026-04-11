const pool = require('../config/db');
const bcrypt = require('bcryptjs');

async function resetPass() {
  try {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    // Let's reset for both 'dulaj' and 'admin' just in case.
    await pool.query("UPDATE admin_users SET password = $1 WHERE username = 'admin'", [hashedPassword]);
    await pool.query("UPDATE admin_users SET password = $1 WHERE username = 'dulaj'", [hashedPassword]);
    console.log("SUCCESS: Password reset to 'admin123' for 'admin' and 'dulaj'");
  } catch (err) {
    console.error('FAIL:', err.message);
  } finally {
    process.exit();
  }
}

resetPass();
