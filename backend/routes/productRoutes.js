const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getTrendingProducts,
  getRelatedProducts,
} = require("../controllers/productController");

const upload = require("../middleware/uploadMiddleware");

router.get("/trending", getTrendingProducts);
router.get("/", getProducts);
router.get("/:id/recommendations", getRelatedProducts);
router.get("/:id", getProductById);
router.post("/", protect, authorize("admin"), upload.array("images", 5), createProduct);
router.put("/:id", protect, authorize("admin"), upload.array("images", 5), updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

module.exports = router;