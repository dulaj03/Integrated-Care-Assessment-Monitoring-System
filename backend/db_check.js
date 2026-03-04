const pool = require('./config/db');

async function test() {
  try {
    const res = await pool.query('SELECT * FROM health_logs');
    console.log('Health Logs:', JSON.stringify(res.rows, null, 2));
    const patients = await pool.query('SELECT id, full_name, email FROM patients');
    console.log('Patients:', JSON.stringify(patients.rows, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    pool.end();
  }
}

test();
