const express = require('express');
const router = express.Router();
const {
  getAssignedPatients,
  getPatientDetails,
  createHealthLog,
  createShiftReport,
  getPatientReports,
  getPatientOrders,
  getPatientNotes,
  getPatientHealthLogs,
  getPatientLabResults
} = require('../controllers/nurseController');
const { verifyNurseToken } = require('../middleware/authMiddleware');

router.use(verifyNurseToken);

router.get('/patients', getAssignedPatients);
router.get('/patients/:id/details', getPatientDetails);

router.post('/logs', createHealthLog);
router.get('/logs/:patientId', getPatientHealthLogs);
router.post('/reports', createShiftReport);
router.get('/reports/:patientId', getPatientReports);

// Read doctor orders and clinical notes (nurse read-only)
router.get('/orders/:patientId', getPatientOrders);
router.get('/notes/:patientId', getPatientNotes);
router.get('/lab-results/:patientId', getPatientLabResults);

module.exports = router;
