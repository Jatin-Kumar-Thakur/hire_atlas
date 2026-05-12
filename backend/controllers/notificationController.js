const Notification = require('../models/Notification');

/**
 * GET /api/notifications
 * Returns notifications for the current user, newest first.
 * Optional query: ?unreadOnly=true
 */
const getNotifications = async (req, res, next) => {
  try {
    const query = { userId: req.user.id };
    if (req.query.unreadOnly === 'true') query.isRead = false;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('applicationId', 'company role status')
        .lean(),
      Notification.countDocuments({ userId: req.user.id, isRead: false }),
    ]);

    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true },
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/notifications/:id
 */
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };
