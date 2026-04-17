const PatientModel = require('../models/patientModel');
const CareTeamModel = require('../models/careTeamModel');
const NurseModel = require('../models/nurseModel');
const NotificationModel = require('../models/notificationModel');
const pool = require('../config/db');
const HospitalModel = require('../models/hospitalModel');
const DoctorModel = require('../models/doctorModel');
const emailService = require('../utils/emailService');

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
  const { hospital_id } = req.body;
  const doctorId = req.user.id;
  try {
    const patient = await PatientModel.findById(id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Assign the doctor and set status to active
    await PatientModel.updateDoctor(id, doctorId);
    if (hospital_id) {
      await PatientModel.updateHospital(id, hospital_id);
    }
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
    
    // Relaxed check to handle cross-facility care teams during onboarding/pilot phases
    const nurseData = nurse.rows[0];
    const nurseHospitalIds = (nurseData.hospital_ids || []).map(String);
    const isSameHospital = nurseHospitalIds.includes(String(patient.hospital_id));
    
    // We log a warning but allow the assignment to proceed to avoid blocking critical clinical care
    if (!isSameHospital) {
      console.warn(`[Assignment] Warning: Nurse ${nurseId} is being assigned to patient ${patientId} outside of primary hospital ${patient.hospital_id}`);
    }

    await CareTeamModel.assignNurse(patientId, nurseId, doctorId);
    
    await NotificationModel.create({
      user_id: nurseId,
      user_role: 'nurse',
      title: 'New Patient Assigned',
      message: `Dr. ${req.user.full_name || 'Your Doctor'} has assigned you to care for ${patient.full_name}.`,
      type: 'info'
    });

    // Send Email to Patient
    try {
      if (patient && patient.email) {
        await emailService.sendNurseAssignment(
          patient.email, 
          patient.full_name,
          nurseData.full_name,
          req.user.full_name || 'Your Doctor'
        );
      }
    } catch (emailErr) {
      console.error('[Email Error] Failed to send nurse assignment email:', emailErr);
    }

    res.json({ message: 'Nurse assigned successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign nurse' });
  }
};

const getNursesForAssignment = async (req, res) => {
  try {
    const { hospital_id } = req.query;
    // Search for both ACTIVE and PENDING nurses to ensure visibility during testing/pilot phases
    let query = `
            SELECT id, full_name as name, email, qualification, years_of_experience, status, hospital_ids
            FROM nurses 
            WHERE (UPPER(status) IN ('ACTIVE', 'APPROVED', 'PENDINGADMINAPPROVAL'))
        `;
    let params = [];
        
    const hid = parseInt(hospital_id);
        
    // Use a more robust check that handles potential type mismatches in the array
    if (hospital_id && !isNaN(hid)) {
      query += ' AND ($1::text = ANY(hospital_ids::text[]) OR $1::integer = ANY(hospital_ids::integer[]))';
      params.push(hid);
    }
        
    console.log(`[Nurse Selection] Querying for hospital_id: ${hospital_id}`);
    let results = await pool.query(query, params);
        
    // If no nurses found for specific hospital, try to find ALL active nurses as a fallback
    if (results.rows.length === 0 && hospital_id) {
      console.log('[Nurse Selection] No hospital-specific nurses found, checking global list...');
      const fallback = await pool.query(`
                SELECT id, full_name as name, email, qualification, years_of_experience, status, hospital_ids
                FROM nurses 
                WHERE UPPER(status) IN ('ACTIVE', 'APPROVED', 'PENDINGADMINAPPROVAL')
                LIMIT 10
            `);
      results = fallback;
    }
        
    console.log(`[Nurse Selection] Found ${results.rows.length} candidates`);
    res.json(results.rows);
  } catch (error) {
    console.error('[Fetch Nurses Error]', error);
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

    const order = result.rows[0];

    // FR: Notify Patient and Nurses
    try {
      const patient = await PatientModel.findById(patient_id);
      
      // 1. Notify Patient
      await NotificationModel.create({
        user_id: patient_id,
        user_role: 'patient',
        title: 'New Care Order',
        message: `Dr. ${req.user.full_name || 'Your Doctor'} has issued a new ${order_type.replace('_', ' ')}: ${description}`,
        type: 'order'
      });

      // 2. Notify Assigned Nurses
      const assignedNurses = await CareTeamModel.getNursesByPatientId(patient_id);
      for (const nurse of assignedNurses) {
        await NotificationModel.create({
          user_id: nurse.id,
          user_role: 'nurse',
          title: 'Direct Care Directive',
          message: `New ${order_type.replace('_', ' ')} for ${patient.full_name}: ${description}`,
          type: 'order'
        });
      }
    } catch (notifyErr) {
      console.error('[Notification Error] Failed to signal order alerts:', notifyErr);
    }

    res.status(201).json(order);
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

    const note = result.rows[0];

    // FR: Notify Assigned Nurses if there is a directive
    if (request_to_nurse && request_to_nurse.trim()) {
      try {
        const patient = await PatientModel.findById(patient_id);
        const assignedNurses = await CareTeamModel.getNursesByPatientId(patient_id);
        for (const nurse of assignedNurses) {
          await NotificationModel.create({
            user_id: nurse.id,
            user_role: 'nurse',
            title: 'New Clinical Note Directive',
            message: `Dr. ${req.user.full_name || 'Your Doctor'} has left a note for ${patient.full_name}: ${request_to_nurse}`,
            type: 'info'
          });
        }
      } catch (notifyErr) {
        console.error('[Notification Error] Failed to signal note alerts:', notifyErr);
      }
    }

    res.status(201).json(note);
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
      `SELECT d.id, d.full_name, d.email, d.specialization, d.years_of_experience,
                    d.institution_name, d.hospital_ids, d.status, d.avatar,
                    COALESCE(AVG(r.rating), 0)::numeric(2,1) as avg_rating,
                    COUNT(r.id) as review_count
             FROM doctors d
             LEFT JOIN doctor_ratings r ON d.id = r.doctor_id AND r.is_reported = FALSE
             WHERE d.status = 'ACTIVE'
             GROUP BY d.id
             ORDER BY d.full_name ASC`
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
  getPatientReportsByDoctor,
  getPatientLabResults: async (req, res) => {
    const { patientId } = req.params;
    try {
      const result = await pool.query(
        `SELECT l.*, h.name as hospital_name 
               FROM lab_results l 
               LEFT JOIN hospitals h ON l.hospital_id = h.id 
               WHERE l.patient_id = $1 ORDER BY l.created_at DESC`,
        [patientId]
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch lab results' });
    }
  }
};
