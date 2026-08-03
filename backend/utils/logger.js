const winston = require('winston');

// Redact sensitive fields (passwords, tokens, credentials) from server log outputs
const sanitizeLog = winston.format((info) => {
  if (typeof info.message === 'object' && info.message !== null) {
    delete info.message.password;
    delete info.message.token;
    delete info.message.refreshToken;
    delete info.message.creditCard;
    delete info.message.secret;
  }
  return info;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    sanitizeLog(),
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

module.exports = logger;
