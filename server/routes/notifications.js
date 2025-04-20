import express from 'express';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get notifications for a user
router.get('/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId }).sort({ timestamp: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve notifications.' });
  }
});

export default router;
