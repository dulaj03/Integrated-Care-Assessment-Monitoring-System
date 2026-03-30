const express = require('express');
const router = express.Router();
const {
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
  getPatientReportsByDoctor,
  getPatientLabResults
} = require('../controllers/doctorController');
const { verifyDoctorToken } = require('../middleware/authMiddleware');

router.use(verifyDoctorToken);

router.get('/patients/pending', getPendingPatients);
router.post('/patients/approve/:id', approvePatient);
router.post('/patients/reject/:id', rejectPatient);
router.get('/patients', getMyPatients);
router.patch('/patients/condition/:id', updatePatientCondition);

router.get('/nurses', getNursesForAssignment);
router.post('/patients/assign-nurse', assignNurse);

router.post('/orders', createClinicalOrder);
router.get('/orders/:patientId', getPatientOrders);

router.post('/notes', createClinicalNote);
router.get('/notes/:patientId', getPatientNotes);

// Read nurse reports (doctor read-only access)
router.get('/nurse-reports/:patientId', getPatientReportsByDoctor);
router.get('/lab-results/:patientId', getPatientLabResults);

module.exports = router;
