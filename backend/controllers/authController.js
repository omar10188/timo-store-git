const bcrypt = require("bcryptjs");
const User = require("../models/User");
const sendTokenResponse = require("../utils/sendTokenResponse");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next({ statusCode: 400, message: "User already exists" });
  }

  // In development, auto-verify users so registration always works
  const isDev = process.env.NODE_ENV !== "production";

  // Password hashing is handled by User model pre-save hook
  const user = await User.create({
    name,
    email,
    password,
    role: "user",
    emailVerified: isDev, // Auto-verify in development
  });

  // Only attempt to send verification email in production
  if (!isDev) {
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${req.protocol}://${req.get("host")}/api/auth/verify-email/${verificationToken}`;
    const message = `Verify your email by clicking this link:\n\n${verifyUrl}`;

    try {
      await sendEmail({ email: user.email, subject: "Email Verification", message });
      return successResponse(res, null, "Verification email sent. Please check your inbox.", 201);
    } catch (error) {
      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return next({ statusCode: 500, message: "Email could not be sent" });
    }
  }

  // Development: registration is complete, return success + auto-login
  const { sendWelcomeEmail } = require("../services/emailService");
  sendWelcomeEmail(user).catch(() => {}); // Non-blocking

  return successResponse(res, { id: user._id, name: user.name, email: user.email }, "Registration successful", 201);
});


// @desc    Login user & get tokens
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;


  const user = await User.findOne({ email }).select("+password");
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

    return errorResponse(res, "Forbidden", "Verification email resent. Please check your inbox.", 403);
  }

  // Use the new centralized secure token responder (generates both tokens + cookie)
  await sendTokenResponse(user, 200, res, "Login successful", req);
});

const {
  verifyAndRotateSession,
  destroySession,
  destroyAllSessions,
} = require("../services/sessionStore");

// @desc    Refresh access token (Strict Rotation + Device Fingerprint Verification)
// @route   POST /api/auth/refresh
// @access  Public
const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  const config = require("../config");

  if (!refreshToken) {
    return next({ statusCode: 401, message: "No refresh token provided" });
  }

  const clearCookieOptions = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: config.env === "production",
    sameSite: config.env === "production" ? "strict" : "lax",
    path: "/",
  };

  try {
    const decoded = require("jsonwebtoken").verify(refreshToken, config.jwt.refreshSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      res.cookie("refreshToken", "", clearCookieOptions);
      return next({ statusCode: 401, message: "Invalid refresh token" });
    }

    const incomingHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // Verify session & device fingerprint + Consume old token (Single-Use Token Rotation)
    const verification = await verifyAndRotateSession(user, incomingHash, req);

    if (!verification.valid) {
      res.cookie("refreshToken", "", clearCookieOptions);
      return next({
        statusCode: verification.reason === "FINGERPRINT_MISMATCH" ? 403 : 401,
        message: verification.message,
      });
    }

    // Issue brand new AccessToken + brand new RefreshToken (Rotated)
    await sendTokenResponse(user, 200, res, "Token refreshed successfully", req);
  } catch (error) {
    res.cookie("refreshToken", "", clearCookieOptions);
    return next({ statusCode: 401, message: "Invalid or expired refresh token" });
  }
});

// @desc    Get user profile & active sessions
// @route   GET /api/auth/me
// @access  Private
const getProfile = asyncHandler(async (req, res, next) => {
  const data = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    activeSessionsCount: req.user.sessions?.length || 0,
  };
  return successResponse(res, data, "Profile fetched successfully");
});

// @desc    Logout current device session
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (req.user && refreshToken) {
    const incomingHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await destroySession(req.user, incomingHash);
  }

  const config = require("../config");
  res.cookie("refreshToken", "", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: config.env === "production",
    sameSite: config.env === "production" ? "strict" : "lax",
    path: "/",
  });

  return successResponse(res, null, "Logged out successfully");
});

// @desc    Logout from all devices / invalidate all sessions
// @route   POST /api/auth/logout-all
// @access  Private
const logoutAllDevices = asyncHandler(async (req, res, next) => {
  if (req.user) {
    await destroyAllSessions(req.user);
  }

  const config = require("../config");
  res.cookie("refreshToken", "", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: config.env === "production",
    sameSite: config.env === "production" ? "strict" : "lax",
    path: "/",
  });

  return successResponse(res, null, "Logged out from all devices successfully");
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
    return errorResponse(res, "Bad Request", "Invalid or expired verification token", 400);
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;

  await user.save();

  return successResponse(res, null, "Email verified successfully", 200);
});

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return errorResponse(res, "Not Found", "User not found", 404);
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

    return successResponse(res, null, "Password reset email sent", 200);

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
    return errorResponse(res, "Bad Request", "Invalid or expired reset token", 400);
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return successResponse(res, null, "Password reset successful", 200);
});

// @desc    Test Email Delivery Endpoint
// @route   GET /api/auth/test-email
// @access  Public
const testEmailEndpoint = asyncHandler(async (req, res, next) => {
  const targetEmail = req.query.to || process.env.SMTP_EMAIL || "omar0122462356i@gmail.com";
  console.log("📧 Test Email requested for target:", targetEmail);

  await sendEmail({
    email: targetEmail,
    subject: "Timo Store - SMTP Test Email",
    message: "This is a test email from Timo Store backend to verify Nodemailer SMTP delivery.",
    html: "<h1>Timo Store SMTP Test</h1><p>This is a test email verifying that Gmail Nodemailer is working 100%.</p>",
  });

  return successResponse(res, { recipient: targetEmail }, "Test email sent successfully", 200);
});

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  getProfile,
  logoutUser,
  logoutAllDevices,
  verifyEmail,
  forgotPassword,
  resetPassword,
  testEmailEndpoint,
};
