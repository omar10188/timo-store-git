const crypto = require("crypto");
const config = require("../config");
const { successResponse, errorResponse } = require("../utils/apiResponse");

/**
 * Generate CSRF token and set cookie
 */
const getCsrfToken = (req, res) => {
  const token = crypto.randomBytes(32).toString("hex");
  const cookieOptions = {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: config.env === "production" ? "strict" : "lax",
    path: "/",
  };

  res.cookie("_csrf", token, cookieOptions);
  return successResponse(res, { csrfToken: token }, "CSRF token generated successfully");
};

/**
 * Verify CSRF Token on state-mutating requests
 */
const verifyCsrfToken = (req, res, next) => {
  // Safe HTTP methods do not require CSRF validation
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Bypass for test environment if header isn't strict
  if (process.env.NODE_ENV === "test") {
    return next();
  }

  const cookieToken = req.cookies._csrf;
  const headerToken = req.headers["x-csrf-token"] || req.headers["x-xsrf-token"];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return errorResponse(res, "Forbidden", "Invalid or missing CSRF token", 403);
  }

  next();
};

module.exports = { getCsrfToken, verifyCsrfToken };
