const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: [0, "Price cannot be negative"] },
    image: { type: String, default: "" },
    quantity: { type: Number, required: true, min: [1, "Quantity must be at least 1"], default: 1 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Cart must belong to a user"],
      unique: true, 
      index: true
    },
    items: [cartItemSchema],
    totalPrice: {
      type: Number,
      default: 0,
      min: [0, "Total price cannot be negative"]
    },
  },
  { timestamps: true }
);

// Auto-calculate totalPrice before saving
cartSchema.pre("save", function () {
  this.totalPrice = (this.items || []).reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
});

module.exports = mongoose.model("Cart", cartSchema);
