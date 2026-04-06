const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { verifyOptionalToken } = require('../middleware/authMiddleware');

// Route for AI Chat (Guest or Logged patient)
router.post('/chat', verifyOptionalToken, aiController.chat);

module.exports = router;
