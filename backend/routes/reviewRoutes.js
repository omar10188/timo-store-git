const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createReview,
  updateReview,
  deleteReview,
  getProductReviews,
} = require("../controllers/reviewController");

// Public route
router.get("/product/:productId", getProductReviews);

// Protected routes
router.use(protect);

router.post("/", createReview);

router.route("/:id")
  .put(updateReview)
  .delete(deleteReview);

module.exports = router;
