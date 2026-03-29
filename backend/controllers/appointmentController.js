const pool = require('../config/db');
const notificationModel = require('../models/notificationModel');

const appointmentController = {
    // Patient: Book an appointment
    createAppointment: async (req, res) => {
        try {
            const { doctor_id, hospital_id, appointment_date, appointment_time, reason } = req.body;
            const patient_id = req.user.id; // From verifyToken

            const results = await pool.query(
                `INSERT INTO appointments (patient_id, doctor_id, hospital_id, appointment_date, appointment_time, reason, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [patient_id, doctor_id, hospital_id, appointment_date, appointment_time, reason, 'requested']
            );

            // Notify Hospital
            await NotificationModel.create({
                user_id: hospital_id,
                user_role: 'hospital',
                title: 'New Appointment Booking',
                message: `Patient has requested a consultation at your facility for ${appointment_date}.`
            });

            res.status(201).json(results.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to create appointment' });
        }
    },

    // Doctor/Hospital: Update appointment status
    updateStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, doctor_notes } = req.body;

            const results = await pool.query(
                `UPDATE appointments SET status = $1, doctor_notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
                [status, doctor_notes, id]
            );

            if (results.rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });

            const appt = results.rows[0];

            // Specialized Notifications
            if (status === 'hospital_approved') {
                // Notify Doctor
                await NotificationModel.create({
                    user_id: appt.doctor_id,
                    user_role: 'doctor',
                    title: 'Appointment Pending Your Confirmation',
                    message: `Hospital has approved a request for ${appt.appointment_date}. Please confirm.`
                });
            } else if (status === 'confirmed') {
                // Notify Patient
                await NotificationModel.create({
                    user_id: appt.patient_id,
                    user_role: 'patient',
                    title: 'Appointment Fully Confirmed',
                    message: `Dr. ${req.user.full_name || 'Sarah'} has confirmed your meeting on ${appt.appointment_date}.`
                });
            }

            res.json(appt);
        } catch (error) {
            res.status(500).json({ error: 'Update failed' });
        }
    },

    // Get appointments for a specific user
    getMyAppointments: async (req, res) => {
        try {
            const { id, role } = req.user;
            let query;
            if (role === 'patient') {
                query = `SELECT a.*, d.full_name as doctor_name, h.name as hospital_name 
                         FROM appointments a 
                         JOIN doctors d ON a.doctor_id = d.id 
                         JOIN hospitals h ON a.hospital_id = h.id 
                         WHERE a.patient_id = $1 ORDER BY a.appointment_date DESC`;
            } else if (role === 'doctor') {
                query = `SELECT a.*, p.full_name as patient_name, h.name as hospital_name 
                         FROM appointments a 
                         JOIN patients p ON a.patient_id = p.id 
                         JOIN hospitals h ON a.hospital_id = h.id 
                         WHERE a.doctor_id = $1 ORDER BY a.appointment_date DESC`;
            } else if (role === 'hospital') {
                query = `SELECT a.*, p.full_name as patient_name, d.full_name as doctor_name 
                         FROM appointments a 
                         JOIN patients p ON a.patient_id = p.id 
                         JOIN doctors d ON a.doctor_id = d.id 
                         WHERE a.hospital_id = $1 ORDER BY a.appointment_date DESC`;
            } else {
                return res.status(403).json({ error: 'Unauthorized role' });
            }
            const results = await pool.query(query, [id]);
            res.json(results.rows);
        } catch (error) {
            res.status(500).json({ error: 'Fetch failed' });
        }
    }
};

module.exports = appointmentController;
