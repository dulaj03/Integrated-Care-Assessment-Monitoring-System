const HealthLogModel = require('../models/healthLogModel');
const PatientModel = require('../models/patientModel');
const NotificationModel = require('../models/notificationModel');
const CareTeamModel = require('../models/careTeamModel');

const createHealthLog = async (req, res) => {
  const { patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, symptoms, notes } = req.body;

  if (!patient_id) {
    return res.status(400).json({ error: 'Patient ID is required' });
  }

  try {
    const newLog = await HealthLogModel.create({
      patient_id,
      systolic_bp,
      diastolic_bp,
      heart_rate,
      temperature,
      oxygen_level,
      mood,
      symptoms: symptoms || [],
      notes
    });

    // --- Threshold Detection (FR25, FR26) ---
    let isCritical = false;
    const reasons = [];

    if (systolic_bp > 150 || diastolic_bp > 100) { reasons.push('High BP'); isCritical = true; }
    if (heart_rate > 110) { reasons.push('Tachycardia'); isCritical = true; }
    if (oxygen_level < 92) { reasons.push('Hypoxia'); isCritical = true; }
    if (temperature > 38.5) { reasons.push('High Fever'); isCritical = true; }

    if (isCritical) {
      // Update patient condition to critical
      await PatientModel.updateCondition(patient_id, 'critical');

      // Prepare notification details
      const patient = await PatientModel.findById(patient_id);
      const title = `Critical Condition Alert: ${reasons.join(', ')}`;
      const message = `Patient ${patient.full_name}'s vitals have exceeded thresholds: BP ${systolic_bp}/${diastolic_bp}, HR ${heart_rate}, O2 ${oxygen_level}%, Temp ${temperature}°C.`;

      // Notify Patient
      await NotificationModel.create({
        user_id: patient_id, user_role: 'patient', title, message: 'Your vitals indicate a critical condition. Your care team has been notified.', type: 'critical'
      });

      // Notify Doctor
      if (patient.doctor_id) {
        await NotificationModel.create({
          user_id: patient.doctor_id, user_role: 'doctor', title, message, type: 'critical'
        });
      }

      // Notify Assigned Nurses (FR22)
      const nurses = await CareTeamModel.getNursesByPatientId(patient_id);
      for (const nurse of nurses) {
        await NotificationModel.create({
           user_id: nurse.id, user_role: 'nurse', title, message, type: 'critical'
        });
      }
    } else {
      // If not critical, ensure condition is 'monitoring' or 'stable'
      const patient = await PatientModel.findById(patient_id);
      if (patient.condition === 'critical') {
        await PatientModel.updateCondition(patient_id, 'monitoring'); // Downgrade alert
      }
    }

    res.status(201).json(newLog);
  } catch (error) {
    console.error('Error creating health log:', error);
    res.status(500).json({ error: 'Server error creating health log' });
  }
};

const getLatestHealthLog = async (req, res) => {
  const { patient_id } = req.params;

  try {
    const log = await HealthLogModel.findLatestByPatientId(patient_id);
    if (!log) {
      return res.status(404).json({ error: 'No health logs found for this patient' });
    }
    res.json(log);
  } catch (error) {
    console.error('Error fetching latest health log:', error);
    res.status(500).json({ error: 'Server error fetching health log' });
  }
};

const getAllHealthLogs = async (req, res) => {
  const { patient_id } = req.params;

  try {
    const logs = await HealthLogModel.findAllByPatientId(patient_id);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching health logs:', error);
    res.status(500).json({ error: 'Server error fetching health logs' });
  }
};

module.exports = {
  createHealthLog,
  getLatestHealthLog,
  getAllHealthLogs
};
