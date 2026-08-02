const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const upload = require("../middleware/uploadMiddleware");

router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.post("/", protect, authorize("admin"), upload.single("image"), createCategory);
router.put("/:id", protect, authorize("admin"), upload.single("image"), updateCategory);
router.delete("/:id", protect, authorize("admin"), deleteCategory);

module.exports = router;
