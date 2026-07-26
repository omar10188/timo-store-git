const Coupon = require("../models/Coupon");
const asyncHandler = require("../middleware/asyncHandler");

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res, next) => {
  const { code, type, discountValue, minOrderValue, expiresAt, isActive, usageLimit } = req.body;

  if (!code || !type || !discountValue || !expiresAt) {
    const err = new Error("Code, type, discountValue, and expiresAt are required");
    err.statusCode = 400;
    return next(err);
  }

  const upperCode = code.toUpperCase();

  const couponExists = await Coupon.findOne({ code: upperCode });
  if (couponExists) {
    const err = new Error("Coupon code already exists");
    err.statusCode = 400;
    return next(err);
  }

  const expirationDate = new Date(expiresAt);
  if (expirationDate <= new Date()) {
    const err = new Error("Expiration date must be in the future");
    err.statusCode = 400;
    return next(err);
  }

  if (type === "percent" && discountValue > 100) {
    const err = new Error("Percent discount cannot exceed 100");
    err.statusCode = 400;
    return next(err);
  }

  if (type === "fixed" && discountValue <= 0) {
    const err = new Error("Fixed discount must be greater than 0");
    err.statusCode = 400;
    return next(err);
  }

  if (usageLimit !== undefined && usageLimit !== null && usageLimit < 1) {
    const err = new Error("Usage limit must be at least 1");
    err.statusCode = 400;
    return next(err);
  }

  const coupon = await Coupon.create({
    code: upperCode,
    type,
    discountValue,
    minOrderValue: minOrderValue || 0,
    expiresAt: expirationDate,
    isActive: isActive !== undefined ? isActive : true,
    usageLimit: usageLimit || null,
  });

  res.status(201).json(coupon);
});

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  
  const query = {};

  if (req.query.active !== undefined) {
    query.isActive = req.query.active === "true";
  }

  if (req.query.expired !== undefined) {
    const isExpired = req.query.expired === "true";
    if (isExpired) {
      query.expiresAt = { $lt: new Date() };
    } else {
      query.expiresAt = { $gte: new Date() };
    }
  }

  const total = await Coupon.countDocuments(query);
  const coupons = await Coupon.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  res.json({
    coupons,
    page,
    totalPages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private/Admin
const getCouponById = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id).lean();

  if (!coupon) {
    const err = new Error("Coupon not found");
    err.statusCode = 404;
    return next(err);
  }

  res.json(coupon);
});

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = asyncHandler(async (req, res, next) => {
  const { code, type, discountValue, minOrderValue, expiresAt, isActive, usageLimit } = req.body;

  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    const err = new Error("Coupon not found");
    err.statusCode = 404;
    return next(err);
  }

  if (code) {
    const upperCode = code.toUpperCase();
    if (upperCode !== coupon.code) {
      const exists = await Coupon.findOne({ code: upperCode });
      if (exists) {
        const err = new Error("Coupon code already exists");
        err.statusCode = 400;
        return next(err);
      }
    }
    coupon.code = upperCode;
  }

  if (expiresAt) {
    const expirationDate = new Date(expiresAt);
    if (expirationDate <= new Date()) {
      const err = new Error("Expiration date must be in the future");
      err.statusCode = 400;
      return next(err);
    }
    coupon.expiresAt = expirationDate;
  }

  if (type) coupon.type = type;
  if (discountValue !== undefined) coupon.discountValue = discountValue;

  if (coupon.type === "percent" && coupon.discountValue > 100) {
    const err = new Error("Percent discount cannot exceed 100");
    err.statusCode = 400;
    return next(err);
  }

  if (coupon.type === "fixed" && coupon.discountValue <= 0) {
    const err = new Error("Fixed discount must be greater than 0");
    err.statusCode = 400;
    return next(err);
  }

  if (minOrderValue !== undefined) coupon.minOrderValue = minOrderValue;
  if (isActive !== undefined) coupon.isActive = isActive;
  
  if (usageLimit !== undefined) {
    if (usageLimit !== null && usageLimit < 1) {
      const err = new Error("Usage limit must be at least 1");
      err.statusCode = 400;
      return next(err);
    }
    coupon.usageLimit = usageLimit;
  }

  const updatedCoupon = await coupon.save();
  res.json(updatedCoupon);
});

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    const err = new Error("Coupon not found");
    err.statusCode = 404;
    return next(err);
  }

  await coupon.deleteOne();
  res.json({ message: "Coupon deleted successfully" });
});

// @desc    Validate a coupon (Public/User)
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = asyncHandler(async (req, res, next) => {
  const { code, cartTotal } = req.body;

  if (!code || cartTotal === undefined) {
    const err = new Error("Coupon code and cart total are required");
    err.statusCode = 400;
    return next(err);
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    const err = new Error("Invalid coupon code");
    err.statusCode = 404;
    return next(err);
  }

  if (!coupon.isActive) {
    const err = new Error("Coupon is no longer active");
    err.statusCode = 400;
    return next(err);
  }

  if (new Date(coupon.expiresAt) < new Date()) {
    const err = new Error("Coupon has expired");
    err.statusCode = 400;
    return next(err);
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    const err = new Error("Coupon usage limit has been reached");
    err.statusCode = 400;
    return next(err);
  }

  if (coupon.usedBy.includes(req.user._id)) {
    const err = new Error("You have already used this coupon");
    err.statusCode = 400;
    return next(err);
  }

  if (cartTotal < coupon.minOrderValue) {
    const err = new Error(`Minimum order value of $${coupon.minOrderValue} required`);
    err.statusCode = 400;
    return next(err);
  }

  let discountAmount = 0;
  if (coupon.type === "percent") {
    discountAmount = (cartTotal * coupon.discountValue) / 100;
  } else {
    discountAmount = coupon.discountValue;
  }

  if (discountAmount > cartTotal) discountAmount = cartTotal;

  res.json({
    code: coupon.code,
    discountAmount,
    finalTotal: cartTotal - discountAmount,
  });
});

module.exports = {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
};
