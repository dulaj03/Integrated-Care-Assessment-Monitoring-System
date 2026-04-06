const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Public system stats
router.get('/stats', publicController.getStats);

// Contact form submission
router.post('/contact', publicController.submitContactForm);

// Hospital partnership request
router.post('/hospital-request', publicController.submitHospitalRequest);

module.exports = router;
