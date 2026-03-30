const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const { verifyToken } = require('../middleware/authMiddleware');

// All lab results need user authentication
router.use(verifyToken);

// Upload (Hospital)
router.post('/upload', labController.uploadResult);

// Get Results (Any role who can see results)
router.get('/my', labController.getResults);

// Update Status (Hospital/Doctor)
const authUpdate = (req, res, next) => {
    if (req.user.role === 'hospital' || req.user.role === 'doctor') next();
    else res.status(403).json({ error: 'Only hospitals or doctors can update results' });
};
router.put('/:id', authUpdate, labController.updateStatus);
router.patch('/:id', authUpdate, labController.updateStatus);

module.exports = router;
