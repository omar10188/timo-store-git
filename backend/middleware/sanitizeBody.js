/**
 * Factory middleware to whitelist allowed request body fields
 * Prevents Mass-Assignment / Over-posting attacks
 */
const whitelistFields = (allowedFields = []) => (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return next();

  const sanitizedBody = {};
  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      sanitizedBody[field] = req.body[field];
    }
  });

  req.body = sanitizedBody;
  next();
};

module.exports = whitelistFields;
