const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res, next) => {
  let inputCategories = req.body.categories || req.body["categories[]"];
  if (typeof inputCategories === "string" && inputCategories.startsWith("[")) {
    try {
      inputCategories = JSON.parse(inputCategories);
    } catch (e) {
      // Ignore parse error, let it be handled as a string
    }
  }
  
  const { name, description, price, brand, stock, isFeatured } = req.body;

  if (!name || !description || !price || !inputCategories || !brand) {
    const missingFields = ["name", "description", "price", "categories", "brand"].filter(field => !req.body[field] && !(field === 'categories' && inputCategories));
    return res.status(400).json({
      message: `Missing required fields: ${missingFields.join(", ")}`,
      missing: missingFields
    });
  }

  let uploadedImages = [];
  if (req.files && req.files.length > 0) {
    uploadedImages = req.files.map((file) => 
      file.path && file.path.startsWith('http') ? file.path : `/uploads/products/${file.filename}`
    );
  }

  const existingImage = req.body.image || "";
  const finalImage = uploadedImages[0] || existingImage || "";
  const finalImagesArray = uploadedImages.length > 0 ? uploadedImages : (existingImage ? [existingImage] : []);

  const product = await Product.create({
    name,
    description,
    price: Number(price),
    categories: Array.isArray(inputCategories) ? inputCategories : [inputCategories],
    brand,
    stock: Number(stock || 0),
    isFeatured: isFeatured === "true" || isFeatured === true,
    images: finalImagesArray,
    image: finalImage,
  });

  res.status(201).json(product);
});

const mongoose = require("mongoose");

// @desc    Get all products (with search, filter, pagination, sorting, isFeatured)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;
  const category = req.query.category || "";
  const isFeatured = req.query.isFeatured;
  const sort = req.query.sort;

  const query = {};

  if (search) {
    query.$text = { $search: search };
  }

  if (category) {
    query.categories = category;
  }

  if (isFeatured !== undefined) {
    query.isFeatured = isFeatured === "true" || isFeatured === true;
  }

  if (minPrice !== null || maxPrice !== null) {
    query.price = {};
    if (minPrice !== null) query.price.$gte = minPrice;
    if (maxPrice !== null) query.price.$lte = maxPrice;
  }

  // Sorting logic
  let sortOptions = { createdAt: -1 };
  if (sort === "newest") {
    sortOptions = { createdAt: -1 };
  } else if (sort === "price-asc") {
    sortOptions = { price: 1 };
  } else if (sort === "price-desc") {
    sortOptions = { price: -1 };
  } else if (sort === "rating") {
    sortOptions = { rating: -1 };
  } else if (sort === "trending") {
    sortOptions = { rating: -1, numReviews: -1 };
  }

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate("categories", "name slug")
    .sort(sortOptions)
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
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const error = new Error(`Product not found with id ${req.params.id}`);
    error.statusCode = 404;
    return next(error);
  }

  const product = await Product.findById(req.params.id).populate("categories", "name slug");

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

  let uploadedImages = [];
  if (req.files && req.files.length > 0) {
    uploadedImages = req.files.map((file) => 
      file.path && file.path.startsWith('http') ? file.path : `/uploads/products/${file.filename}`
    );
  }

  const existingImage = req.body.image || "";

  // If new files were uploaded, use them. 
  // Otherwise, if an existingImage string was provided, use that.
  // Otherwise, fallback to the product's current images.
  const finalImage = uploadedImages.length > 0 
    ? uploadedImages[0] 
    : (existingImage ? existingImage : product.image);
    
  const finalImagesArray = uploadedImages.length > 0 
    ? uploadedImages 
    : (existingImage ? [existingImage] : product.images);

  let inputCategories = req.body.categories || req.body["categories[]"];
  if (typeof inputCategories === "string" && inputCategories.startsWith("[")) {
    try {
      inputCategories = JSON.parse(inputCategories);
    } catch (e) {
      // Ignore parse error
    }
  }
  
  const { name, description, price, discount, brand, stock, isFeatured } = req.body;

  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price ? Number(price) : product.price;
  
  if (discount !== undefined) {
    product.discount = Number(discount);
  }
  
  if (inputCategories) {
    product.categories = Array.isArray(inputCategories) ? inputCategories : [inputCategories];
  }
  
  product.brand = brand || product.brand;
  product.stock = stock ? Number(stock) : product.stock;
  
  if (isFeatured !== undefined) {
    product.isFeatured = isFeatured === "true" || isFeatured === true;
  }
  
  product.images = finalImagesArray;
  product.image = finalImage;

  const updatedProduct = await product.save();
  res.json(updatedProduct);
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

// @desc    Get trending products
// @route   GET /api/products/trending
// @access  Public
const getTrendingProducts = asyncHandler(async (req, res, next) => {
  // Simple algorithm: highest rating + most reviews (or just a mix)
  // To keep it fast, we'll sort by ratingsAverage desc, ratingsQuantity desc and limit to 8
  const products = await Product.find({})
    .sort({ ratingsAverage: -1, ratingsQuantity: -1 })
    .limit(8)
    .populate("categories", "name slug")
    .lean();

  res.json(products);
});

// @desc    Get related products based on category
// @route   GET /api/products/:id/recommendations
// @access  Public
const getRelatedProducts = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const error = new Error(`Product not found with id ${req.params.id}`);
    error.statusCode = 404;
    return next(error);
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    return next(error);
  }

  const categoryIds = product.categories || [];

  // Find products in the same category, excluding the current one
  let relatedProducts = [];
  if (categoryIds.length > 0) {
    relatedProducts = await Product.find({
      categories: { $in: categoryIds },
      _id: { $ne: product._id },
    })
      .limit(4)
      .populate("categories", "name slug")
      .lean();
  }

  // If not enough related products, fetch some top rated to fill the gap
  if (relatedProducts.length < 4) {
    const excludeIds = [product._id, ...relatedProducts.map((p) => p._id)];
    const topRated = await Product.find({
      _id: { $nin: excludeIds },
    })
      .sort({ ratingsAverage: -1 })
      .limit(4 - relatedProducts.length)
      .populate("categories", "name slug")
      .lean();
    
    relatedProducts = [...relatedProducts, ...topRated];
  }

  res.json(relatedProducts);
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getTrendingProducts,
  getRelatedProducts,
};