const pool = require('../backend/config/db');

async function checkAdminPass() {
  try {
    const res = await pool.query('SELECT username, password FROM admin_users');
    res.rows.forEach(row => {
        console.log(`User: ${row.username}, Pass Hash: ${row.password}`);
    });
  } catch (err) {
    console.error("Error querying admin_users:", err.message);
  } finally {
    process.exit();
  }
}

checkAdminPass();
