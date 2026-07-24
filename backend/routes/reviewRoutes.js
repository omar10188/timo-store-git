const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { createReview, getReviewsByProduct } = require("../controllers/reviewController");

router.post("/:productId", protect, createReview);
router.get("/:productId", getReviewsByProduct);

module.exports = router;
