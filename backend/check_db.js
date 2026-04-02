const pool = require('./config/db');

async function check() {
    try {
        const res = await pool.query('SELECT column_name FROM information_schema.columns WHERE table_name = \'lab_results\'');
        console.log(res.rows.map(r => r.column_name));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
