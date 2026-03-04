const pool = require('./config/db');

async function migrate() {
  try {
    console.log('--- Starting Database Migration ---');

    // Add type and specialties to hospitals table
    await pool.query(`
      ALTER TABLE hospitals 
      ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'Private',
      ADD COLUMN IF NOT EXISTS specialties JSONB DEFAULT '[]';
    `);
    console.log('✅ Added "type" and "specialties" to hospitals table.');

    // Ensure we can link doctors to hospitals (optional but good)
    await pool.query(`
      ALTER TABLE doctors 
      ADD COLUMN IF NOT EXISTS hospital_id INTEGER REFERENCES hospitals(id);
    `);
    console.log('✅ Added "hospital_id" to doctors table.');

    console.log('--- Migration Completed Successfully ---');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    pool.end();
  }
}

migrate();
