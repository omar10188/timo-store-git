const logger = require('./logger');

/**
 * Log Security & Admin Audit events
 * @param {string} action - Event type e.g. USER_LOGIN, PASSWORD_RESET, ADMIN_ACTION
 * @param {object} details - Metadata including userId, ip, changes
 */
const logAuditEvent = (action, details = {}) => {
  logger.info({
    type: 'AUDIT_EVENT',
    action,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

module.exports = logAuditEvent;
