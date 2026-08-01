const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return next({ statusCode: 401, message: "Not authorized, no token" });
    }

    const config = require("../config");
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    
    // JWT payload now only has { id }
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next({ statusCode: 401, message: "Not authorized, user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    next({ statusCode: 401, message: "Not authorized, token failed" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next({
        statusCode: 403,
        message: `User role '${req.user ? req.user.role : "undefined"}' is not authorized to access this route`,
      });
    }
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    }

    if (token) {
      const config = require("../config");
      const decoded = jwt.verify(token, config.jwt.accessSecret);
      const user = await User.findById(decoded.id).select("-password");
      if (user) {
        req.user = user;
      }
    }
  } catch {
    // Ignore invalid token for guest fallback
  }
  next();
};

module.exports = { protect, optionalAuth, authorize };
