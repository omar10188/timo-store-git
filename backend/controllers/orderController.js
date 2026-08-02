const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const User = require("../models/User");
const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require("../services/emailService");
const { sendAdminOrderNotification } = require("../services/notificationService");
const { generateInvoice } = require("../services/invoiceService");

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

  if (!addressString || addressString.trim().length < 5) {
    const err = new Error("Delivery address is required");
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
      // Generate a cryptographically random password — guest accounts cannot be logged into
      const { randomBytes } = require("crypto");
      const randomPassword = randomBytes(24).toString("base64"); // e.g. "X9k2m..." — not guessable

      user = await User.create({
        name,
        email: `guest_${cleanPhone || Date.now()}@timo.com`,
        password: randomPassword,
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

  // 2. Resolve Items — ALWAYS fetch price from DB, never trust client
  let orderItems = [];
  let subtotal = 0;

  if (Array.isArray(rawItems) && rawItems.length > 0) {
    // Fetch all products from DB in one query
    const productIds = rawItems.map((item) => item.product || item._id).filter(Boolean);
    const dbProducts = await Product.find({ _id: { $in: productIds } }).lean();
    const dbProductMap = Object.fromEntries(dbProducts.map((p) => [p._id.toString(), p]));

    // Validate stock and build order items with server-side prices
    for (const item of rawItems) {
      const productId = (item.product || item._id)?.toString();
      const dbProduct = dbProductMap[productId];

      if (!dbProduct) {
        const err = new Error(`Product not found: ${productId}`);
        err.statusCode = 404;
        return next(err);
      }

      const qty = Number(item.quantity) || 1;
      if (dbProduct.stock < qty) {
        const err = new Error(`Insufficient stock for "${dbProduct.name}" (requested: ${qty}, available: ${dbProduct.stock})`);
        err.statusCode = 400;
        return next(err);
      }

      // Use DB price — NEVER item.price from client
      const serverPrice = dbProduct.salePrice || dbProduct.price;

      orderItems.push({
        product: dbProduct._id,
        name: dbProduct.name,
        price: serverPrice,
        image: dbProduct.image || item.image || "",
        quantity: qty,
      });
    }
    subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  } else {
    const cart = await Cart.findOne({ user: user._id }).populate("items.product", "name price salePrice stock image");
    if (!cart || cart.items.length === 0) {
      const err = new Error("Your cart is empty");
      err.statusCode = 400;
      return next(err);
    }

    // Validate stock for each cart item using live DB data
    for (const item of cart.items) {
      const dbProduct = item.product;
      if (!dbProduct) continue;

      if (dbProduct.stock < item.quantity) {
        const err = new Error(`Insufficient stock for "${dbProduct.name}" (available: ${dbProduct.stock})`);
        err.statusCode = 400;
        return next(err);
      }

      orderItems.push({
        product: dbProduct._id,
        name: item.name,
        price: dbProduct.salePrice || dbProduct.price, // Always from DB
        image: item.image,
        quantity: item.quantity,
      });
    }
    subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

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

  // 3. Handle Coupon & Discount (with reuse prevention)
  let discount = 0;
  let appliedCoupon = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

    if (!coupon) {
      const err = new Error("Coupon code not found");
      err.statusCode = 400;
      return next(err);
    }

    if (!coupon.isValid) {
      const err = new Error("This coupon is no longer active or has expired");
      err.statusCode = 400;
      return next(err);
    }

    if (subtotal < coupon.minOrderValue) {
      const err = new Error(`Minimum order value of EGP ${coupon.minOrderValue} required for this coupon`);
      err.statusCode = 400;
      return next(err);
    }

    // Prevent coupon reuse by the same user
    const alreadyUsed = coupon.usedBy?.some((id) => id.toString() === user._id.toString());
    if (alreadyUsed) {
      const err = new Error("You have already used this coupon");
      err.statusCode = 400;
      return next(err);
    }

    discount = coupon.type === "percent"
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;
    if (discount > subtotal) discount = subtotal;
    appliedCoupon = coupon.code;

    coupon.usedCount += 1;
    coupon.usedBy.push(user._id);
    await coupon.save();
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
    notes: req.body.notes || "",
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
    .map((i) => `- ${i.name} × ${i.quantity} = ${i.price * i.quantity} EGP`)
    .join("\n");

  const whatsappMessage = 
`طلب جديد 🛍️
الاسم: ${name}
الموبايل: ${phone}
العنوان: ${addressString}

الطلبات:
${itemsListFormatted}

الإجمالي: ${totalPrice} EGP${req.body.notes ? `\n\nالملاحظات: ${req.body.notes}` : ""}`;

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  // 8. Notifications & Socket.io
  const customerEmail = user.email && !user.email.includes("@timo.com") ? user.email : null;
  if (customerEmail) {
    generateInvoice(order)
      .then((invoicePath) => {
        sendOrderConfirmationEmail(name, customerEmail, order, invoicePath).catch(() => {});
      })
      .catch((err) => {
        console.error("❌ PDF generation failed:", err.message);
        sendOrderConfirmationEmail(name, customerEmail, order).catch(() => {}); // Fallback without PDF
      });
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

  // Send status update email to customer
  const customerEmail = order.user?.email || `guest_${order.customerPhone}@timo.com`;
  if (!customerEmail.includes("guest_")) {
    sendOrderStatusUpdateEmail(order.customerName, customerEmail, updatedOrder, status).catch(() => {});
  }

  res.json(updatedOrder);
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
};
