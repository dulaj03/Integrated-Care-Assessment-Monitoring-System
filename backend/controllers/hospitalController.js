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

    // Public: Get doctors by hospital
    getDoctorsByHospital: async (req, res) => {
        try {
            const { hospital_id } = req.params;
            const results = await pool.query(
                `SELECT id, full_name, specialization, years_of_experience 
                 FROM doctors 
                 WHERE $1 = ANY(hospital_ids) AND status = 'ACTIVE' 
                 ORDER BY full_name ASC`,
                [hospital_id]
            );

            res.json(results.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch doctors' });
        }
    }
};

module.exports = hospitalController;
