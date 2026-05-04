const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');

router.get('/', hospitalController.getAllHospitals);
router.get('/:id', hospitalController.getHospitalById);
router.get('/:hospital_id/doctors', hospitalController.getDoctorsByHospital);
router.get('/:hospital_id/patients', hospitalController.getPatientsByHospital);

module.exports = router;
