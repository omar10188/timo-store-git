const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads", "products");

// @desc    Get all product images
// @route   GET /api/images/products
// @access  Private/Admin
router.get("/products", protect, admin, async (req, res, next) => {
  try {
    // Check if directory exists
    try {
      await fs.access(uploadDir);
    } catch (err) {
      // Directory doesn't exist yet, return empty array
      return res.json([]);
    }

    const files = await fs.readdir(uploadDir);
    
    // Get stats for each file to sort by date (newest first)
    const fileStats = await Promise.all(
      files.map(async (filename) => {
        const stat = await fs.stat(path.join(uploadDir, filename));
        return {
          filename,
          url: `/uploads/products/${filename}`,
          createdAt: stat.mtime,
          size: stat.size,
        };
      })
    );

    // Sort descending by date
    fileStats.sort((a, b) => b.createdAt - a.createdAt);

    res.json(fileStats);
  } catch (error) {
    next(error);
  }
});

// @desc    Delete a product image
// @route   DELETE /api/images/:filename
// @access  Private/Admin
router.delete("/:filename", protect, admin, async (req, res, next) => {
  try {
    const { filename } = req.params;
    
    // Prevent directory traversal attacks
    if (filename.includes("..") || filename.includes("/")) {
      return res.status(400).json({ message: "Invalid filename" });
    }

    const filePath = path.join(uploadDir, filename);

    try {
      await fs.access(filePath);
    } catch (err) {
      return res.status(404).json({ message: "Image not found" });
    }

    await fs.unlink(filePath);
    
    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
