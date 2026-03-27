const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { verifyPatientToken, verifyDoctorToken, verifyHospitalToken, verifyNurseToken } = require('../middleware/authMiddleware');

// Book (Patient)
router.post('/book', verifyPatientToken, appointmentController.createAppointment);

// Update (Doctor/Hospital/Nurse) 
router.patch('/status/:id', (req, res, next) => {
    // Custom check for multiple roles who can approve
    if (req.user.role === 'doctor' || req.user.role === 'hospital' || req.user.role === 'nurse') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied' });
    }
}, appointmentController.updateStatus);

// Get My Appointments (Any role)
router.get('/my', (req, res, next) => {
    if (req.user) next();
    else res.status(401).json({ error: 'Unauthorized' });
}, appointmentController.getMyAppointments);

module.exports = router;
