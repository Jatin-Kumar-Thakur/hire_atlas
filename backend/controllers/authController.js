const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail, forgotPasswordTemplate } = require('../utils/sendEmail');

/**
 * POST /api/auth/register
 * Creates a new user account and returns a JWT.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
        errors: [{ field: 'email', message: 'Email is already registered' }],
      });
    }

    const user = await User.create({ name: name.trim(), email, password });
    const token = user.generateJWT();

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Validates credentials and returns a JWT.
 * Uses an identical error message for both wrong email and wrong password
 * to prevent user enumeration attacks.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const INVALID = 'Invalid email or password';

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: INVALID });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: INVALID });
    }

    const token = user.generateJWT();

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 * Requires auth middleware — req.user is populated from JWT payload.
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/forgot-password
 * Generates a reset token and emails a reset link.
 * Always returns success regardless of whether the email exists —
 * this prevents attackers from discovering registered accounts.
 */
const forgotPassword = async (req, res, next) => {
  try {
    const SUCCESS_MSG =
      'If an account with that email exists, a password reset link has been sent.';

    const user = await User.findOne({ email: req.body.email.toLowerCase().trim() });
    if (!user) {
      return res.json({ success: true, message: SUCCESS_MSG });
    }

    // Generate a cryptographically random raw token; store only its SHA-256 hash
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request — HireAtlas',
        html: forgotPasswordTemplate({ userName: user.name, resetUrl }),
      });
    } catch {
      // If the email fails, clear the stored token so the user can retry
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save({ validateBeforeSave: false });
      return next(new Error('Email could not be sent. Please try again later.'));
    }

    res.json({ success: true, message: SUCCESS_MSG });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/reset-password/:token
 * Validates the reset token and sets the new password.
 */
const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired.',
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save(); // pre-save hook re-hashes the new password

    res.json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };
