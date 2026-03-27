const pool = require('../config/db');
const NotificationModel = require('../models/NotificationModel');

const labController = {
    // Hospital: Upload Lab Result
    uploadResult: async (req, res) => {
        try {
            const { patient_id, test_name, test_type, result_summary, result_data, file_url, doctor_id } = req.body;
            const hospital_id = req.user.id;

            const results = await pool.query(
                `INSERT INTO lab_results (patient_id, hospital_id, doctor_id, test_name, test_type, result_summary, result_data, file_url)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                [patient_id, hospital_id, doctor_id, test_name, test_type, result_summary, JSON.stringify(result_data), file_url]
            );

            // Notify Patient
            await NotificationModel.create({
                user_id: patient_id,
                user_role: 'patient',
                title: 'Lab Result Ready!',
                message: `Your ${test_name} result from ${req.user.name || 'Hospital'} is ready for review.`
            });

            // Notify Doctor if assigned
            if (doctor_id) {
                await NotificationModel.create({
                    user_id: doctor_id,
                    user_role: 'doctor',
                    title: 'New Lab result for patient',
                    message: `Patient under your care has a new lab result: ${test_name}.`
                });
            }

            res.status(201).json(results.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Upload failed' });
        }
    },

    // Patient/Doctor/Nurse: View Lab Results
    getResults: async (req, res) => {
        try {
            const { id, role } = req.user;
            let query;
            if (role === 'patient') {
                query = `SELECT l.*, h.name as hospital_name, d.full_name as doctor_name 
                         FROM lab_results l 
                         JOIN hospitals h ON l.hospital_id = h.id 
                         JOIN doctors d ON l.doctor_id = d.id 
                         WHERE l.patient_id = $1 ORDER BY l.created_at DESC`;
            } else if (role === 'doctor') {
                // Doctor needs to see results for patients assigned to them (or specifically for them)
                query = `SELECT l.*, p.full_name as patient_name, h.name as hospital_name 
                         FROM lab_results l 
                         JOIN patients p ON l.patient_id = p.id 
                         JOIN hospitals h ON l.hospital_id = h.id 
                         WHERE l.doctor_id = $1 ORDER BY l.created_at DESC`;
            } else {
                // Nurse/Hospital logic
                query = `SELECT l.*, p.full_name as patient_name 
                         FROM lab_results l 
                         JOIN patients p ON l.patient_id = p.id 
                         WHERE l.hospital_id = $1 ORDER BY l.created_at DESC`;
            }
            const results = await pool.query(query, [id]);
            res.json(results.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Fetch failed' });
        }
    },

    // Update Status (Hospital/Doctor)
    updateStatus: async (req, res) => {
        try {
            const { status, result_summary, result_data } = req.body;
            const test_id = req.params.id;

            const updateFields = [];
            const values = [];
            let i = 1;

            if (status) {
                updateFields.push(`status = $${i++}`);
                values.push(status);
            }
            if (result_summary) {
                updateFields.push(`result_summary = $${i++}`);
                values.push(result_summary);
            }
            if (result_data) {
                updateFields.push(`result_data = $${i++}`);
                values.push(JSON.stringify(result_data));
            }

            if (updateFields.length === 0) return res.status(400).json({ error: 'No fields to update' });

            values.push(test_id);
            const query = `UPDATE lab_results SET ${updateFields.join(', ')} WHERE id = $${i} RETURNING *`;
            const results = await pool.query(query, values);

            res.json(results.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Update failed' });
        }
    }
};

module.exports = labController;
