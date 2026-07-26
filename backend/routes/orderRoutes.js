const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

// All order routes require authentication
router.use(protect);

router.route("/")
  .post(createOrder)
  .get(admin, getOrders); // Admin only

router.get("/my-orders", getMyOrders);

router.route("/:id")
  .get(getOrderById);

router.route("/:id/status")
  .put(admin, updateOrderStatus); // Admin only

module.exports = router;
