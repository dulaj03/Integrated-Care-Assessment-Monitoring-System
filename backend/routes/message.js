const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// All messages need user authentication
router.use((req, res, next) => {
    if (req.user) next();
    else res.status(401).json({ error: 'Unauthorized' });
});

router.post('/send', messageController.sendMessage);
router.get('/conversations', messageController.getConversations);
router.get('/:other_role/:other_id', messageController.getMessages);

module.exports = router;
