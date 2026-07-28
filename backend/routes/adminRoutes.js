const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require("../controllers/adminController");
const {
  getOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

// Dashboard - Applied to ONE route only as requested
router.get("/stats", protect, authorize("admin"), getDashboardStats);

// Users
const { z } = require("zod");
const validate = require("../middleware/validateMiddleware");

const updateRoleSchema = z.object({
  body: z.object({
    role: z.enum(["user", "admin"], {
      required_error: "Role is required",
      invalid_type_error: "Role must be 'user' or 'admin'",
    }),
  }),
});

router.get("/users", getAllUsers);
router.put("/users/:id/role", validate(updateRoleSchema), updateUserRole);
router.delete("/users/:id", deleteUser);

// Orders (admin view)
router.get("/orders", getOrders);
router.put("/orders/:id/status", updateOrderStatus);

module.exports = router;
