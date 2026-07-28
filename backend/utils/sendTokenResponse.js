const jwt = require("jsonwebtoken");
const config = require("../config");
const { successResponse } = require("./apiResponse");

const sendTokenResponse = async (user, statusCode, res, message) => {
  // 1. Generate Tokens
  const accessToken = jwt.sign({ id: user._id }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpire,
  });

  const refreshToken = jwt.sign({ id: user._id }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpire,
  });

  // 2. Save refresh token in DB (for rotation/revocation)
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // 3. Set cookie options (Secure HTTP-Only)
  const cookieAge = config.jwt.cookieExpire * 24 * 60 * 60 * 1000;
  const options = {
    expires: new Date(Date.now() + cookieAge),
    maxAge: cookieAge,
    httpOnly: true,
    secure: config.env === "production",
    sameSite: "strict",
    path: "/",
  };

  // 4. Attach cookie and send response
  res.cookie("refreshToken", refreshToken, options);
  
  return successResponse(res, { accessToken }, message, statusCode);
};

module.exports = sendTokenResponse;
