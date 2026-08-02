const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getDashboardStats,
  getAdminOrders,
  getAdminOrderById,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getEmailSettings,
  updateEmailSettings,
} = require("../controllers/adminController");
const { updateOrderStatus } = require("../controllers/orderController");

// All admin routes require authentication + admin role
router.use(protect, authorize("admin"));

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get("/stats", getDashboardStats);

// ─── Orders ───────────────────────────────────────────────────────────────────
// GET /api/admin/orders?status=pending&search=omar&page=1&limit=20
router.get("/orders", getAdminOrders);
// GET /api/admin/orders/:id
router.get("/orders/:id", getAdminOrderById);
// PATCH /api/admin/orders/:id  (update status + note)
router.patch("/orders/:id", updateOrderStatus);

// ─── Users ────────────────────────────────────────────────────────────────────
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

// ─── Settings ─────────────────────────────────────────────────────────────────
router.get("/email-settings", getEmailSettings);
router.put("/email-settings", updateEmailSettings);

module.exports = router;
