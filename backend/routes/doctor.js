const express = require('express');
const router = express.Router();
const {
  getPendingPatients,
  approvePatient,
  rejectPatient,
  getMyPatients,
  assignNurse
} = require('../controllers/doctorController');
const { verifyDoctorToken } = require('../middleware/authMiddleware');

router.use(verifyDoctorToken);

router.get('/patients/pending', getPendingPatients);
router.post('/patients/approve/:id', approvePatient);
router.post('/patients/reject/:id', rejectPatient);
router.get('/patients', getMyPatients);
router.post('/patients/assign-nurse', assignNurse);

module.exports = router;
