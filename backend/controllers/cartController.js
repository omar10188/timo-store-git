const Cart = require("../models/Cart");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");

// @desc    Get the current user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "name price image stock"
  );

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [], totalPrice: 0 });
  }

  return successResponse(res, cart, "Cart fetched successfully");
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    const err = new Error("Product ID is required");
    err.statusCode = 400;
    return next(err);
  }

  const product = await Product.findById(productId);
  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    return next(err);
  }

  if (product.stock < quantity) {
    const err = new Error("Insufficient stock");
    err.statusCode = 400;
    return next(err);
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingItemIndex > -1) {
    const newQty = cart.items[existingItemIndex].quantity + Number(quantity);
    if (product.stock < newQty) {
      const err = new Error("Insufficient stock for requested total quantity");
      err.statusCode = 400;
      return next(err);
    }
    cart.items[existingItemIndex].quantity = newQty;
  } else {
    cart.items.push({
      product: productId,
      name: product.name,
      price: product.salePrice || product.price, // Uses the virtual if discount exists
      image: product.image,
      quantity: Number(quantity),
    });
  }

  await cart.save();

  // Set/Reset Abandoned Cart Timer (1 hour)
  const { sendAbandonedCartEmail } = require("../services/emailService");
  const userIdStr = req.user._id.toString();
  
  if (global.abandonedCartTimers && global.abandonedCartTimers.has(userIdStr)) {
    clearTimeout(global.abandonedCartTimers.get(userIdStr));
  } else if (!global.abandonedCartTimers) {
    global.abandonedCartTimers = new Map();
  }

  const timer = setTimeout(async () => {
    try {
      const currentCart = await Cart.findOne({ user: req.user._id }).populate("items.product");
      // If cart still has items after 1 hour, it's abandoned
      if (currentCart && currentCart.items.length > 0) {
        await sendAbandonedCartEmail(req.user, currentCart);
      }
      global.abandonedCartTimers.delete(userIdStr);
    } catch (err) {
      console.error("Abandoned cart email error", err);
    }
  }, 60 * 60 * 1000); // 1 hour

  global.abandonedCartTimers.set(userIdStr, timer);

  return successResponse(res, cart, "Item added to cart successfully");
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    const err = new Error("Quantity must be at least 1");
    err.statusCode = 400;
    return next(err);
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    const err = new Error("Cart not found");
    err.statusCode = 404;
    return next(err);
  }

  const itemIndex = cart.items.findIndex(
    (i) => i.product.toString() === productId
  );

  if (itemIndex === -1) {
    const err = new Error("Item not found in cart");
    err.statusCode = 404;
    return next(err);
  }

  const product = await Product.findById(productId);
  if (product && product.stock < quantity) {
    const err = new Error("Insufficient stock");
    err.statusCode = 400;
    return next(err);
  }

  cart.items[itemIndex].quantity = Number(quantity);
  await cart.save();
  
  return successResponse(res, cart, "Cart item updated successfully");
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    const err = new Error("Cart not found");
    err.statusCode = 404;
    return next(err);
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();
  return successResponse(res, cart, "Item removed from cart successfully");
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  return successResponse(res, { items: [], totalPrice: 0 }, "Cart cleared successfully");
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
