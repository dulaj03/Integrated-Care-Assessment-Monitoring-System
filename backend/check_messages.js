const pool = require('./config/db');

async function check() {
  try {
    const table = 'messages';
    const res = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_name = '${table}'`);
    process.stdout.write(`Exists: ${res.rows.length > 0}\n`);
  } catch (e) {
    console.error("DB Error:", e.message);
  } finally {
    process.exit();
  }
}
check();
