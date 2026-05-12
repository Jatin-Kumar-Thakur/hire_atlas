const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
  },
  type: {
    type: String,
    enum: ['follow_up_reminder', 'interview_reminder', 'status_update', 'general'],
    default: 'general',
  },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  isRead:  { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
