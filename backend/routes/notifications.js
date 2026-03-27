const express = require('express');
const router = express.Router();
const NotificationModel = require('../models/notificationModel');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

// FR35: System will enable users to read notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await NotificationModel.findByUser(req.user.id, req.user.role);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.post('/mark-read/:id', async (req, res) => {
  try {
    await NotificationModel.markAsRead(req.params.id);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

module.exports = router;
