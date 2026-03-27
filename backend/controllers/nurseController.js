const CareTeamModel = require('../models/careTeamModel');
const PatientModel = require('../models/patientModel');
const HealthLogModel = require('../models/healthLogModel');

// FR20: Access only their patients
const getAssignedPatients = async (req, res) => {
  const nurseId = req.user.id;
  try {
    const patients = await CareTeamModel.getPatientsByNurseId(nurseId);
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assigned patients' });
  }
};

// FR21: Access health logs and status indicators
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

module.exports = {
  getAssignedPatients,
  getPatientDetails
};
