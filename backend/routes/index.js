const express = require("express");
const router = express.Router();

router.use("/auth", require("./authRoutes"));
router.use("/products", require("./productRoutes"));
router.use("/categories", require("./categoryRoutes"));
router.use("/orders", require("./orderRoutes"));
router.use("/cart", require("./cartRoutes"));
router.use("/wishlist", require("./wishlistRoutes"));
router.use("/coupons", require("./couponRoutes"));
router.use("/reviews", require("./reviewRoutes"));
router.use("/admin", require("./adminRoutes"));
router.use("/payments", require("./paymentRoutes"));
router.use("/upload", require("./uploadRoutes"));
router.use("/images", require("./imageRoutes"));

module.exports = router;
