const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Name is required"], 
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address"
      ],
      index: true
    },
    password: { 
      type: String, 
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"]
    },
    role: { 
      type: String, 
      enum: ["user", "admin"], 
      default: "user" 
    },
    refreshToken: { type: String, default: null },
    avatar: { type: String, default: "" },
    phone: { 
      type: String, 
      default: "",
      match: [/^$|^\+?[1-9]\d{1,14}$/, "Please provide a valid phone number"]
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      country: { type: String, default: "" },
      postalCode: { type: String, default: "" },
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

// Virtual field for full address string
userSchema.virtual("fullAddress").get(function () {
  if (!this.address.street) return "No address provided";
  return `${this.address.street}, ${this.address.city}, ${this.address.postalCode}, ${this.address.country}`;
});

// Ensure virtuals are included in JSON output
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("User", userSchema);
