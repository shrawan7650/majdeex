const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, 
    
    },
    products: [
      {
        productId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Product", 
          required: true, 
        },
        quantity: { 
          type: Number, 
          default: 0, 
        },
      }
    ],
    totalAmount: { 
      type: Number, 
      default: 0, 
      min: 0, 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);
