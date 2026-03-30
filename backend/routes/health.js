const express = require('express');
const router = express.Router();
const {
  createHealthLog,
  getLatestHealthLog,
  getAllHealthLogs,
  getPatientOrders,
  getNurseReports
} = require('../controllers/healthController');
const { verifyToken } = require('../middleware/authMiddleware');

// All health log routes — protected
router.use(verifyToken);
router.post('/log', createHealthLog);
router.get('/latest/:patient_id', getLatestHealthLog);
router.get('/all/:patient_id', getAllHealthLogs);
router.get('/orders/:patient_id', getPatientOrders);
router.get('/nurse-reports/:patient_id', getNurseReports);
// Alias used by PatientWorkspace (frontend calls /api/health/logs/:id)
router.get('/logs/:patient_id', getAllHealthLogs);

module.exports = router;
