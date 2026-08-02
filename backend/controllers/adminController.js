const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const EmailSettings = require("../models/EmailSettings");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { clearSettingsCache } = require("../services/emailService");

/**
 * GET /api/admin/stats
 * Get dashboard overview statistics
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // Start of today (midnight)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueResult,
      recentOrders,
      lowStockProducts,
      salesDataResult,
      topProductsResult,
      ordersToday,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Product.countDocuments(),
      Order.countDocuments(),
      // Total revenue from paid orders
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      // Last 5 orders
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email"),
      // Products with stock < 5
      Product.find({ stock: { $lt: 5 } })
        .select("name stock price")
        .limit(10),
      // Sales data (Daily revenue for charts — last 30 days)
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalPrice" },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 30 },
      ]),
      // Top products (By quantity sold)
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.name",
            totalSold: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),
      // Orders placed today
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    // Format salesData for Recharts
    const salesData = salesDataResult.map((item) => ({ date: item._id, revenue: item.revenue }));
    const topProducts = topProductsResult.map((item) => ({
      name: item._id,
      sold: item.totalSold,
      revenue: item.revenue,
    }));

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      ordersToday,
      recentOrders,
      lowStockProducts,
      salesData,
      topProducts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/orders
 * Get all orders with search, filter, and pagination
 */
const getAdminOrders = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const statusFilter = req.query.status;
    const search = req.query.search || "";

    // Build base query
    const query = {};
    if (statusFilter && statusFilter !== "all") {
      query.status = statusFilter;
    }

    // If search provided, find matching users first then filter orders
    let userIds = [];
    if (search) {
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      }).select("_id");
      userIds = matchingUsers.map((u) => u._id);
      query.user = { $in: userIds };
    }

    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      orders,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/orders/:id
 * Get a single order with full details
 */
const getAdminOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .lean();

    if (!order) {
      return next({ statusCode: 404, message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users
 * Get all users (paginated)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search || "";

    const query = search
      ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
      : {};

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password -refreshToken")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ users, page, totalPages: Math.ceil(total / limit), total });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/users/:id/role
 * Change a user's role
 * Body: { role }
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return next({
        statusCode: 400,
        message: "Role must be 'user' or 'admin'",
      });
    }

    if (req.params.id === req.user._id.toString()) {
      return next({
        statusCode: 400,
        message: "You cannot change your own role",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: "-password -refreshToken" }
    );

    if (!user) {
      return next({
        statusCode: 404,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      message: "User role updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/users/:id
 * Delete a user
 */
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return errorResponse(res, "Validation Error", "You cannot delete your own account", 400);
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return errorResponse(res, "Not Found", "User not found", 404);
    }

    return successResponse(res, null, "User deleted successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/email-settings
 * Get email settings (singleton)
 */
const getEmailSettings = async (req, res, next) => {
  try {
    let settings = await EmailSettings.findOne();
    if (!settings) {
      settings = await EmailSettings.create({});
    }
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/email-settings
 * Update email settings
 */
const updateEmailSettings = async (req, res, next) => {
  try {
    const { enabled, orderConfirmation, statusUpdates } = req.body;
    
    let settings = await EmailSettings.findOne();
    if (!settings) {
      settings = new EmailSettings();
    }

    if (enabled !== undefined) settings.enabled = enabled;
    if (orderConfirmation !== undefined) settings.orderConfirmation = orderConfirmation;
    if (statusUpdates !== undefined) settings.statusUpdates = statusUpdates;

    await settings.save();
    
    // Invalidate the memory cache so the next email uses the fresh settings immediately
    clearSettingsCache();
    
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAdminOrders,
  getAdminOrderById,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getEmailSettings,
  updateEmailSettings,
};
