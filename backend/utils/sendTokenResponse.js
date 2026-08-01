const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../config");
const { successResponse } = require("./apiResponse");
const { saveSession } = require("../services/sessionStore");

const sendTokenResponse = async (user, statusCode, res, message, req = null) => {
  // 1. Generate fresh AccessToken and RefreshToken (Strict Token Rotation)
  const accessToken = jwt.sign({ id: user._id }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpire,
  });

  const refreshToken = jwt.sign({ id: user._id }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpire,
  });

  // 2. Hash refresh token using SHA-256
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const cookieAge = config.jwt.cookieExpire * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + cookieAge);

  // 3. Save hashed session with fingerprint binding (Dual-tier: Redis / MongoDB)
  if (req) {
    await saveSession(user, tokenHash, expiresAt, req);
  }

  // 4. Set HTTP-Only Cookie with fresh raw refreshToken
  const options = {
    expires: expiresAt,
    maxAge: cookieAge,
    httpOnly: true,
    secure: config.env === "production",
    sameSite: config.env === "production" ? "strict" : "lax",
    path: "/",
  };

  res.cookie("refreshToken", refreshToken, options);

  return successResponse(
    res,
    {
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    message,
    statusCode
  );
};

module.exports = sendTokenResponse;
