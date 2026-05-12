const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication
router.use(auth);

// GET  /api/users/profile   — get current user's profile
router.get('/profile', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented — coming in Phase 1' });
});

// PUT  /api/users/profile   — update name, email, notification preferences
router.put('/profile', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented — coming in Phase 1' });
});

// PUT  /api/users/password  — change password
router.put('/password', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented — coming in Phase 1' });
});

// GET  /api/users/stats     — aggregated application counts for dashboard
router.get('/stats', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented — coming in Phase 4' });
});

module.exports = router;
