const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { createCheckoutSession, stripeWebhook } = require("../controllers/paymentController");

// The webhook route is mapped in server.js before express.json()
// Using just "/" here because it's mounted as "/api/payments/webhook" in server.js
router.post("/", stripeWebhook);

// Protected routes
router.use(protect);
router.post("/checkout-session", createCheckoutSession);

module.exports = router;
