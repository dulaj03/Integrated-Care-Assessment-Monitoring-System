const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');
const { verifyToken, verifyPatientToken } = require('../middleware/authMiddleware');

// Doctor: get/save own availability
router.get('/my', verifyToken, availabilityController.getMyAvailability);
router.post('/save', verifyToken, availabilityController.saveAvailability);

// Doctor: get/set own fees
router.get('/fees', verifyToken, availabilityController.getMyFees);
router.post('/fees', verifyToken, availabilityController.setFee);

// Public: get doctor availability for specific hospital (used during booking)
router.get('/doctor/:doctorId/hospital/:hospitalId', availabilityController.getDoctorAvailabilityForHospital);

// Public: get fee breakdown for booking preview
router.get('/fees/:doctorId/:hospitalId', availabilityController.getFeeBreakdown);

// Hospital: set/get facility fee
router.post('/hospital-fee', verifyToken, availabilityController.setHospitalFee);
router.get('/hospital-fee/:hospitalId', availabilityController.getHospitalFee);

// Admin: platform fee
router.get('/platform-fee', verifyToken, availabilityController.getPlatformFee);
router.post('/platform-fee', verifyToken, availabilityController.setPlatformFee);

// Admin/Cron: notify doctors who haven't updated schedule
router.post('/notify-doctors', verifyToken, availabilityController.notifyDoctorsToUpdateSchedule);

module.exports = router;
