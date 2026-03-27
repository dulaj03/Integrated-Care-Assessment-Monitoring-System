const pool = require('./config/db');

async function check() {
  try {
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log("Tables:", res.rows.map(r => r.table_name).join(", "));
  } catch (e) {
    console.error("DB Error:", e.message);
  } finally {
    process.exit();
  }
}
check();
