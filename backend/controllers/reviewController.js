const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res, next) => {
  const { product: productId, rating, title, comment } = req.body;

  if (!productId || !rating || !comment) {
    const err = new Error("Product ID, rating, and comment are required");
    err.statusCode = 400;
    return next(err);
  }

  // Check if product exists
  const productExists = await Product.findById(productId);
  if (!productExists) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    return next(err);
  }

  // Check if the user already reviewed the product
  const alreadyReviewed = await Review.findOne({
    product: productId,
    user: req.user._id,
  });

  if (alreadyReviewed) {
    const err = new Error("You have already reviewed this product");
    err.statusCode = 400;
    return next(err);
  }

  // Business Logic: Only users who purchased the product can review
  const hasPurchased = await Order.findOne({
    user: req.user._id,
    "items.product": productId,
    isPaid: true
  });

  if (!hasPurchased) {
    const err = new Error("You can only review products you have purchased");
    err.statusCode = 403;
    return next(err);
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    rating: Number(rating),
    title,
    comment,
    verifiedPurchase: true, // Since we enforce purchase, it's true
  });

  res.status(201).json(review);
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res, next) => {
  const { rating, title, comment } = req.body;

  const review = await Review.findById(req.params.id);

  if (!review) {
    const err = new Error("Review not found");
    err.statusCode = 404;
    return next(err);
  }

  // Ensure the user owns the review
  if (review.user.toString() !== req.user._id.toString()) {
    const err = new Error("Not authorized to update this review");
    err.statusCode = 403;
    return next(err);
  }

  if (rating) review.rating = Number(rating);
  if (title) review.title = title;
  if (comment) review.comment = comment;

  await review.save(); // This will trigger the post-save hook to recalculate product rating

  res.json(review);
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    const err = new Error("Review not found");
    err.statusCode = 404;
    return next(err);
  }

  // Ensure the user owns the review or is an admin
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    const err = new Error("Not authorized to delete this review");
    err.statusCode = 403;
    return next(err);
  }

  // Use deleteOne to trigger the pre('deleteOne') hook for recalculating ratings
  await review.deleteOne();

  res.json({ message: "Review removed successfully" });
});

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 })
    .lean();

  res.json(reviews);
});

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  getProductReviews,
};
