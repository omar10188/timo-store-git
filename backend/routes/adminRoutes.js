const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require("../controllers/adminController");
const {
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

// All admin routes require authentication + admin role
router.use(protect, admin);

// Dashboard
router.get("/stats", getDashboardStats);

// Users
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// Orders (admin view)
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);

module.exports = router;
