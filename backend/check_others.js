const pool = require('./config/db');

async function check() {
  try {
    const tables = ['appointments', 'lab_results'];
    for (const table of tables) {
      const res = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
      process.stdout.write(`\nTable ${table}: ${res.rows.map(r => r.column_name).join(", ")}\n`);
    }
  } catch (e) {
    console.error("DB Error:", e.message);
  } finally {
    process.exit();
  }
}
check();
