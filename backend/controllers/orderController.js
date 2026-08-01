const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const User = require("../models/User");
const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const { sendOrderConfirmationEmail } = require("../services/emailService");
const { sendAdminOrderNotification } = require("../services/notificationService");

// Helper to safely get Socket.io (won't crash if not initialized)
const emitToAdmin = (event, data) => {
  try {
    const { getIO } = require("../socket");
    getIO().to("admin-room").emit(event, data);
  } catch {
    // Socket.io not initialized — skip silently
  }
};

const { successResponse } = require("../utils/apiResponse");

// @desc    Create new order (Guest or Authenticated User + WhatsApp Invoice Generation)
// @route   POST /api/orders
// @access  Public / Private
const createOrder = asyncHandler(async (req, res, next) => {
  const { customer, shippingAddress, paymentMethod, couponCode, items: rawItems } = req.body;

  // Extract customer info from body
  const name = customer?.name || req.body.name || req.user?.name || "Customer";
  const phone = customer?.phone || req.body.phone || req.user?.phone || "";
  const addressString = customer?.address || req.body.address || shippingAddress?.street || "";

  if (!name || name.trim().length < 2) {
    const err = new Error("Customer name is required (at least 2 characters)");
    err.statusCode = 400;
    return next(err);
  }

  if (!phone || phone.trim().length < 7) {
    const err = new Error("Valid phone number is required");
    err.statusCode = 400;
    return next(err);
  }

  // 1. Identify or Create Customer User Record
  let user = req.user;
  const cleanPhone = phone.replace(/\s+/g, "");

  if (!user) {
    user = await User.findOne({
      $or: [{ phone: cleanPhone }, { email: `guest_${cleanPhone}@timo.com` }],
    });

    if (!user) {
      user = await User.create({
        name,
        email: `guest_${cleanPhone || Date.now()}@timo.com`,
        password: "GuestPassword123!",
        phone: cleanPhone,
        role: "user",
        emailVerified: true,
      });
    }
  }

  // Update User profile details if needed
  if (name && (!user.name || user.name === "Customer" || user.name === "Guest Customer")) {
    user.name = name;
  }
  if (phone) {
    user.phone = phone;
  }
  if (addressString && (!user.address?.street)) {
    user.address = { ...user.address, street: addressString, city: shippingAddress?.city || "Local", country: shippingAddress?.country || "Egypt" };
  }

  // 2. Resolve Items (from request body or database Cart)
  let orderItems = [];
  let subtotal = 0;

  if (Array.isArray(rawItems) && rawItems.length > 0) {
    orderItems = rawItems.map((item) => ({
      product: item.product || item._id,
      name: item.name,
      price: Number(item.price || 0),
      image: item.image || "",
      quantity: Number(item.quantity || 1),
    }));
    subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  } else {
    const cart = await Cart.findOne({ user: user._id }).populate("items.product", "stock");
    if (!cart || cart.items.length === 0) {
      const err = new Error("Your cart is empty");
      err.statusCode = 400;
      return next(err);
    }

    orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
    }));
    subtotal = cart.totalPrice;

    // Clear DB cart
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();
  }

  if (orderItems.length === 0) {
    const err = new Error("Order must contain at least one item");
    err.statusCode = 400;
    return next(err);
  }

  // 3. Handle Coupon & Discount
  let discount = 0;
  let appliedCoupon = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon && coupon.isValid && subtotal >= coupon.minOrderValue) {
      discount = coupon.type === "percent" ? (subtotal * coupon.discountValue) / 100 : coupon.discountValue;
      if (discount > subtotal) discount = subtotal;
      appliedCoupon = coupon.code;

      coupon.usedCount += 1;
      if (!coupon.usedBy.includes(user._id)) coupon.usedBy.push(user._id);
      await coupon.save();
    }
  }

  const totalPrice = subtotal - discount;

  // 4. Update Customer Stats (total_orders, total_spent)
  user.totalOrders = (user.totalOrders || 0) + 1;
  user.totalSpent = (user.totalSpent || 0) + totalPrice;
  await user.save({ validateBeforeSave: false });

  // 5. Create Order in Database
  const order = await Order.create({
    user: user._id,
    customerName: name,
    customerPhone: phone,
    customerAddress: addressString,
    items: orderItems,
    subtotal,
    discount,
    totalPrice,
    coupon: appliedCoupon,
    shippingAddress: {
      street: addressString || shippingAddress?.street || "N/A",
      city: shippingAddress?.city || "Local",
      country: shippingAddress?.country || "Egypt",
      postalCode: shippingAddress?.postalCode || "",
    },
    paymentMethod: paymentMethod || "whatsapp",
    statusHistory: [{ status: "pending", changedAt: new Date(), note: "Order placed via WhatsApp Checkout" }],
  });

  // 6. Decrease product stock bulk
  const bulkOps = orderItems
    .filter((item) => mongoose.Types.ObjectId.isValid(item.product))
    .map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { stock: -item.quantity } },
      },
    }));

  if (bulkOps.length > 0) {
    await Product.bulkWrite(bulkOps);
  }

  // 7. Generate Formatted WhatsApp Invoice Message & URL
  const rawAdminPhone = process.env.WHATSAPP_NUMBER || process.env.ADMIN_PHONE || "201008313604";
  const whatsappNumber = rawAdminPhone.replace(/\D/g, "");
  const orderIdShort = order._id.toString().slice(-6).toUpperCase();
  const dateStr = new Date().toLocaleDateString("en-GB");

  const itemsListFormatted = orderItems
    .map((i) => `• ${i.quantity}x ${i.name} (EGP ${(i.price * i.quantity).toFixed(2)})`)
    .join("\n");

  const whatsappMessage = 
`🛍️ *طلب جديد - TIMO STORE*
----------------------------------
🆔 *رقم الطلب:* #${orderIdShort}
👤 *الاسم:* ${name}
📞 *الهاتف:* ${phone}
📍 *العنوان:* ${addressString || "غير محدد"}
----------------------------------
🛒 *المنتجات:*
${itemsListFormatted}
----------------------------------
💵 *الإجمالي:* EGP ${totalPrice.toFixed(2)}
📅 *التاريخ:* ${dateStr}
----------------------------------
شكراً لتسوقكم من TIMO STORE! 🎉`;

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  // 8. Notifications & Socket.io
  const customerEmail = user.email && !user.email.includes("@timo.com") ? user.email : null;
  if (customerEmail) {
    sendOrderConfirmationEmail({ ...user.toObject(), email: customerEmail }, order).catch(() => {});
  }
  sendAdminOrderNotification(order, name).catch(() => {});

  emitToAdmin("new-order", {
    _id: order._id,
    customerName: name,
    customerPhone: phone,
    totalPrice: order.totalPrice,
    itemCount: order.items.length,
    paymentMethod: order.paymentMethod,
    status: order.status,
    createdAt: order.createdAt,
  });

  return successResponse(
    res,
    {
      order,
      whatsappMessage,
      whatsappUrl,
    },
    "Order placed successfully",
    201
  );
});

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

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

// @desc    Get all orders (admin list with search & filter)
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
// @route   PUT /api/orders/:id/status  |  PATCH /api/admin/orders/:id
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, note } = req.body;
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

  const previousStatus = order.status;
  order.status = status;

  // Push to status history log
  order.statusHistory.push({
    status,
    changedAt: new Date(),
    note: note || `Status changed from ${previousStatus} to ${status}`,
  });

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

  // Emit real-time update to admin room
  emitToAdmin("order-updated", {
    _id: updatedOrder._id,
    status: updatedOrder.status,
    previousStatus,
  });

  res.json(updatedOrder);
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
};
