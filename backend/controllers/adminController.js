const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

/**
 * GET /api/admin/stats
 * Get dashboard overview statistics
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueResult,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Product.countDocuments(),
      Order.countDocuments(),
      // Total revenue from paid orders
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
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
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      lowStockProducts,
    });
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
      const err = new Error("Role must be 'user' or 'admin'");
      err.statusCode = 400;
      return next(err);
    }

    // Prevent admin from demoting themselves
    if (req.params.id === req.user._id.toString()) {
      const err = new Error("You cannot change your own role");
      err.statusCode = 400;
      return next(err);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: "-password -refreshToken" }
    );

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }

    res.json(user);
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
      const err = new Error("You cannot delete your own account");
      err.statusCode = 400;
      return next(err);
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getAllUsers, updateUserRole, deleteUser };
