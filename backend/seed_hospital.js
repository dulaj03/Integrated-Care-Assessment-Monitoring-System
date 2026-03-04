const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    const hashedPassword = await bcrypt.hash('national123', 10);
    const result = await pool.query(
      `INSERT INTO hospitals (name, email, password, registration_number, address, phone, type, specialties, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [
        'National Hospital of Sri Lanka',
        'info@nhsl.health.gov.lk',
        hashedPassword,
        'GOV-001',
        'Regent Street, Colombo 10',
        '+94 11 269 1111',
        'Government',
        JSON.stringify(['Cardiology', 'Neurology', 'Oncology', 'Nephrology', 'Dermatology', 'Gastroenterology']),
        'ACTIVE'
      ]
    );
    if (result.rows.length > 0) {
      console.log('✅ National Hospital of Sri Lanka seeded successfully.');
    } else {
      console.log('ℹ️ National Hospital already exists.');
    }
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    pool.end();
  }
}

seed();
