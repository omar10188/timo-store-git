const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  toggleWishlist,
  getWishlist,
  clearWishlist,
} = require("../controllers/wishlistController");

router.use(protect);

router.route("/")
  .get(getWishlist)
  .delete(clearWishlist);

router.route("/:productId")
  .post(toggleWishlist);

module.exports = router;
