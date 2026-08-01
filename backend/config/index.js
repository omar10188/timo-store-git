require("dotenv").config();

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Environment variable ${envVar} is missing!`);
  }
}

module.exports = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  db: {
    uri: process.env.MONGO_URI,
  },
  jwt: {
    accessSecret: process.env.JWT_SECRET,
    accessExpire: process.env.JWT_EXPIRE || "15m",
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || "7d",
    cookieExpire: parseInt(process.env.JWT_COOKIE_EXPIRE || "7", 10), // Days
  },
};
