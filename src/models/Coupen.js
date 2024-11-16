const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true, // Remove any extra spaces from the code
    },

    discountPercentage: {
      type: Number,
      required: true, 
      
    },

    expiryDate: {
      type: Date,
      required: true,  
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    productId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true, 
      },
    ],

    usedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User ",
      default: [],
     
      
      },
    },
  
  { timestamps: true }
);

// Export the Coupon model
module.exports = mongoose.model("Coupon", CouponSchema);