const express = require("express");
const router = express.Router();
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

// GET cart is optional-auth: guests get an empty cart, authenticated users get their DB cart
router.get("/", optionalAuth, getCart);
// Mutation routes require authentication (guests use localStorage fallback on frontend)
router.post("/", protect, addToCart);
router.put("/:productId", protect, updateCartItem);
router.delete("/clear", protect, clearCart);
router.delete("/:productId", protect, removeFromCart);

module.exports = router;
