const jwt = require("jsonwebtoken");
const config = require("../config");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpire,
  });
};

module.exports = generateToken;
