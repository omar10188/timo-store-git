const Category = require("../models/Category");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  res.json(categories);
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    const err = new Error("Category not found");
    err.statusCode = 404;
    return next(err);
  }
  res.json(category);
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;

  if (!name) {
    const err = new Error("Category name is required");
    err.statusCode = 400;
    return next(err);
  }

  const image = req.file ? `/uploads/${req.file.filename}` : "";

  try {
    const category = await Category.create({ name, description, image });
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      const err = new Error("Category already exists");
      err.statusCode = 400;
      return next(err);
    }
    throw error;
  }
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    const err = new Error("Category not found");
    err.statusCode = 404;
    return next(err);
  }

  const { name, description, isActive } = req.body;
  if (name) category.name = name;
  if (description !== undefined) category.description = description;
  if (isActive !== undefined) category.isActive = isActive === "true" || isActive === true;
  if (req.file) category.image = `/uploads/${req.file.filename}`;

  const updated = await category.save();
  res.json(updated);
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    const err = new Error("Category not found");
    err.statusCode = 404;
    return next(err);
  }

  await category.deleteOne();
  res.json({ message: "Category deleted successfully" });
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
