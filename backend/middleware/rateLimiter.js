const rateLimit = require("express-rate-limit");
const { errorResponse } = require("../utils/apiResponse");

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per 15 min (prevents 429 on Promise.all batch calls)
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, "Too Many Requests", "Too many requests from this IP, please try again after 15 minutes", 429);
  },
});

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to max 5 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, "Too Many Requests", "Too many authentication attempts. Max 5 attempts per minute.", 429);
  },
});

module.exports = { globalLimiter, authLimiter };
