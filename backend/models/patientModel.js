const pool = require('../config/db');

class PatientModel {
  static async create(data) {
    const { full_name, email, password, hospital_id, doctor_id } = data;
    const result = await pool.query(
      `INSERT INTO patients (full_name, email, password, hospital_id, doctor_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, status, created_at`,
      [full_name, email, password, hospital_id, doctor_id]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query('SELECT * FROM patients WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, full_name, email, hospital_id, doctor_id, status, created_at FROM patients WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findAll() {
    const result = await pool.query(
      'SELECT id, full_name, email, hospital_id, doctor_id, status, created_at FROM patients ORDER BY created_at DESC'
    );
    return result.rows;
  }
}

module.exports = PatientModel;
