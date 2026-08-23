const Notification = require('../Models/Notification');

// @desc    Get user & driver notifications
// @route   GET /api/notifications
// @access  Private / Public
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;

    const query = userId
      ? { $or: [{ targetUser: userId }, { targetUser: null }] }
      : {};

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      ...query,
      read: false
    });

    res.json({
      success: true,
      unreadCount,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private / Public
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a custom alert notification
// @route   POST /api/notifications
// @access  Private (Admin)
const createNotification = async (req, res, next) => {
  try {
    const { title, message, targetUser, type } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const notification = await Notification.create({
      title,
      message,
      targetUser: targetUser || null,
      type: type || 'info'
    });

    res.status(201).json({
      success: true,
      notification
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  createNotification
};
