const pool = require('../config/db');

const labController = {
    // Doctor orders a test
    orderTest: async (req, res) => {
        try {
            const { patient_id, test_name, test_type, hospital_id } = req.body;
            const doctor_id = req.user.id;

            const result = await pool.query(
                `INSERT INTO lab_results (patient_id, doctor_id, hospital_id, test_name, test_type, status)
                 VALUES ($1, $2, $3, $4, $5, 'ordered') RETURNING *`,
                [patient_id, doctor_id, hospital_id, test_name, test_type]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Order test failed:', error);
            res.status(500).json({ error: 'Failed to order test' });
        }
    },

    // Get tests for a nurse (assigned to them via assignments)
    getNursePendingTests: async (req, res) => {
        try {
            const nurse_id = req.user.id;
            const result = await pool.query(
                `SELECT lr.*, p.full_name as patient_name, d.full_name as doctor_name
                 FROM lab_results lr
                 JOIN patients p ON lr.patient_id = p.id
                 JOIN doctors d ON lr.doctor_id = d.id
                 JOIN patient_nurse_assignments pna ON p.id = pna.patient_id
                 WHERE pna.nurse_id = $1 AND lr.status IN ('ordered', 'processing')
                 ORDER BY lr.created_at DESC`,
                [nurse_id]
            );
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch tests' });
        }
    },

    // Nurse uploads results
    uploadResult: async (req, res) => {
        try {
            const { id } = req.params;
            const { result_summary } = req.body;
            const nurse_id = req.user.id;
            const file_url = req.file ? `http://localhost:5000/${req.file.path.replace(/\\/g, '/')}` : null;

            const result = await pool.query(
                `UPDATE lab_results 
                 SET result_summary = $1, file_url = $2, nurse_id = $3, status = 'ready', collected_at = CURRENT_TIMESTAMP
                 WHERE id = $4 RETURNING *`,
                [result_summary, file_url, nurse_id, id]
            );

            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: 'Failed to upload results' });
        }
    },

    // Get results for a patient
    getPatientResults: async (req, res) => {
        try {
            const patient_id = req.user.id;
            const result = await pool.query(
                `SELECT lr.*, d.full_name as doctor_name, n.full_name as nurse_name, h.name as hospital_name
                 FROM lab_results lr
                 LEFT JOIN doctors d ON lr.doctor_id = d.id
                 LEFT JOIN nurses n ON lr.nurse_id = n.id
                 LEFT JOIN hospitals h ON lr.hospital_id = h.id
                 WHERE lr.patient_id = $1
                 ORDER BY lr.created_at DESC`,
                [patient_id]
            );
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch results' });
        }
    },

    // Get results for a specific patient (for doctors/nurses)
    getResultsByPatient: async (req, res) => {
        try {
            const { patient_id } = req.params;
            const result = await pool.query(
                `SELECT lr.*, d.full_name as doctor_name, n.full_name as nurse_name
                 FROM lab_results lr
                 LEFT JOIN doctors d ON lr.doctor_id = d.id
                 LEFT JOIN nurses n ON lr.nurse_id = n.id
                 WHERE lr.patient_id = $1
                 ORDER BY lr.created_at DESC`,
                [patient_id]
            );
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Failed' });
        }
    }
};

module.exports = labController;
