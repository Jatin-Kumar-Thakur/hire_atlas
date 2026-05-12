const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');

router.use(auth);

router.get('/',             getNotifications);
router.patch('/read-all',   markAllAsRead);       // must come before /:id
router.patch('/:id/read',   markAsRead);
router.delete('/:id',       deleteNotification);

module.exports = router;
