const errorHandler = (err, req, res, next) => {
  console.error(err); // يطبع الخطأ في التيرمنال

  res.status(err.status || 500).json({
    message: err.message || "Server Error",
  });
};

module.exports = errorHandler;