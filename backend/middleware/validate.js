const { validationResult } = require('express-validator');

/**
 * Reads results from express-validator check() / body() chains that ran before this middleware.
 * Returns a structured 400 response listing every failing field so the client
 * can display per-field error messages without additional parsing.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }

  next();
};

module.exports = validate;
