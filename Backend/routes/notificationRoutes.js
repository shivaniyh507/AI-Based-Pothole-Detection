const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  createNotification
} = require('../controllers/notificationController');

// Get notifications & create notification
router.route('/')
  .get(getNotifications)
  .post(createNotification);

// Mark notification as read
router.put('/:id/read', markAsRead);

module.exports = router;
