const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// Ensure directory exists
const uploadDir = path.join(__dirname, "..", "uploads", "products");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `product-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Images only! (jpeg, jpg, png, webp)"));
    }
  },
});

// @desc    Upload product image
// @route   POST /api/upload/product
// @access  Private/Admin
router.post("/product", protect, admin, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image file provided" });
  }

  // The URL to save in the database
  const imageUrl = `/uploads/products/${req.file.filename}`;
  
  res.status(201).json({
    message: "Image uploaded successfully",
    url: imageUrl,
    filename: req.file.filename
  });
});

module.exports = router;
