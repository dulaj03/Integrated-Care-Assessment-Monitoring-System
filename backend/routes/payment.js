const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken, verifyPatientToken } = require('../middleware/authMiddleware');

// Patient initiates payment
router.post('/initiate', verifyPatientToken, paymentController.initiatePayment);

// PayHere server-to-server notification (no auth – PayHere calls this)
router.post('/notify', paymentController.paymentNotify);

// Called when patient is redirected back from PayHere (return_url fallback)
router.post('/confirm-return/:appointmentId', verifyPatientToken, paymentController.confirmPaymentReturn);

// Get invoice for a specific appointment
router.get('/invoice/:appointmentId', verifyToken, paymentController.getInvoice);

// Admin: get all payments & stats
router.get('/all', verifyToken, paymentController.getAllPayments);
router.get('/stats', verifyToken, paymentController.getPaymentStats);

module.exports = router;
