const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    return next({
      statusCode: 400,
      message: error.errors.map((err) => err.message).join(", "),
    });
  }
};

module.exports = validate;
