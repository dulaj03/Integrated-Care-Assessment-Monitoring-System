const HealthLogModel = require('../models/healthLogModel');

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
