const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  // Mongoose duplicate key (e.g. email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `${field} already exists`;
    statusCode = 400;
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === "CastError") {
    error.message = `Resource not found with id ${err.value}`;
    statusCode = 404;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    error.message = Object.values(err.errors).map((val) => val.message).join(", ");
    statusCode = 400;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error.message = "Invalid token. Please log in again.";
    statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    error.message = "Your token has expired. Please log in again.";
    statusCode = 401;
  }

  // Log the error using Winston (already setup)
  if (logger && logger.error) {
    logger.error(`${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    if (process.env.NODE_ENV !== "production") logger.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorHandler;