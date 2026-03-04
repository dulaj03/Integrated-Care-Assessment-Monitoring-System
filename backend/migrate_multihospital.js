const pool = require('./config/db');

async function migrate() {
  try {
    console.log('--- Starting Multihospital Migration ---');

    // Add hospital_ids (integer array) to doctors and nurses
    // Using JSONB as a more flexible alternative if array support is tricky, 
    // but native array is fine in PG.
    await pool.query(`
      ALTER TABLE doctors 
      ADD COLUMN IF NOT EXISTS hospital_ids INTEGER[] DEFAULT '{}';
      
      ALTER TABLE nurses 
      ADD COLUMN IF NOT EXISTS hospital_ids INTEGER[] DEFAULT '{}';
    `);
    console.log('✅ Added "hospital_ids" (array) to doctors and nurses tables.');

    console.log('--- Migration Completed Successfully ---');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    pool.end();
  }
}

migrate();
