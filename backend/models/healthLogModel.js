const pool = require('../config/db');

class HealthLogModel {
  static async create(data) {
    const { patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, symptoms, notes } = data;
    const result = await pool.query(
      `INSERT INTO health_logs (patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, symptoms, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, JSON.stringify(symptoms), notes]
    );
    return result.rows[0];
  }

  static async findLatestByPatientId(patient_id) {
    const result = await pool.query(
      'SELECT * FROM health_logs WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 1',
      [patient_id]
    );
    return result.rows[0];
  }

  static async findAllByPatientId(patient_id) {
    const result = await pool.query(
      'SELECT * FROM health_logs WHERE patient_id = $1 ORDER BY created_at DESC',
      [patient_id]
    );
    return result.rows;
  }
}

module.exports = HealthLogModel;
