const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

module.exports = (app) => {
  app.use(helmet());

  app.use(cors({
    origin: "http://localhost:3000"
  }));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  });

  app.use(limiter);
};