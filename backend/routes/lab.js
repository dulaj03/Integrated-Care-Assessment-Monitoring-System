const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const { verifyPatientToken, verifyDoctorToken, verifyHospitalToken, verifyNurseToken } = require('../middleware/authMiddleware');

// Upload (Hospital)
router.post('/upload', verifyHospitalToken, labController.uploadResult);

// Get Results (Any role who can see results)
router.get('/my', (req, res, next) => {
    if (req.user) next();
    else res.status(401).json({ error: 'Unauthorized' });
}, labController.getResults);

// Update Status (Hospital/Doctor)
router.put('/:id', (req, res, next) => {
    if (req.user && (req.user.role === 'hospital' || req.user.role === 'doctor')) next();
    else res.status(403).json({ error: 'Only hospitals or doctors can update results' });
}, labController.updateStatus);

module.exports = router;
