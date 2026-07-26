const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { createCheckoutSession, stripeWebhook } = require("../controllers/paymentController");

// Webhook must be public and needs raw body (handled in server.js usually)
router.post("/webhook", express.raw({ type: 'application/json' }), stripeWebhook);

// Protected routes
router.use(protect);
router.post("/checkout-session", createCheckoutSession);

module.exports = router;
