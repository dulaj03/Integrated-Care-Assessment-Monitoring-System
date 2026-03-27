const express = require('express');
const router = express.Router();
const {
  getAssignedPatients,
  getPatientDetails
} = require('../controllers/nurseController');
const { verifyNurseToken } = require('../middleware/authMiddleware');

router.use(verifyNurseToken);

router.get('/patients', getAssignedPatients);
router.get('/patients/:id/details', getPatientDetails);

module.exports = router;
