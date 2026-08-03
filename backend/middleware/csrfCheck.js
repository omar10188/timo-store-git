/**
 * Custom Header CSRF Verification Middleware
 * Verifies custom header on state-mutating requests (POST, PUT, DELETE, PATCH)
 * to ensure requests originate from our SPA client.
 */
const csrfCheck = (req, res, next) => {
  // Safe methods do not mutate state
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Exempt Stripe webhooks or public APIs if needed
  if (req.originalUrl.startsWith('/api/payments/webhook')) {
    return next();
  }

  const customHeader = req.headers['x-requested-with'] || req.headers['x-app-client'] || req.headers['authorization'];
  if (!customHeader && process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Missing required verification header',
    });
  }

  next();
};

module.exports = csrfCheck;
