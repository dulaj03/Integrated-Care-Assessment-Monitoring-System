const PatientModel = require('../models/patientModel');
const CareTeamModel = require('../models/careTeamModel');
const NurseModel = require('../models/nurseModel');
const NotificationModel = require('../models/notificationModel');
const pool = require('../config/db');
const HospitalModel = require('../models/hospitalModel');
const DoctorModel = require('../models/doctorModel');

// FR12: Get registration requests of patients pending approval
const getPendingPatients = async (req, res) => {
  const doctorId = req.user.id;
  try {
    const patients = await PatientModel.findByDoctorId(doctorId);
    const pending = patients.filter(p => p.status === 'pendingdoctorapproval');
    res.json(pending);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending patients' });
  }
};

// FR13, FR14: Approve or reject patient registration
const approvePatient = async (req, res) => {
  const { id } = req.params;
  const doctorId = req.user.id;
  try {
    const patient = await PatientModel.findById(id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Assign the doctor and set status to active
    await PatientModel.updateDoctor(id, doctorId);
    await PatientModel.updateStatus(id, 'ACTIVE'); 
    await PatientModel.updateCondition(id, 'monitoring');

    await NotificationModel.create({
      user_id: id,
      user_role: 'patient',
      title: 'Registration Approved',
      message: 'Your doctor has approved your registration. You are now being monitored.',
      type: 'info'
    });

    res.json({ message: 'Patient approved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve patient' });
  }
};

const rejectPatient = async (req, res) => {
  const { id } = req.params;
  try {
    await PatientModel.updateStatus(id, 'REJECTED');
    res.json({ message: 'Patient rejected' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject patient' });
  }
};

// FR15: Get all assigned patients
const getMyPatients = async (req, res) => {
  const doctorId = req.user.id;
  try {
    const patients = await PatientModel.findByDoctorId(doctorId);
    const activePatients = patients.filter(p => p.status === 'ACTIVE' || p.status === 'MONITORING' || p.status === 'CRITICAL');
    
    // Enrich with nurse info if needed
    const enriched = await Promise.all(activePatients.map(async p => {
      const nurses = await CareTeamModel.getNursesByPatientId(p.id);
      return { ...p, nurses };
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
};

// Allocate nurses to patients
const assignNurse = async (req, res) => {
  const { patientId, nurseId } = req.body;
  const doctorId = req.user.id;
  try {
    const patient = await PatientModel.findById(patientId);
    const nurse = await pool.query('SELECT * FROM nurses WHERE id = $1', [nurseId]);

    if (!patient || nurse.rows.length === 0) return res.status(404).json({ error: 'Patient or Nurse not found' });
    
    // Check if same hospital
    const nurseData = nurse.rows[0];
    const isSameHospital = nurseData.hospital_ids.includes(patient.hospital_id);
    if (!isSameHospital) return res.status(400).json({ error: 'Nurse must be from the same hospital' });

    await CareTeamModel.assignNurse(patientId, nurseId, doctorId);
    
    await NotificationModel.create({
      user_id: nurseId,
      user_role: 'nurse',
      title: 'New Patient Assigned',
      message: `Dr. ${req.user.name || 'Your Doctor'} has assigned you to care for ${patient.full_name}.`,
      type: 'info'
    });

    res.json({ message: 'Nurse assigned successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign nurse' });
  }
};

const getNursesForAssignment = async (req, res) => {
    try {
        const { hospital_id } = req.query;
        let query = 'SELECT id, full_name as name, email, qualification, years_of_experience FROM nurses WHERE status = \'ACTIVE\'';
        let params = [];
        if (hospital_id) {
            query += ' AND $1 = ANY(hospital_ids)';
            params.push(hospital_id);
        }
        const results = await pool.query(query, params);
        res.json(results.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch nurses' });
    }
};

// Clinical Orders
const createClinicalOrder = async (req, res) => {
    const { patient_id, order_type, description, details } = req.body;
    const doctor_id = req.user.id;
    try {
        const result = await pool.query(
            `INSERT INTO clinical_orders (patient_id, doctor_id, order_type, description, details)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [patient_id, doctor_id, order_type, description, details]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Order creation failed' });
    }
};

const getPatientOrders = async (req, res) => {
    const { patientId } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM clinical_orders WHERE patient_id = $1 ORDER BY created_at DESC',
            [patientId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

// Clinical Notes
const createClinicalNote = async (req, res) => {
    const { patient_id, assessment, plan, request_to_nurse } = req.body;
    const doctor_id = req.user.id;
    try {
        const result = await pool.query(
            `INSERT INTO clinical_notes (patient_id, doctor_id, assessment, plan, request_to_nurse)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [patient_id, doctor_id, assessment, plan, request_to_nurse]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Note creation failed' });
    }
};

const getPatientNotes = async (req, res) => {
    const { patientId } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM clinical_notes WHERE patient_id = $1 ORDER BY created_at DESC',
            [patientId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
};

const updatePatientCondition = async (req, res) => {
    const { id } = req.params;
    const { condition } = req.body;
    try {
        await PatientModel.updateCondition(id, condition);
        res.json({ message: 'Condition updated' });
    } catch (error) {
        res.status(500).json({ error: 'Update failed' });
    }
};

// Get all active doctors (for patient booking flow)
const getAllDoctors = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, full_name, email, specialization, years_of_experience,
                    institution_name, hospital_ids, status
             FROM doctors
             WHERE status = 'ACTIVE'
             ORDER BY full_name ASC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('[getAllDoctors Error]', error);
        res.status(500).json({ error: 'Failed to fetch doctors' });
    }
};

// Get hospitals associated with a specific doctor
const getDoctorHospitals = async (req, res) => {
    const { id } = req.params;
    try {
        const doctor = await DoctorModel.findById(id);
        if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

        const hospitalIds = doctor.hospital_ids || [];
        if (hospitalIds.length === 0) return res.json([]);

        const result = await pool.query(
            `SELECT id, name, address, phone, type
             FROM hospitals
             WHERE id = ANY($1::int[])`,
            [hospitalIds]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('[getDoctorHospitals Error]', error);
        res.status(500).json({ error: 'Failed to fetch doctor hospitals' });
    }
};

// Get nurse shift reports for a patient (doctor view - read-only)
const getPatientReportsByDoctor = async (req, res) => {
    const { patientId } = req.params;
    try {
        const result = await pool.query(
            `SELECT nr.*, n.full_name as nurse_name
             FROM nurse_reports nr
             LEFT JOIN nurses n ON nr.nurse_id = n.id
             WHERE nr.patient_id = $1
             ORDER BY nr.created_at DESC`,
            [patientId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('[getPatientReportsByDoctor Error]', error);
        res.status(500).json({ error: 'Failed to fetch nurse reports' });
    }
};

module.exports = {
  getPendingPatients,
  approvePatient,
  rejectPatient,
  getMyPatients,
  assignNurse,
  getNursesForAssignment,
  createClinicalOrder,
  getPatientOrders,
  createClinicalNote,
  getPatientNotes,
  updatePatientCondition,
  getDoctorHospitals,
  getAllDoctors,
  getPatientReportsByDoctor
};
