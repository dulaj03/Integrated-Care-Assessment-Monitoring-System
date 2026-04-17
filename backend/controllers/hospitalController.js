const pool = require('../config/db');

const hospitalController = {
  // Public: List all hospitals
  getAllHospitals: async (req, res) => {
    try {
      const results = await pool.query(
        `SELECT id, name, address, phone, type, specialties, status 
                 FROM hospitals WHERE status = 'ACTIVE' ORDER BY name ASC`
      );
      res.json(results.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch hospitals' });
    }
  },

  getDoctorsByHospital: async (req, res) => {
    try {
      const { hospital_id } = req.params;
      const results = await pool.query(
        `SELECT d.id, d.full_name, d.specialization, d.years_of_experience, d.avatar,
                        COALESCE(AVG(r.rating), 0)::numeric(2,1) as avg_rating,
                        COUNT(r.id) as review_count
                 FROM doctors d
                 LEFT JOIN doctor_ratings r ON d.id = r.doctor_id AND r.is_reported = FALSE
                 WHERE $1 = ANY(d.hospital_ids) AND d.status = 'ACTIVE'
                 GROUP BY d.id
                 ORDER BY d.full_name ASC`,
        [hospital_id]
      );

      res.json(results.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch doctors' });
    }
  },

  // Get patients by hospital
  getPatientsByHospital: async (req, res) => {
    try {
      const { hospital_id } = req.params;
      const results = await pool.query(
        `SELECT p.id, p.full_name as name, p.condition, p.status, p.doctor_id, d.full_name as doctor_name
                 FROM patients p
                 LEFT JOIN doctors d ON p.doctor_id = d.id
                 WHERE p.hospital_id = $1`,
        [hospital_id]
      );

      res.json(results.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch patients' });
    }
  }
};

module.exports = hospitalController;
