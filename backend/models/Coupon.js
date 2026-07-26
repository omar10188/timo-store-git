const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
      maxlength: [20, "Coupon code cannot exceed 20 characters"]
    },
    type: {
      type: String,
      enum: ["percent", "fixed"],
      default: "percent"
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [1, "Discount must be at least 1"],
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: [0, "Minimum order value cannot be negative"]
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required"],
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageLimit: {
      type: Number,
      default: null, 
      min: [1, "Usage limit must be at least 1"]
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0
    },
    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true
      },
    ],
  },
  { timestamps: true }
);

// Virtual: is this coupon still valid?
couponSchema.virtual("isValid").get(function () {
  const now = new Date();
  const notExpired = this.expiresAt > now;
  const withinLimit =
    this.usageLimit === null || this.usedCount < this.usageLimit;
  return this.isActive && notExpired && withinLimit;
});

couponSchema.set("toJSON", { virtuals: true });
couponSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Coupon", couponSchema);
