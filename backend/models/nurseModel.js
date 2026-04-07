const pool = require('../config/db');

class NurseModel {
  static async create(data) {
    const {
      full_name, email, password, license_number, qualification,
      years_of_experience, institution_name, registration_number, license_document, hospital_ids
    } = data;

    const result = await pool.query(
      `INSERT INTO nurses (
        full_name, email, password, license_number, qualification, 
        years_of_experience, institution_name, registration_number, license_document, hospital_ids
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, full_name, email, qualification, status`,
      [
        full_name, email, password, license_number, qualification,
        years_of_experience, institution_name, registration_number, license_document, hospital_ids || []
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
      'SELECT id, full_name, email, qualification, status, created_at, hospital_ids, institution_name FROM nurses WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE nurses SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, full_name, email, status',
      [status, id]
    );
    return result.rows[0];
  }

  static async findAll() {
    const result = await pool.query(
      'SELECT id, full_name, email, qualification, license_number, years_of_experience, institution_name, registration_number, hospital_ids, license_document, status, created_at FROM nurses ORDER BY created_at DESC'
    );
    return result.rows;
  }

  static async findActiveNursesByHospitalId(hospitalId) {
    const result = await pool.query(
      `SELECT id, full_name, email, qualification, years_of_experience, institution_name, status, hospital_ids
       FROM nurses
       WHERE ($1 = ANY(hospital_ids)) 
       AND status = 'ACTIVE'`,
      [hospitalId]
    );
    return result.rows;
  }

  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM nurses WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  static async updateProfile(id, data) {
    const { 
      full_name, email, qualification, license_number, 
      years_of_experience, institution_name, registration_number 
    } = data;
    const result = await pool.query(
      `UPDATE nurses 
       SET full_name = COALESCE($1, full_name), 
           email = COALESCE($2, email), 
           qualification = COALESCE($3, qualification), 
           license_number = COALESCE($4, license_number), 
           years_of_experience = COALESCE($5, years_of_experience), 
           institution_name = COALESCE($6, institution_name), 
           registration_number = COALESCE($7, registration_number),
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $8 
       RETURNING id, full_name, email, qualification, status, created_at, hospital_ids, institution_name`,
      [
        full_name, email, qualification, license_number, 
        years_of_experience, institution_name, registration_number, id
      ]
    );
    return result.rows[0];
  }
}

module.exports = NurseModel;
