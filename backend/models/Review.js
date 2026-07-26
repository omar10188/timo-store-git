const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product", 
      required: [true, "Review must belong to a product"] 
    },
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: [true, "Review must belong to a user"] 
    },
    rating: { 
      type: Number, 
      required: [true, "Rating is required"], 
      min: [1, "Rating must be at least 1"], 
      max: [5, "Rating cannot exceed 5"] 
    },
    title: { 
      type: String, 
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"]
    },
    comment: { 
      type: String, 
      required: [true, "Review comment is required"], 
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"]
    },
  },
  { timestamps: true }
);

// Prevent user from submitting more than one review per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to update product average rating when a review is added/removed
reviewSchema.statics.calculateAverageRating = async function(productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', rating: { $avg: '$rating' }, numReviews: { $sum: 1 } } }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      ratingsAverage: stats[0].rating,
      ratingsQuantity: stats[0].numReviews
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsQuantity: 0
    });
  }
};

reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.product);
});

reviewSchema.pre('deleteOne', { document: true, query: false }, function() {
  this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model("Review", reviewSchema);
