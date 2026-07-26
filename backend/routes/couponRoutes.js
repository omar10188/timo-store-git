const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} = require("../controllers/couponController");

// All routes require authentication
router.use(protect);

// User validation route
router.post("/validate", validateCoupon);

// Admin only routes
router.use(admin);

router.route("/")
  .post(createCoupon)
  .get(getCoupons);

router.route("/:id")
  .get(getCouponById)
  .put(updateCoupon)
  .delete(deleteCoupon);

module.exports = router;
