const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { getSummary, getSales, getTopProducts } = require("../controllers/analyticsController");

// Protect all analytics routes
router.use(protect, authorize("admin"));

router.get("/summary", getSummary);
router.get("/sales", getSales);
router.get("/top-products", getTopProducts);

module.exports = router;
