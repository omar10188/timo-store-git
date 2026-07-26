const User = require("../models/User");
const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");

// @desc    Toggle product in wishlist (Add/Remove)
// @route   POST /api/wishlist/:productId
// @access  Private
const toggleWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  // Ensure product exists
  const product = await Product.findById(productId);
  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    return next(err);
  }

  // Get current user
  const user = await User.findById(req.user._id);

  // Check if product is already in wishlist
  const isWishlisted = user.wishlist.includes(productId);

  if (isWishlisted) {
    // Remove it
    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId.toString()
    );
  } else {
    // Add it
    user.wishlist.push(productId);
  }

  await user.save();

  res.json({
    message: isWishlisted ? "Product removed from wishlist" : "Product added to wishlist",
    wishlist: user.wishlist,
  });
});

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res, next) => {
  // Populate the wishlist with specific fields from Product
  const user = await User.findById(req.user._id).populate({
    path: "wishlist",
    select: "name price discount image images isFeatured stock",
  });

  res.json(user.wishlist);
});

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  
  user.wishlist = [];
  await user.save();

  res.json({
    message: "Wishlist cleared successfully",
    wishlist: [],
  });
});

module.exports = {
  toggleWishlist,
  getWishlist,
  clearWishlist,
};
