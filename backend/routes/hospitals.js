const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');

router.get('/', hospitalController.getAllHospitals);
router.get('/:hospital_id/doctors', hospitalController.getDoctorsByHospital);

module.exports = router;
