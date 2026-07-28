const bcrypt = require("bcryptjs");
const User = require("../models/User");
const sendTokenResponse = require("../utils/sendTokenResponse");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const asyncHandler = require("../middleware/asyncHandler");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next({ statusCode: 400, message: "Name, email, and password are required" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next({ statusCode: 400, message: "User already exists" });
  }

  // Password hashing is handled by User model pre-save hook
  const user = await User.create({
    name,
    email,
    password,
    role: "user", // Enforce standard user role on registration
  });

  const verificationToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${req.protocol}://${req.get("host")}/api/auth/verify-email/${verificationToken}`;
  const message = `Verify your email by clicking this link:\n\n${verifyUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Email Verification",
      message: message,
    });

    res.status(201).json({
      success: true,
      message: "Verification email sent",
    });
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next({ statusCode: 500, message: "Email could not be sent" });
  }
});

// @desc    Login user & get tokens
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next({ statusCode: 400, message: "Email and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return next({ statusCode: 401, message: "Invalid email or password" });
  }

  if (!user.emailVerified) {
    // UX Improvement: Resend verification email
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${req.protocol}://${req.get("host")}/api/auth/verify-email/${verificationToken}`;
    const message = `Verify your email by clicking this link:\n\n${verifyUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Email Verification",
        message: message,
      });
    } catch (error) {
      // If email fails, we don't necessarily want to crash, but we can log it
      // For now we'll just fall through to the 403 response.
    }

    return res.status(403).json({
      success: false,
      message: "Verification email resent. Please check your inbox.",
    });
  }

  // Use the new centralized secure token responder (generates both tokens + cookie)
  await sendTokenResponse(user, 200, res, "Login successful");
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  const config = require("../config");

  if (!refreshToken) {
    return next({ statusCode: 401, message: "No refresh token provided" });
  }

  // Clear cookie helper options
  const clearCookieOptions = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: config.env === "production",
    sameSite: "strict",
    path: "/",
  };

  try {
    const decoded = require("jsonwebtoken").verify(refreshToken, config.jwt.refreshSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      res.cookie("refreshToken", "", clearCookieOptions);
      return next({ statusCode: 401, message: "Invalid refresh token" });
    }

    // Security Check: Token Reuse Detection
    if (user.refreshToken !== refreshToken) {
      // Attack detected! Clear the DB token to log out all devices immediately
      user.refreshToken = null;
      await user.save({ validateBeforeSave: false });
      res.cookie("refreshToken", "", clearCookieOptions);
      return next({ statusCode: 403, message: "Security Warning: Token reuse detected. All sessions terminated." });
    }

    // Token is valid and matches DB. Rotate tokens!
    await sendTokenResponse(user, 200, res, "Token refreshed successfully");

  } catch (error) {
    res.cookie("refreshToken", "", clearCookieOptions);
    return next({ statusCode: 401, message: "Invalid or expired refresh token" });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getProfile = asyncHandler(async (req, res, next) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
});

// @desc    Logout user & clear refresh token
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res, next) => {
  // 1. Remove refresh token from database without an extra query
  if (req.user) {
    req.user.refreshToken = null;
    await req.user.save({ validateBeforeSave: false });
  }

  // 2. Clear the HTTP-only cookie with matching exact options
  const config = require("../config");
  res.cookie("refreshToken", "", {
    expires: new Date(Date.now() + 10 * 1000), // Expire in 10 seconds
    httpOnly: true,
    secure: config.env === "production",
    sameSite: "strict",
    path: "/",
  });

  // Using the apiResponse util from Phase 1
  const { successResponse } = require("../utils/apiResponse");
  return successResponse(res, null, "Logged out successfully");
});

// @desc    Verify email token
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired verification token",
    });
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
});

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${resetToken}`;

  const message = `Reset your password using this link:\n\n${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });

  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(err);
  }
});

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired reset token",
    });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
});

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  getProfile,
  logoutUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
