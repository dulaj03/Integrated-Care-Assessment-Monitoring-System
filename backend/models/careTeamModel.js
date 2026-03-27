const pool = require('../config/db');

class CareTeamModel {
  static async assignNurse(patientId, nurseId, assignedBy) {
    const result = await pool.query(
      `INSERT INTO patient_nurse_assignments (patient_id, nurse_id, assigned_by)
       VALUES ($1, $2, $3)
       ON CONFLICT (patient_id, nurse_id) DO NOTHING
       RETURNING *`,
      [patientId, nurseId, assignedBy]
    );
    return result.rows[0];
  }

  static async getNursesByPatientId(patientId) {
    const result = await pool.query(
      `SELECT n.id, n.full_name, n.email, n.qualification
       FROM nurses n
       JOIN patient_nurse_assignments pna ON n.id = pna.nurse_id
       WHERE pna.patient_id = $1`,
      [patientId]
    );
    return result.rows;
  }

  static async getPatientsByNurseId(nurseId) {
    const result = await pool.query(
      `SELECT p.id, p.full_name, p.email, p.condition, p.status
       FROM patients p
       JOIN patient_nurse_assignments pna ON p.id = pna.patient_id
       WHERE pna.nurse_id = $1`,
      [nurseId]
    );
    return result.rows;
  }

  static async removeNurseAssignment(patientId, nurseId) {
    const result = await pool.query(
      'DELETE FROM patient_nurse_assignments WHERE patient_id = $1 AND nurse_id = $2 RETURNING id',
      [patientId, nurseId]
    );
    return result.rows[0];
  }
}

module.exports = CareTeamModel;
