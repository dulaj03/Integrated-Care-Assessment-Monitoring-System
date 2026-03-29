const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { verifyToken, verifyPatientToken } = require('../middleware/authMiddleware');

// Book (Patient)
router.post('/book', verifyPatientToken, appointmentController.createAppointment);

// Update (Doctor/Hospital/Nurse) 
router.patch('/status/:id', verifyToken, (req, res, next) => {
    // Custom check for multiple roles who can approve
    if (req.user && (req.user.role === 'doctor' || req.user.role === 'hospital' || req.user.role === 'nurse')) {
        next();
    } else {
        res.status(403).json({ error: 'Access denied' });
    }
}, appointmentController.updateStatus);

// Get My Appointments (Any role)
router.get('/my', verifyToken, appointmentController.getMyAppointments);

module.exports = router;
