const pool = require('../backend/config/db');

async function checkAdmin() {
  try {
    const res = await pool.query('SELECT id, username, email, full_name, is_active FROM admin_users');
    console.log("Admin users found:", res.rows);
  } catch (err) {
    console.error("Error querying admin_users:", err.message);
  } finally {
    process.exit();
  }
}

checkAdmin();
