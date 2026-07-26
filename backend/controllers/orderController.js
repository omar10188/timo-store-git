const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const asyncHandler = require("../middleware/asyncHandler");

// @desc    Create new order from cart
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res, next) => {
  const { shippingAddress, paymentMethod, couponCode } = req.body;

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.country) {
    const err = new Error("Valid shipping address is required");
    err.statusCode = 400;
    return next(err);
  }

  // 1. Get user's cart
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product", "stock");
  
  if (!cart || cart.items.length === 0) {
    const err = new Error("Your cart is empty");
    err.statusCode = 400;
    return next(err);
  }

  // 2. Validate stock for all items
  for (const item of cart.items) {
    if (!item.product) {
      const err = new Error(`Product ${item.name} no longer exists`);
      err.statusCode = 400;
      return next(err);
    }
    if (item.product.stock < item.quantity) {
      const err = new Error(`Insufficient stock for product: ${item.name}`);
      err.statusCode = 400;
      return next(err);
    }
  }

  // 3. Build order items (snapshotting name, price, image, quantity)
  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.name,
    price: item.price,
    image: item.image,
    quantity: item.quantity,
  }));

  // 4. Calculate prices
  const subtotal = cart.totalPrice;
  let discount = 0;
  let appliedCoupon = null;

  // 5. Apply coupon if provided
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    
    if (coupon && coupon.isValid && subtotal >= coupon.minOrderValue) {
      // Check if user already used it (if we're tracking)
      if (coupon.type === "percent") {
        discount = (subtotal * coupon.discountValue) / 100;
      } else {
        discount = coupon.discountValue;
      }
      
      // Ensure discount doesn't exceed subtotal
      if (discount > subtotal) discount = subtotal;

      appliedCoupon = coupon.code;

      // Update coupon usage
      coupon.usedCount += 1;
      if (!coupon.usedBy.includes(req.user._id)) {
        coupon.usedBy.push(req.user._id);
      }
      await coupon.save();
    }
  }

  const totalPrice = subtotal - discount;

  // 6. Create the order
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    subtotal,
    discount,
    totalPrice,
    coupon: appliedCoupon,
    shippingAddress,
    paymentMethod: paymentMethod || "cash_on_delivery",
  });

  // 7. Decrease product stock using bulkWrite (Performance optimization)
  await Product.bulkWrite(
    orderItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { stock: -item.quantity } },
      },
    }))
  );

  const { sendOrderConfirmationEmail } = require("../services/emailService");
  
  // 8. Clear the user's cart
  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  // Send order confirmation asynchronously
  sendOrderConfirmationEmail(req.user, order).catch(err => console.error("Order confirmation email failed", err));

  res.status(201).json(order);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .lean(); // Lean for better read performance

  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .lean();

  if (!order) {
    const err = new Error("Order not found");
    err.statusCode = 404;
    return next(err);
  }

  // Ensure only the order owner or an admin can view the order
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    const err = new Error("Not authorized to view this order");
    err.statusCode = 403;
    return next(err);
  }

  res.json(order);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({})
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();

  res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

  if (!validStatuses.includes(status)) {
    const err = new Error("Invalid order status");
    err.statusCode = 400;
    return next(err);
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    const err = new Error("Order not found");
    err.statusCode = 404;
    return next(err);
  }

  order.status = status;

  if (status === "delivered") {
    order.isPaid = true;
    order.paymentStatus = "paid";
    order.paidAt = new Date();
  } else if (status === "cancelled") {
    order.cancelledAt = new Date();
    // Revert stock if order is cancelled
    await Product.bulkWrite(
      order.items.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { stock: item.quantity } },
        },
      }))
    );
  }

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
};
