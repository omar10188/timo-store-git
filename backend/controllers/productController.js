const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res, next) => {
  const { name, description, price, category, brand, stock, isFeatured } = req.body;

  if (!name || !description || !price || !category || !brand) {
    const error = new Error("Please provide all required product fields");
    error.statusCode = 400;
    return next(error);
  }

  const images = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : [];

  const product = await Product.create({
    name,
    description,
    price: Number(price),
    category,
    brand,
    stock: Number(stock || 0),
    isFeatured: isFeatured === "true" || isFeatured === true,
    images,
    image: images[0] || "",
  });

  res.status(201).json(product);
});

// @desc    Get all products (with search, filter, pagination)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;
  const category = req.query.category || "";

  const query = {};

  if (search) {
    // Uses text index for better performance
    query.$text = { $search: search };
  }

  if (category) {
    query.category = category;
  }

  if (minPrice !== null || maxPrice !== null) {
    query.price = {};
    if (minPrice !== null) query.price.$gte = minPrice;
    if (maxPrice !== null) query.price.$lte = maxPrice;
  }

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    products,
    page,
    totalPages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate("category", "name slug");

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    return next(error);
  }

  res.json(product);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    return next(error);
  }

  const { name, description, price, category, brand, stock, isFeatured } = req.body;
  const images = req.files && req.files.length > 0
    ? req.files.map((file) => `/uploads/${file.filename}`)
    : product.images;

  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price ? Number(price) : product.price;
  product.category = category || product.category;
  product.brand = brand || product.brand;
  product.stock = stock ? Number(stock) : product.stock;
  product.isFeatured = isFeatured === undefined ? product.isFeatured : isFeatured === "true" || isFeatured === true;
  product.images = images;
  if (images.length) product.image = images[0];

  const updated = await product.save();
  res.json(updated);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    return next(error);
  }

  await product.deleteOne();
  res.json({ message: "Product removed successfully" });
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};