const fs = require('fs');
require('dotenv').config();
const pool = require('./config/db');

async function check() {
    try {
        console.log('--- Printing Columns for lab_results ---');
        const res = await pool.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'lab_results'
        `);
        console.log('Columns in lab_results:', JSON.stringify(res.rows, null, 2));

        console.log('\n--- Printing Foreign Keys for lab_results ---');
        const fks = await pool.query(`
            SELECT
                conname AS constraint_name,
                pg_get_constraintdef(c.oid) AS definition
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE contype = 'f' AND n.nspname = 'public' AND conrelid = 'lab_results'::regclass
        `);
        console.table(fks.rows);

        const output = {
            columns: res.rows,
            fks: fks.rows
        };
        fs.writeFileSync('schema_output.json', JSON.stringify(output, null, 2));
        console.log('--- Output written to schema_output.json ---');

    } catch (e) {
        console.error('ERROR:', e.message);
    } finally {
        process.exit();
    }
}
check();
