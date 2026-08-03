const config = require('../config');

/**
 * Strict Production-Grade Exact Origin Match & CSRF Defense Middleware
 * Enforces strict exact URL matching against allowed domains list
 */
const csrfProtection = (req, res, next) => {
  // Allow safe read-only methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Exempt Stripe raw webhook endpoint (which uses its own cryptographic signature check)
  if (req.originalUrl === '/api/payments/webhook') {
    return next();
  }

  const originHeader = req.headers.origin || req.headers.referer;

  // Strict check: Reject state-mutating request if origin header is missing in production
  if (!originHeader) {
    if (config.env === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Blocked by CSRF protection: Missing required Origin/Referer header.',
      });
    }
    return next();
  }

  // Extract base origin (protocol + domain + port)
  let cleanOrigin = '';
  try {
    const parsedUrl = new URL(originHeader);
    cleanOrigin = parsedUrl.origin;
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Blocked by CSRF protection: Malformed request origin.',
    });
  }

  // Exact Match Allowlist
  const allowedOrigins = [
    config.clientUrl?.replace(/\/$/, ''),
    process.env.CLIENT_URL?.replace(/\/$/, ''),
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ].filter(Boolean);

  const isExactMatch = allowedOrigins.some((allowed) => allowed === cleanOrigin);

  if (!isExactMatch) {
    return res.status(403).json({
      success: false,
      message: 'Blocked by CSRF protection: Untrusted request origin.',
    });
  }

  next();
};

module.exports = csrfProtection;
