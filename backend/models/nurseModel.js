const pool = require('../config/db');

class NurseModel {
  static async create(data) {
    const {
      full_name, email, password, license_number, qualification,
      years_of_experience, institution_name, registration_number, license_document
    } = data;

    const result = await pool.query(
      `INSERT INTO nurses (
        full_name, email, password, license_number, qualification, 
        years_of_experience, institution_name, registration_number, license_document
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, full_name, email, qualification, status`,
      [
        full_name, email, password, license_number, qualification,
        years_of_experience, institution_name, registration_number, license_document
      ]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query('SELECT * FROM nurses WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, full_name, email, qualification, status, created_at FROM nurses WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE nurses SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, full_name, status',
      [status, id]
    );
    return result.rows[0];
  }

  static async findAll() {
    const result = await pool.query(
      'SELECT id, full_name, email, qualification, license_number, years_of_experience, institution_name, registration_number, license_document, status, created_at FROM nurses ORDER BY created_at DESC'
    );
    return result.rows;
  }
}

module.exports = NurseModel;
