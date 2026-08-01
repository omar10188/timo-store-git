const express = require("express");
const router = express.Router();
const { protect, optionalAuth, authorize } = require("../middleware/authMiddleware");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

// Public/Guest Order Creation
router.post("/", optionalAuth, createOrder);

// Protected routes
router.get("/my-orders", protect, getMyOrders);
router.get("/", protect, authorize("admin"), getOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/status", protect, authorize("admin"), updateOrderStatus);

module.exports = router;
