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
      `SELECT p.id, p.full_name, p.email, p.hospital_id, p.doctor_id, p.status, p.condition, 
              p.phone, p.age, p.gender, p.address, p.profile_picture, p.created_at,
              d.full_name as doctor_name,
              (SELECT string_agg(n.full_name, ', ') 
               FROM nurses n 
               JOIN patient_nurse_assignments pna ON n.id = pna.nurse_id 
               WHERE pna.patient_id = p.id) as nurse_names
       FROM patients p
       LEFT JOIN doctors d ON p.doctor_id = d.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findAll() {
    const result = await pool.query(
      'SELECT id, full_name, email, hospital_id, doctor_id, status, condition, created_at FROM patients ORDER BY created_at DESC'
    );
    return result.rows;
  }

  static async findByDoctorId(doctorId) {
    const result = await pool.query(
      'SELECT id, full_name, email, hospital_id, status, condition, created_at FROM patients WHERE doctor_id = $1 ORDER BY created_at DESC',
      [doctorId]
    );
    return result.rows;
  }

  static async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE patients SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, full_name, status',
      [status, id]
    );
    return result.rows[0];
  }

  static async updateCondition(id, condition) {
    const result = await pool.query(
      'UPDATE patients SET condition = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, full_name, condition',
      [condition, id]
    );
    return result.rows[0];
  }

  static async updateDoctor(id, doctorId) {
    const result = await pool.query(
      'UPDATE patients SET doctor_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, full_name, doctor_id',
      [doctorId, id]
    );
    return result.rows[0];
  }

  static async updateHospital(id, hospitalId) {
    const result = await pool.query(
      'UPDATE patients SET hospital_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, full_name, hospital_id',
      [hospitalId, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM patients WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  static async updateProfile(id, data) {
    const { full_name, email, phone, age, gender, address, profile_picture } = data;
    const result = await pool.query(
      `UPDATE patients 
       SET full_name = COALESCE($1, full_name), 
           email = COALESCE($2, email), 
           phone = COALESCE($3, phone), 
           age = COALESCE($4, age), 
           gender = COALESCE($5, gender), 
           address = COALESCE($6, address), 
           profile_picture = COALESCE($7, profile_picture),
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $8 
       RETURNING *`,
      [full_name, email, phone, age, gender, address, profile_picture, id]
    );
    return result.rows[0];
  }
}

module.exports = PatientModel;
