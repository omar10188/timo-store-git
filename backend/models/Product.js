const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Product name is required"], 
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"]
    },
    slug: { 
      type: String, 
      unique: true, 
      lowercase: true,
      index: true 
    },
    description: { 
      type: String, 
      required: [true, "Description is required"], 
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"]
    },
    price: { 
      type: Number, 
      required: [true, "Price is required"], 
      min: [0, "Price cannot be negative"] 
    },
    discount: { 
      type: Number, 
      default: 0, 
      min: [0, "Discount cannot be less than 0"], 
      max: [100, "Discount cannot exceed 100%"] 
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product must belong to a category"],
      index: true
    },
    brand: { 
      type: String, 
      required: [true, "Brand is required"], 
      trim: true,
      index: true
    },
    stock: { 
      type: Number, 
      default: 0, 
      min: [0, "Stock cannot be negative"] 
    },
    ratingsAverage: { 
      type: Number, 
      default: 0,
      min: [0, "Rating cannot be below 0"],
      max: [5, "Rating cannot exceed 5"]
    },
    ratingsQuantity: { 
      type: Number, 
      default: 0,
      min: 0 
    },
    isFeatured: { 
      type: Boolean, 
      default: false,
      index: true 
    },
    images: [{ type: String }],
    image: { type: String, default: "" },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

// Indexes for search and performance
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ price: 1, ratingsAverage: -1 });

productSchema.pre("save", function () {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

// Virtual for discounted price
productSchema.virtual("salePrice").get(function () {
  if (!this.discount) return this.price;
  return +(this.price * (1 - this.discount / 100)).toFixed(2);
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

// Optimization: Indexes for faster query performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);