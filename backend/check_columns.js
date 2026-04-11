const pool = require('./config/db');

async function check() {
  try {
    const tables = ['doctors', 'nurses', 'patients', 'hospitals'];
    for (const table of tables) {
      console.log(`\nTable: ${table}`);
      const res = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
      console.log(res.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
    }
  } catch (e) {
    console.error('DB Error:', e.message);
  } finally {
    process.exit();
  }
}
check();
