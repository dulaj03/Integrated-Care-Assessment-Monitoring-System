require('dotenv').config();
const pool = require('./config/db');

async function update() {
    try {
        console.log('--- Updating lab_results schema ---');
        
        // 1. Add nurse_id column if it doesn't exist
        await pool.query(`
            ALTER TABLE lab_results 
            ADD COLUMN IF NOT EXISTS nurse_id integer REFERENCES nurses(id) ON DELETE SET NULL
        `);
        console.log('✔ nurse_id column added');

        // 2. Make hospital_id nullable
        await pool.query(`
            ALTER TABLE lab_results 
            ALTER COLUMN hospital_id DROP NOT NULL
        `);
        console.log('✔ hospital_id made nullable');

        // 3. Make doctor_id nullable (for flexibility)
        await pool.query(`
            ALTER TABLE lab_results 
            ALTER COLUMN doctor_id DROP NOT NULL
        `);
        console.log('✔ doctor_id made nullable');

        // 4. Ensure test_type has a default or is nullable if needed (currently NOT NULL)
        await pool.query(`
            ALTER TABLE lab_results 
            ALTER COLUMN test_type DROP NOT NULL
        `);
        console.log('✔ test_type made nullable');

        // 5. Add review_note column
        await pool.query(`
            ALTER TABLE lab_results 
            ADD COLUMN IF NOT EXISTS review_note text
        `);
        console.log('✔ review_note column added');

    } catch (e) {
        console.error('ERROR:', e.message);
    } finally {
        process.exit();
    }
}
update();
