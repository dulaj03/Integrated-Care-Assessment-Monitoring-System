const CareTeamModel = require('../models/careTeamModel');
const PatientModel = require('../models/patientModel');
const HealthLogModel = require('../models/healthLogModel');
const pool = require('../config/db');

// Access only their patients
const getAssignedPatients = async (req, res) => {
  const nurseId = req.user.id;
  try {
    const patients = await CareTeamModel.getPatientsByNurseId(nurseId);
    res.json(patients);
  } catch (error) {
    console.error('[getAssignedPatients Error]', error);
    res.status(500).json({ error: 'Failed to fetch assigned patients' });
  }
};

// Access health logs and status indicators
const getPatientDetails = async (req, res) => {
  const { id: patientId } = req.params;
  const nurseId = req.user.id;
  try {
    const patients = await CareTeamModel.getPatientsByNurseId(nurseId);
    const assigned = patients.find(p => p.id == patientId);
    if (!assigned) {
      return res.status(403).json({ error: 'Not authorized for this patient' });
    }

    const patient = await PatientModel.findById(patientId);
    const logs = await HealthLogModel.findAllByPatientId(patientId);
    
    res.json({ patient, logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient details' });
  }
};

const createHealthLog = async (req, res) => {
    const { patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, symptoms, notes } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO health_logs (patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, symptoms, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, JSON.stringify(symptoms), notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create health log' });
    }
};

const createShiftReport = async (req, res) => {
    const { patient_id, title, summary, recommendations, steps, vitals_snapshot } = req.body;
    const nurse_id = req.user.id;
    try {
        const result = await pool.query(
            `INSERT INTO nurse_reports (patient_id, nurse_id, title, summary, recommendations, steps, vitals_snapshot)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [patient_id, nurse_id, title, summary, recommendations, JSON.stringify(steps), JSON.stringify(vitals_snapshot)]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create shift report' });
    }
};

const getPatientReports = async (req, res) => {
    const { patientId } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM nurse_reports WHERE patient_id = $1 ORDER BY created_at DESC',
            [patientId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
};

// Get clinical orders for a patient (nurse read-only view)
const getPatientOrders = async (req, res) => {
    const { patientId } = req.params;
    try {
        const result = await pool.query(
            `SELECT co.*, d.full_name as doctor_name 
             FROM clinical_orders co
             LEFT JOIN doctors d ON co.doctor_id = d.id
             WHERE co.patient_id = $1 
             ORDER BY co.created_at DESC`,
            [patientId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

// Get clinical notes for a patient (nurse read-only view)
const getPatientNotes = async (req, res) => {
    const { patientId } = req.params;
    try {
        const result = await pool.query(
            `SELECT cn.*, d.full_name as doctor_name
             FROM clinical_notes cn
             LEFT JOIN doctors d ON cn.doctor_id = d.id
             WHERE cn.patient_id = $1
             ORDER BY cn.created_at DESC`,
            [patientId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
};

// Get health logs for a patient (nurse view)
const getPatientHealthLogs = async (req, res) => {
    const { patientId } = req.params;
    try {
        const logs = await HealthLogModel.findAllByPatientId(patientId);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch health logs' });
    }
};

module.exports = {
  getAssignedPatients,
  getPatientDetails,
  createHealthLog,
  createShiftReport,
  getPatientReports,
  getPatientOrders,
  getPatientNotes,
  getPatientHealthLogs,
  getPatientLabResults: async (req, res) => {
      const { patientId } = req.params;
      try {
          const result = await pool.query(
              `SELECT l.*, h.name as hospital_name 
               FROM lab_results l 
               JOIN hospitals h ON l.hospital_id = h.id 
               WHERE l.patient_id = $1 ORDER BY l.created_at DESC`,
              [patientId]
          );
          res.json(result.rows);
      } catch (error) {
          res.status(500).json({ error: 'Failed to fetch lab results' });
      }
  }
};
