const pool = require('../config/db');

class DoctorModel {
  static async create(data) {
    const {
      full_name, email, password, license_number, specialization,
      years_of_experience, institution_name, registration_number, license_document, hospital_ids
    } = data;

    const result = await pool.query(
      `INSERT INTO doctors (
        full_name, email, password, license_number, specialization, 
        years_of_experience, institution_name, registration_number, license_document, hospital_ids
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, full_name, email, specialization, status`,
      [
        full_name, email, password, license_number, specialization,
        years_of_experience, institution_name, registration_number, license_document, hospital_ids || []
      ]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query('SELECT * FROM doctors WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, full_name, email, specialization, status, created_at, hospital_ids, institution_name FROM doctors WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE doctors SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, full_name, status',
      [status, id]
    );
    return result.rows[0];
  }

  static async findAll() {
    const result = await pool.query(
      'SELECT id, full_name, email, specialization, license_number, years_of_experience, institution_name, registration_number, hospital_ids, license_document, status, created_at FROM doctors ORDER BY created_at DESC'
    );
    return result.rows;
  }

  static async findActiveByHospitalId(hospitalId) {
    const result = await pool.query(
      `SELECT id, full_name, email, specialization, years_of_experience, institution_name, status, hospital_ids
       FROM doctors
       WHERE ($1 = ANY(hospital_ids) OR institution_name = (SELECT name FROM hospitals WHERE id = $1)) 
       AND status = 'ACTIVE'`,
      [hospitalId]
    );
    return result.rows;
  }
}

module.exports = DoctorModel;
