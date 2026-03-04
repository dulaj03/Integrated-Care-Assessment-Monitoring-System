const express = require('express');
const router = express.Router();
const {
  createHealthLog,
  getLatestHealthLog,
  getAllHealthLogs
} = require('../controllers/healthController');

// All health log routes
router.post('/log', createHealthLog);
router.get('/latest/:patient_id', getLatestHealthLog);
router.get('/all/:patient_id', getAllHealthLogs);

module.exports = router;
