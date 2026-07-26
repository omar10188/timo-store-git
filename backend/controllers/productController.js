const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res, next) => {
  const { name, description, price, category, brand, stock, isFeatured } = req.body;

  const requiredFields = ["name", "description", "price", "category", "brand"];
  const missingFields = requiredFields.filter(field => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Missing required fields: ${missingFields.join(", ")}`,
      missing: missingFields
    });
  }

  let uploadedImages = req.files && req.files.length > 0 
    ? req.files.map((file) => `/uploads/products/${file.filename}`) // Update to products subfolder if uploaded directly here, but keeping old logic works too. Actually wait, productRoutes uses standard /uploads/. We'll just leave this as is for standard uploads.
    : [];
  
  if (req.files && req.files.length > 0) {
    uploadedImages = req.files.map((file) => `/uploads/${file.filename}`);
  }

  const existingImage = req.body.image || "";
  const finalImage = uploadedImages[0] || existingImage || "";
  const finalImagesArray = uploadedImages.length > 0 ? uploadedImages : (existingImage ? [existingImage] : []);

  const product = await Product.create({
    name,
    description,
    price: Number(price),
    category,
    brand,
    stock: Number(stock || 0),
    isFeatured: isFeatured === "true" || isFeatured === true,
    images: finalImagesArray,
    image: finalImage,
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

  let uploadedImages = [];
  if (req.files && req.files.length > 0) {
    uploadedImages = req.files.map((file) => `/uploads/${file.filename}`);
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

  const { name, description, price, category, brand, stock, isFeatured } = req.body;

  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price ? Number(price) : product.price;
  product.category = category || product.category;
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
  // To keep it fast, we'll sort by rating desc, numReviews desc and limit to 8
  const products = await Product.find({})
    .sort({ rating: -1, numReviews: -1 })
    .limit(8)
    .populate("category", "name slug")
    .lean();

  res.json(products);
});

// @desc    Get related products based on category
// @route   GET /api/products/:id/recommendations
// @access  Public
const getRelatedProducts = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    return next(error);
  }

  // Find products in the same category, excluding the current one
  let relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
  })
    .limit(4)
    .populate("category", "name slug")
    .lean();

  // If not enough related products, fetch some top rated to fill the gap
  if (relatedProducts.length < 4) {
    const topRated = await Product.find({
      _id: { $ne: product._id, $nin: relatedProducts.map((p) => p._id) },
    })
      .sort({ rating: -1 })
      .limit(4 - relatedProducts.length)
      .populate("category", "name slug")
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