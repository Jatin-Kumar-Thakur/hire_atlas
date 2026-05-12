const jwt = require('jsonwebtoken');

/**
 * Verifies the Bearer JWT present in the Authorization header.
 * Attaches the decoded payload to req.user so downstream handlers
 * can identify the caller without re-decoding the token.
 *
 * JWT_SECRET must be at least 32 random characters — generate one with:
 *   openssl rand -hex 32
 */
const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. A valid Authorization header is required.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = auth;
