const Order = require("../models/Order");
const User = require("../models/User");

/**
 * Helper to get date range
 */
const getDateRange = (range) => {
  const date = new Date();
  if (range === "7d") date.setDate(date.getDate() - 7);
  else if (range === "30d") date.setDate(date.getDate() - 30);
  else if (range === "1y") date.setFullYear(date.getFullYear() - 1);
  else date.setDate(date.getDate() - 30); // Default to 30 days
  return date;
};

/**
 * GET /api/admin/analytics/summary
 */
const getSummary = async (req, res, next) => {
  try {
    const range = req.query.range || "30d";
    const startDate = getDateRange(range);

    const [totalOrders, totalUsers, revenueResult] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: startDate } }),
      User.countDocuments({ role: "user", createdAt: { $gte: startDate } }),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

    res.json({
      totalOrders,
      totalCustomers: totalUsers,
      totalRevenue,
      averageOrderValue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/analytics/sales
 */
const getSales = async (req, res, next) => {
  try {
    const range = req.query.range || "30d";
    const startDate = getDateRange(range);

    // If range is 1 year, group by month, else group by day
    const format = range === "1y" ? "%Y-%m" : "%Y-%m-%d";

    const salesData = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: format, date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formattedSales = salesData.map((item) => ({
      date: item._id,
      revenue: item.revenue,
    }));

    res.json(formattedSales);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/analytics/top-products
 */
const getTopProducts = async (req, res, next) => {
  try {
    const range = req.query.range || "30d";
    const startDate = getDateRange(range);

    const topProductsResult = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: startDate } } },
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
    ]);

    const topProducts = topProductsResult.map((item) => ({
      name: item._id,
      sold: item.totalSold,
      revenue: item.revenue,
    }));

    res.json(topProducts);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getSales,
  getTopProducts,
};
