const PatientModel = require('../models/patientModel');
const CareTeamModel = require('../models/careTeamModel');
const NurseModel = require('../models/nurseModel');
const NotificationModel = require('../models/notificationModel');

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
    if (!patient || patient.doctor_id != doctorId) {
      return res.status(404).json({ error: 'Patient not found or not assigned to you' });
    }

    // Set status to active/monitoring as per FR14
    await PatientModel.updateStatus(id, 'ACTIVE'); // Or 'monitoring' based on preference
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

// FR16, FR17, FR30: Allocate nurses to patients
const assignNurse = async (req, res) => {
  const { patientId, nurseId } = req.body;
  const doctorId = req.user.id;
  try {
    const patient = await PatientModel.findById(patientId);
    const nurse = await NurseModel.findById(nurseId);

    if (!patient || !nurse) return res.status(404).json({ error: 'Patient or Nurse not found' });
    if (patient.doctor_id != doctorId) return res.status(403).json({ error: 'You are not the primary doctor for this patient' });

    // FR17: Restricted to nurses of the same hospital
    if (patient.hospital_id != nurse.hospital_ids[0]) { // Simplified check for first hospital
        // Real check: overlap between nurse.hospital_ids and patient.hospital_id
        const isSameHospital = nurse.hospital_ids.includes(patient.hospital_id);
        if (!isSameHospital) return res.status(400).json({ error: 'Nurse must be from the same hospital' });
    }

    await CareTeamModel.assignNurse(patientId, nurseId, doctorId);
    
    await NotificationModel.create({
      user_id: nurseId,
      user_role: 'nurse',
      title: 'New Patient Assigned',
      message: `Dr. ${req.user.name || 'Your Doctor'} has assigned you to care for ${patient.full_name}.`,
      type: 'info'
    });

    res.json({ message: 'Nurse assigned to patient successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign nurse' });
  }
};

module.exports = {
  getPendingPatients,
  approvePatient,
  rejectPatient,
  getMyPatients,
  assignNurse
};
