const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

const upload = require("../middleware/uploadMiddleware");

// @desc    Upload product image
// @route   POST /api/upload/product
// @access  Private/Admin
router.post("/product", protect, authorize("admin"), upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image file provided" });
  }

  // The URL to save in the database
  // Cloudinary returns req.file.path as the cloud URL
  // Local storage returns req.file.filename, so we prepend the local path
  const imageUrl = req.file.path && req.file.path.startsWith('http') 
    ? req.file.path 
    : `/uploads/products/${req.file.filename}`;
  
  res.status(201).json({
    message: "Image uploaded successfully",
    url: imageUrl,
    filename: req.file.filename
  });
});

module.exports = router;
