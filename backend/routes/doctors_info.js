const express = require('express');
const router = express.Router();
const { getAllDoctors, getDoctorHospitals } = require('../controllers/doctorController');

router.get('/', getAllDoctors);
router.get('/:id/hospitals', getDoctorHospitals);

module.exports = router;
