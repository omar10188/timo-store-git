const fs = require("fs");
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  // Unlink/delete orphan uploaded file if request failed
  if (req.file && req.file.path) {
    fs.unlink(req.file.path, (unlinkErr) => {
      if (unlinkErr && logger && logger.error) {
        logger.error(`Failed to delete orphan uploaded file: ${unlinkErr.message}`);
      }
    });
  }

  let error = { ...err };
  error.message = err.message;
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let errors = [];

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'Field';
    error.message = `${field} already exists`;
    statusCode = 400;
  }

  // Mongoose CastError
  if (err.name === "CastError") {
    error.message = `Resource not found with id ${err.value}`;
    statusCode = 404;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    error.message = "Validation Error";
    errors = Object.values(err.errors || {}).map((val) => val.message);
    statusCode = 400;
  }
  
  // Zod validation error / General array of errors
  if (err.name === "ZodError" || (err.errors && Array.isArray(err.errors))) {
    error.message = "Validation Error";
    errors = (Array.isArray(err.errors) ? err.errors : []).map((e) => e.message || String(e));
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

  if (logger && logger.error) {
    if (errors.length > 0) {
      logger.error(`${error.message}: ${errors.join(', ')} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    } else {
      logger.error(`${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    }
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal Server Error",
    errors: errors.length > 0 ? errors : [error.message || "Server Error"],
  });
};

module.exports = errorHandler;
