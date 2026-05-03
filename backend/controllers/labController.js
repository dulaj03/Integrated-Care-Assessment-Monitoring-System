const pool = require('../config/db');
const PatientModel = require('../models/patientModel');
const DoctorModel = require('../models/doctorModel');
const HospitalModel = require('../models/hospitalModel');
const emailService = require('../utils/emailService');

const labController = {
  // Doctor orders a test
  orderTest: async (req, res) => {
    try {
      console.log('Incoming Lab Order Request Body:', req.body);
      const { patient_id, test_name, test_type, hospital_id } = req.body;
      const doctor_id = req.user.id;
            
      if (!patient_id || !test_name) {
        return res.status(400).json({ error: 'Missing required fields (patient_id or test_name)' });
      }

      const result = await pool.query(
        `INSERT INTO lab_results (patient_id, doctor_id, hospital_id, test_name, test_type, status)
                 VALUES ($1, $2, $3, $4, $5, 'ordered') RETURNING *`,
        [patient_id, doctor_id, hospital_id, test_name, test_type]
      );

      // Notify assigned nurses and patient
      try {
        const NotificationModel = require('../models/notificationModel');
        const CareTeamModel = require('../models/careTeamModel');
        
        // 1. Notify Patient
        await NotificationModel.create({
          user_id: patient_id,
          user_role: 'patient',
          title: 'Official Lab Order',
          message: `Dr. ${req.user.full_name || 'Your Doctor'} has ordered a ${test_name} (${test_type}).`,
          type: 'info'
        });

        // 2. Notify Nurses
        const assignedNurses = await CareTeamModel.getNursesByPatientId(patient_id);
        const patientData = await PatientModel.findById(patient_id);
                
        for (const nurse of assignedNurses) {
          await NotificationModel.create({
            user_id: nurse.id,
            user_role: 'nurse',
            title: 'New Lab Request',
            message: `Doctor has ordered a ${test_name} (${test_type}) for ${patientData.full_name}.`,
            type: 'info'
          });
        }
      } catch (notifyErr) {
        console.warn('Failed to send notifications for lab order:', notifyErr);
        // Don't fail the order if notification fails
      }

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Order test failed:', error);
      res.status(500).json({ 
        error: 'Failed to order test', 
        details: error.message,
        hint: 'Check if hospital_id exists in hospitals table and if all required fields are provided'
      });
    }
  },

  // Get tests for a nurse (assigned to them via assignments)
  getNursePendingTests: async (req, res) => {
    try {
      const nurse_id = req.user.id;
            
      // First, get the nurse's hospital_id(s)
      const nurseRes = await pool.query('SELECT hospital_ids FROM nurses WHERE id = $1', [nurse_id]);
      const hospital_ids = nurseRes.rows[0]?.hospital_ids || [];

      if (hospital_ids.length === 0) {
        return res.json([]);
      }

      // Fetch ALL pending tests in those hospitals
      const result = await pool.query(
        `SELECT lr.*, p.full_name as patient_name, d.full_name as doctor_name
                 FROM lab_results lr
                 JOIN patients p ON lr.patient_id = p.id
                 JOIN doctors d ON lr.doctor_id = d.id
                 WHERE lr.hospital_id = ANY($1::int[]) AND lr.status IN ('ordered', 'processing')
                 ORDER BY lr.created_at DESC`,
        [hospital_ids]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('getNursePendingTests failed:', error);
      res.status(500).json({ error: 'Failed to fetch tests' });
    }
  },

  // Nurse uploads results
  uploadResult: async (req, res) => {
    try {
      const { id } = req.params;
      const { result_summary } = req.body;
      const nurse_id = req.user.id;
      const baseUrl = process.env.FRONTEND_URL || 'https://icams.pandanlabs.net';
      const file_url = req.file ? `${baseUrl}/api/${req.file.path.replace(/\\/g, '/')}` : null;

      const result = await pool.query(
        `UPDATE lab_results 
                 SET result_summary = $1, file_url = $2, nurse_id = $3, status = 'ready', collected_at = CURRENT_TIMESTAMP
                 WHERE id = $4 RETURNING *`,
        [result_summary, file_url, nurse_id, id]
      );

      const labResult = result.rows[0];

      // Send Email Notifications
      try {
        const patient = await PatientModel.findById(labResult.patient_id);
        const doctor = await DoctorModel.findById(labResult.doctor_id);
        const hospital = await HospitalModel.findById(labResult.hospital_id);
              
        const recipients = [];
        if (patient && patient.email) recipients.push(patient.email);
        if (doctor && doctor.email) recipients.push(doctor.email);

        if (recipients.length > 0) {
          await emailService.sendLabResultNotification(
            recipients,
            patient.full_name,
            labResult.test_name,
            hospital.name || 'I-CAMS Network'
          );
        }
      } catch (emailErr) {
        console.error('[Email Error] Failed to send lab result notification:', emailErr);
      }

      res.json(labResult);
    } catch (error) {
      console.error('Upload result failed:', error);
      res.status(500).json({ error: 'Failed to upload results' });
    }
  },

  // Get results for a patient
  getPatientResults: async (req, res) => {
    try {
      const patientId = req.user.id;
      const result = await pool.query(
        `SELECT l.*, h.name as hospital_name 
               FROM lab_results l 
               LEFT JOIN hospitals h ON l.hospital_id = h.id 
               WHERE l.patient_id = $1 ORDER BY l.created_at DESC`,
        [patientId]
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch patient results' });
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
  },

  // Doctor reviews a test result
  reviewResult: async (req, res) => {
    try {
      const { id } = req.params;
      const { review_note } = req.body;
            
      const result = await pool.query(
        `UPDATE lab_results 
                 SET review_note = $1, status = 'reviewed' 
                 WHERE id = $2 RETURNING *`,
        [review_note, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Lab result not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Review failed:', error);
      res.status(500).json({ error: 'Failed to finalize review' });
    }
  },

  // Get all results for doctor/nurse dashboard
  getAllResults: async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT lr.*, p.full_name as patient_name, h.name as hospital_name, d.full_name as doctor_name
                 FROM lab_results lr
                 JOIN patients p ON lr.patient_id = p.id
                 LEFT JOIN hospitals h ON lr.hospital_id = h.id
                 LEFT JOIN doctors d ON lr.doctor_id = d.id
                 ORDER BY lr.created_at DESC`
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Fetch all results failed:', error);
      res.status(500).json({ error: 'Failed to fetch results' });
    }
  }
};

module.exports = labController;
