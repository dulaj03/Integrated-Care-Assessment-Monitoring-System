const pool = require('../config/db');

class HospitalModel {
  static async create(data) {
    const { name, email, password, registration_number, address, phone, type, specialties } = data;
    const result = await pool.query(
      `INSERT INTO hospitals (name, email, password, registration_number, address, phone, type, specialties)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, email, type, specialties, status`,
      [name, email, password, registration_number, address, phone, type || 'Private', JSON.stringify(specialties || [])]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query('SELECT * FROM hospitals WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, name, email, registration_number, address, phone, type, specialties, status, created_at FROM hospitals WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findAll() {
    const result = await pool.query(
      'SELECT id, name, email, registration_number, address, phone, type, specialties, status, created_at FROM hospitals ORDER BY created_at DESC'
    );
    return result.rows;
  }
}

module.exports = HospitalModel;
