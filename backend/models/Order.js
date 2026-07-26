const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Product reference is required"],
  },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: [0, "Price cannot be negative"] },
  image: { type: String, default: "" },
  quantity: { type: Number, required: true, min: [1, "Quantity must be at least 1"] },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
      index: true
    },
    items: [orderItemSchema], // Snapshots of product details at time of order
    subtotal: { 
      type: Number, 
      required: true, 
      min: [0, "Subtotal cannot be negative"] 
    },
    coupon: { type: String, default: null },
    discount: { 
      type: Number, 
      default: 0,
      min: [0, "Discount cannot be negative"]
    },
    totalPrice: { 
      type: Number, 
      required: true, 
      min: [0, "Total price cannot be negative"] 
    },
    shippingAddress: {
      street: { type: String, required: [true, "Street address is required"] },
      city: { type: String, required: [true, "City is required"] },
      country: { type: String, required: [true, "Country is required"] },
      postalCode: { type: String, default: "" },
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "cash_on_delivery"],
      default: "cash_on_delivery",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true
    },
    stripePaymentIntentId: { type: String, default: null },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true
    },
    cancelledAt: { type: Date, default: null },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Index to query recent orders quickly
orderSchema.index({ createdAt: -1 });

// Optimization: Indexes for faster query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model("Order", orderSchema);
