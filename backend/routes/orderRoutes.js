const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
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
  .get(authorize("admin"), getOrders); // Admin only

router.get("/my-orders", getMyOrders);

router.route("/:id")
  .get(getOrderById);

router.route("/:id/status")
  .put(authorize("admin"), updateOrderStatus); // Admin only

module.exports = router;
