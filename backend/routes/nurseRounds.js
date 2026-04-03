const express = require('express');
const router = express.Router();
const nursingTaskController = require('../controllers/nursingTaskController');
const { verifyToken } = require('../middleware/authMiddleware');

// Nurse Routes
router.post('/create', verifyToken, nursingTaskController.createTask);
router.get('/my-rounds', verifyToken, nursingTaskController.getRounds);
router.put('/step/complete/:step_id', verifyToken, nursingTaskController.completeStep);

// Patient & Doctor Routes
router.get('/patient/:patient_id', verifyToken, nursingTaskController.getPatientTasks);
router.post('/finalize/:task_id', verifyToken, nursingTaskController.finalizeRound);

module.exports = router;
