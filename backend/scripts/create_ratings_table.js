const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const pool = require('../config/db');

async function createRatingsTable() {
  try {
    console.log('--- Creating doctor_ratings table ---');
        
    await pool.query(`
      CREATE TABLE IF NOT EXISTS doctor_ratings (
          id              SERIAL PRIMARY KEY,
          patient_id      INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
          doctor_id       INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
          rating          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          review          TEXT,
          is_reported     BOOLEAN DEFAULT FALSE,
          report_reason   TEXT,
          created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(patient_id, doctor_id)
      );
    `);
    console.log('✔ doctor_ratings table created');

  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    process.exit();
  }
}
createRatingsTable();
