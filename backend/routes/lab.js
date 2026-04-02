const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');

// Doctor routes
router.post('/order', verifyToken, labController.orderTest);
router.get('/patient/:patient_id', verifyToken, labController.getResultsByPatient);
router.put('/review/:id', verifyToken, labController.reviewResult);

// Nurse routes
router.get('/pending', verifyToken, labController.getNursePendingTests);
router.put('/upload/:id', verifyToken, upload.single('profile_picture'), labController.uploadResult); // Reuse profile_picture for now or add result_file

// Patient routes
router.get('/my-results', verifyToken, labController.getPatientResults);

module.exports = router;
