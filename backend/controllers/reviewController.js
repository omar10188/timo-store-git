const Review = require("../models/Review");
const Product = require("../models/Product");

const createReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;
    const productId = req.params.productId;

    if (!rating || !title || !comment) {
      const error = new Error("Rating, title, and comment are required");
      error.statusCode = 400;
      return next(error);
    }

    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      return next(error);
    }

    const existingReview = await Review.findOne({ product: productId, user: req.user._id });
    if (existingReview) {
      existingReview.rating = Number(rating);
      existingReview.title = title;
      existingReview.comment = comment;
      await existingReview.save();
      await updateProductRating(productId);
      return res.json(existingReview);
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating: Number(rating),
      title,
      comment,
    });

    await updateProductRating(productId);
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

const getReviewsByProduct = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const average = reviews.length
    ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length
    : 0;

  await Product.findByIdAndUpdate(productId, {
    rating: Number(average.toFixed(1)),
    numReviews: reviews.length,
  });
};

module.exports = {
  createReview,
  getReviewsByProduct,
};
