const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"], // Validate if code is provided
      trim: true, // Remove any extra spaces from the code
      minlength: [5, "Coupon code must be at least 5 characters long"], // Minimum length of coupon code
      maxlength: [15, "Coupon code cannot be more than 15 characters long"], // Maximum length of coupon code
      // Removed unique constraint to allow the same code for different products
    },

    discountPercentage: {
      type: Number,
      required: [true, "Discount percentage is required"], // Ensure discount percentage is provided
      min: [0, "Discount percentage cannot be less than 0"], // Validate that the discount is not negative
      max: [100, "Discount percentage cannot be more than 100"], // Validate that the discount is not greater than 100
    },

    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"], // Ensure expiry date is provided
      validate: {
        validator: function (value) {
          return value > Date.now(); // Ensure expiry date is in the future
        },
        message: "Expiry date must be a future date",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    productId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "At least one product ID is required"], // Ensure at least one product ID is provided
      },
    ],

    usedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User ",
      default: [],
      validate: {
        validator: function (value) {
          return value.every((userId) =>
            mongoose.Types.ObjectId.isValid(userId)
          ); // Validate all user IDs
        },
        message: "Invalid User ID(s)",
      },
    },
  },
  { timestamps: true }
);

// Export the Coupon model
module.exports = mongoose.model("Coupon", CouponSchema);