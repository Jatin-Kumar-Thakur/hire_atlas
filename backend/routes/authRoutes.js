const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

const passwordRules = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
];

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    ...passwordRules,
  ],
  validate,
  register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

// GET /api/auth/me  (protected)
router.get('/me', auth, getMe);

// GET /api/auth/verify-token — used by Chrome extension to validate stored JWT
router.get('/verify-token', auth, (req, res) => {
  res.json({
    success: true,
    user: { id: req.user.id, email: req.user.email },
  });
});

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Please provide a valid email address')],
  validate,
  forgotPassword
);

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', passwordRules, validate, resetPassword);

module.exports = router;
