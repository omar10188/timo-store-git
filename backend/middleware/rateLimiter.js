const rateLimit = require("express-rate-limit");
const { errorResponse } = require("../utils/apiResponse");

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, "Too Many Requests", "Too many requests from this IP, please try again after 15 minutes", 429);
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to max 10 auth attempts per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, "Too Many Requests", "Too many authentication attempts. Max 10 attempts per 15 minutes.", 429);
  },
});

const createOrderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // Limit each IP to 20 order creation attempts per 10 mins
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, "Too Many Requests", "Too many order requests created from this IP. Please try again after 10 minutes.", 429);
  },
});

module.exports = { globalLimiter, authLimiter, createOrderLimiter };
