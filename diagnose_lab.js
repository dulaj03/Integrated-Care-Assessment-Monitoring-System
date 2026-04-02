require('dotenv').config({ path: './backend/.env' });
const pool = require('./backend/config/db');

async function check() {
    try {
        console.log('--- Testing Query Table Existence ---');
        const rows = await pool.query('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = \'public\'');
        console.log('Tables in public schema:', rows.rows.map(t => t.tablename));

        console.log('\n--- Testing lab_results Columns ---');
        const cols = await pool.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'lab_results\'');
        console.log('Columns in lab_results:', cols.rows);

        console.log('\n--- Trying manual INSERT for Patient 3 ---');
        const insert = await pool.query(
            `INSERT INTO lab_results (patient_id, doctor_id, test_name, test_type, status) 
             VALUES (3, 2, 'DIAGNOSTIC_TEST', 'blood', 'ordered') RETURNING id`
        );
        console.log('Manual INSERT result:', insert.rows[0]);

        console.log('\n--- Trying Query for Patient 3 ---');
        const fetch = await pool.query(
            `SELECT * FROM lab_results WHERE patient_id = 3`
        );
        console.log('Fetch result count:', fetch.rows.length);

    } catch (e) {
        console.error('ERROR during diagnosis:', e.message);
        if (e.detail) console.error('DETAIL:', e.detail);
        if (e.where) console.error('WHERE:', e.where);
    } finally {
        process.exit();
    }
}

check();
