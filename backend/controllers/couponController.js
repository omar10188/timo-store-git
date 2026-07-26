const Coupon = require("../models/Coupon");

/**
 * POST /api/coupons/validate
 * Validate a coupon code — public endpoint (requires auth)
 * Body: { code, orderTotal }
 */
const validateCoupon = async (req, res, next) => {
  try {
    const { code, orderTotal = 0 } = req.body;

    if (!code) {
      const err = new Error("Coupon code is required");
      err.statusCode = 400;
      return next(err);
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      const err = new Error("Invalid coupon code");
      err.statusCode = 404;
      return next(err);
    }

    if (!coupon.isValid) {
      const err = new Error("This coupon has expired or is no longer active");
      err.statusCode = 400;
      return next(err);
    }

    if (orderTotal < coupon.minOrderValue) {
      const err = new Error(
        `Minimum order value for this coupon is ${coupon.minOrderValue}`
      );
      err.statusCode = 400;
      return next(err);
    }

    // Check if user already used this coupon
    if (coupon.usedBy.includes(req.user._id)) {
      const err = new Error("You have already used this coupon");
      err.statusCode = 400;
      return next(err);
    }

    const discountAmount = +(
      (orderTotal * coupon.discountPercent) /
      100
    ).toFixed(2);

    res.json({
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountAmount,
      finalTotal: +(orderTotal - discountAmount).toFixed(2),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/coupons (Admin only)
 * Get all coupons
 */
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/coupons (Admin only)
 * Create a new coupon
 * Body: { code, discountPercent, minOrderValue, expiresAt, usageLimit }
 */
const createCoupon = async (req, res, next) => {
  try {
    const { code, discountPercent, minOrderValue, expiresAt, usageLimit } =
      req.body;

    if (!code || !discountPercent || !expiresAt) {
      const err = new Error("code, discountPercent, and expiresAt are required");
      err.statusCode = 400;
      return next(err);
    }

    const coupon = await Coupon.create({
      code,
      discountPercent,
      minOrderValue,
      expiresAt,
      usageLimit: usageLimit || null,
    });

    res.status(201).json(coupon);
  } catch (error) {
    if (error.code === 11000) {
      const err = new Error("Coupon code already exists");
      err.statusCode = 400;
      return next(err);
    }
    next(error);
  }
};

/**
 * PUT /api/coupons/:id (Admin only)
 * Update a coupon
 */
const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      const err = new Error("Coupon not found");
      err.statusCode = 404;
      return next(err);
    }

    res.json(coupon);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/coupons/:id (Admin only)
 * Delete a coupon
 */
const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      const err = new Error("Coupon not found");
      err.statusCode = 404;
      return next(err);
    }
    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
