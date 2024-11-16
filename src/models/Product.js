const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      enum: ["digital", "physical"],
      required: true,
    },

    ratings: {
      type: Number,
      default: 0,
    },

    inStock: {
      type: Boolean,
      default: true,
    },

    quantity: {
      type: Number,
      required: true,

      default: 0,
    },

    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        reviewId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Review",
        },
      },
    ],

    paymentVerified: {
      type: Boolean,
      default: false,
    },

    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
  },
  { timestamps: true }
);

// Export the Product model
module.exports = mongoose.model("Product", ProductSchema);
