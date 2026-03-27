const pool = require('./config/db');

async function check() {
  try {
    const table = 'doctors';
    const res = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
    console.log(`Doctors: ${res.rows.map(r => `${r.column_name} (${r.data_type})`).join(", ")}`);
  } catch (e) {
    console.error("DB Error:", e.message);
  } finally {
    process.exit();
  }
}
check();
