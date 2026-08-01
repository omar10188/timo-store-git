const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validators/authValidator");
const { authLimiter } = require("../middleware/rateLimiter");
const { getCsrfToken } = require("../middleware/csrfMiddleware");

router.get("/csrf-token", getCsrfToken);
// test-email is admin-only to prevent public email spam abuse
router.get("/test-email", protect, authorize("admin"), testEmailEndpoint);
router.post("/register", authLimiter, validate(registerSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);
router.post("/refresh", refreshAccessToken);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.put("/reset-password/:token", validate(resetPasswordSchema), resetPassword);
router.get("/me", protect, getProfile);
router.post("/logout", protect, logoutUser);
router.post("/logout-all", protect, logoutAllDevices);

module.exports = router;
