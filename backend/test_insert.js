const pool = require('./config/db');

async function testInsert() {
  try {
    const data = {
      patient_id: 1,
      systolic_bp: 120,
      diastolic_bp: 80,
      heart_rate: 72,
      temperature: 36.6,
      oxygen_level: 98,
      mood: 'good',
      symptoms: ['Headache'],
      notes: 'Test log'
    };

    const { patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, symptoms, notes } = data;

    const result = await pool.query(
      `INSERT INTO health_logs (patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, symptoms, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, JSON.stringify(symptoms), notes]
    );

    console.log('Insert successful:', result.rows[0]);
  } catch (err) {
    console.error('Insert failed:', err.message);
  } finally {
    pool.end();
  }
}

testInsert();
