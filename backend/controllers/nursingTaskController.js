const pool = require('../config/db');
const PatientModel = require('../models/patientModel');
const DoctorModel = require('../models/doctorModel');
const HospitalModel = require('../models/hospitalModel');
const emailService = require('../utils/emailService');

const nursingTaskController = {
    // Create a new task with initial milestones
    createTask: async (req, res) => {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Auth session expired' });
        }
        
        const client = await pool.connect();
        try {
            const { title, task_type, patient_id, hospital_id, doctor_id, steps, lab_test_id } = req.body;
            const nurse_id = req.user.id;

            console.log('👷 START ROUND TRANSACTION:', { title, patient_id, nurse_id, hospital_id, lab_test_id });

            if (!patient_id || !hospital_id) {
                return res.status(400).json({ error: 'Data integrity error: Missing patient or hospital reference' });
            }

            await client.query('BEGIN');

            const taskRes = await client.query(
                `INSERT INTO nursing_tasks (title, task_type, patient_id, nurse_id, doctor_id, hospital_id, status, lab_test_id)
                 VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7) RETURNING *`,
                [
                    title || task_type, 
                    task_type, 
                    parseInt(patient_id), 
                    parseInt(nurse_id), 
                    doctor_id ? parseInt(doctor_id) : null, 
                    parseInt(hospital_id),
                    lab_test_id ? parseInt(lab_test_id) : null
                ]
            );

            // Update linked test status
            if (lab_test_id) {
                await client.query(
                    "UPDATE lab_results SET status = 'processing' WHERE id = $1",
                    [lab_test_id]
                );
            }

            const taskId = taskRes.rows[0].id;
            console.log(`✅ Task [${taskId}] created successfully. Inserting steps...`);

            // Insert steps sequentially
            if (steps && steps.length > 0) {
                for (let i = 0; i < steps.length; i++) {
                    await client.query(
                        `INSERT INTO nursing_task_steps (task_id, step_name, sort_order, status)
                         VALUES ($1, $2, $3, 'pending')`,
                        [taskId, steps[i], i]
                    );
                }
            }

            await client.query('COMMIT');
            console.log(`🎉 Round Workflow [${taskId}] fully initialized.`);
            res.status(201).json(taskRes.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ CRITICAL: Create round task failed:', error);
            console.error('ERROR CODE:', error.code);
            console.error('ERROR DETAIL:', error.detail);
            console.error('ERROR HINT:', error.hint);
            res.status(500).json({ 
                error: 'Internal Server Error during round initiation',
                details: error.message,
                pg_code: error.code
            });
        } finally {
            client.release();
        }
    },

    // Get tasks based on role (Nurse sees their tasks, Doctor sees their assigned rounds)
    getRounds: async (req, res) => {
        try {
            const userId = req.user.id;
            const role = req.user.role; // Assuming role is in token payload

            let query = `
                SELECT nt.*, p.full_name as patient_name, d.full_name as doctor_name,
                        (SELECT json_agg(nts.* ORDER BY sort_order) 
                         FROM nursing_task_steps nts WHERE nts.task_id = nt.id) as steps
                 FROM nursing_tasks nt
                 JOIN patients p ON nt.patient_id = p.id
                 LEFT JOIN doctors d ON nt.doctor_id = d.id
            `;

            let params = [userId];
            if (role === 'nurse') {
                query += " WHERE nt.nurse_id = $1";
            } else if (role === 'doctor') {
                query += " WHERE nt.doctor_id = $1";
            } else if (role === 'patient') {
                query += " WHERE nt.patient_id = $1";
            } else {
                return res.status(403).json({ error: 'Unauthorized role access' });
            }

            query += " ORDER BY nt.created_at DESC";
            
            const result = await pool.query(query, params);
            res.json(result.rows);
        } catch (error) {
            console.error('Fetch rounds failed:', error);
            res.status(500).json({ error: 'Failed to fetch rounds' });
        }
    },

    // Get tasks for a specific patient (Doctor/Nurse/Patient)
    getPatientTasks: async (req, res) => {
        try {
            const { patient_id } = req.params;
            const result = await pool.query(
                `SELECT nt.*, n.full_name as nurse_name, d.full_name as doctor_name,
                        (SELECT json_agg(nts.* ORDER BY sort_order) 
                         FROM nursing_task_steps nts WHERE nts.task_id = nt.id) as steps
                 FROM nursing_tasks nt
                 LEFT JOIN nurses n ON nt.nurse_id = n.id
                 LEFT JOIN doctors d ON nt.doctor_id = d.id
                 WHERE nt.patient_id = $1
                 ORDER BY nt.created_at DESC`,
                [patient_id]
            );
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch patient tasks' });
        }
    },

    // Complete a step
    completeStep: async (req, res) => {
        try {
            const { step_id } = req.params;
            const { notes } = req.body;

            const stepRes = await pool.query(
                `UPDATE nursing_task_steps 
                 SET status = 'completed', completed_at = CURRENT_TIMESTAMP, notes = $1
                 WHERE id = $2 RETURNING *`,
                [notes, step_id]
            );

            if (stepRes.rowCount === 0) return res.status(404).json({ error: 'Step not found' });

            const taskId = stepRes.rows[0].task_id;

            // Check if all steps are completed
            const checkRes = await pool.query(
                "SELECT count(*) as total, count(*) FILTER (WHERE status = 'completed') as completed FROM nursing_task_steps WHERE task_id = $1",
                [taskId]
            );

            let newStatus = 'in_progress';
            if (parseInt(checkRes.rows[0].total) === parseInt(checkRes.rows[0].completed)) {
                newStatus = 'completed';
            }

            await pool.query(
                "UPDATE nursing_tasks SET status = $1, current_step = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
                [newStatus, checkRes.rows[0].completed, taskId]
            );

            res.json({ 
                message: 'Step completed', 
                step: stepRes.rows[0], 
                task_status: newStatus,
                is_last_step: parseInt(checkRes.rows[0].total) === parseInt(checkRes.rows[0].completed)
            });
        } catch (error) {
            console.error('Update step failed:', error);
            res.status(500).json({ error: 'Failed' });
        }
    },

    finalizeRound: async (req, res) => {
        const client = await pool.connect();
        try {
            const { task_id } = req.params;
            const { result_summary, result_file } = req.body;
            const nurse_id = req.user.id;

            await client.query('BEGIN');

            const result = await client.query(
                `UPDATE nursing_tasks 
                 SET status = 'completed', result_summary = $1, result_file = $2, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $3 RETURNING *`,
                [result_summary, result_file, task_id]
            );

            if (result.rowCount === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Round not found' });
            }

            const task = result.rows[0];

            // Send Email Notifications
            try {
              const patient = await PatientModel.findById(task.patient_id);
              const doctor = await DoctorModel.findById(task.doctor_id);
              const hospital = await HospitalModel.findById(task.hospital_id);
              
              const recipients = [];
              if (patient && patient.email) recipients.push(patient.email);
              if (doctor && doctor.email) recipients.push(doctor.email);

              if (recipients.length > 0) {
                await emailService.sendLabResultNotification(
                  recipients,
                  patient.full_name,
                  task.title || "Clinical Task Result",
                  hospital.name || "I-CAMS Network"
                );
              }
            } catch (emailErr) {
              console.error('[Email Error] Failed to send nursing task notification:', emailErr);
            }

            await client.query('COMMIT');
            res.json({ message: 'Round finalized and Lab Order updated successfully', task });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Finalize round failed:', error);
            res.status(500).json({ error: 'Finalization failed' });
        } finally {
            client.release();
        }
    }
};

module.exports = nursingTaskController;
