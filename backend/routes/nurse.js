const express = require('express');
const router = express.Router();
const {
  getAssignedPatients,
  getPatientDetails,
  createHealthLog,
  createShiftReport,
  getPatientReports
} = require('../controllers/nurseController');
const { verifyNurseToken } = require('../middleware/authMiddleware');

router.use(verifyNurseToken);

router.get('/patients', getAssignedPatients);
router.get('/patients/:id/details', getPatientDetails);

router.post('/logs', createHealthLog);
router.post('/reports', createShiftReport);
router.get('/reports/:patientId', getPatientReports);

module.exports = router;
