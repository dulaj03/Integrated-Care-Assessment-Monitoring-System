const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

const { verifyToken } = require('../middleware/authMiddleware');

// All messages need user authentication
router.use(verifyToken);

router.post('/send', messageController.sendMessage);
router.get('/conversations', messageController.getConversations);
router.get('/contacts', messageController.getAvailableContacts);
router.get('/:other_role/:other_id', messageController.getMessages);

module.exports = router;
