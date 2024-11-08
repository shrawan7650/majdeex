const mongoose = require("mongoose");

// Temporary Order Schema (until payment confirmation)
const TemporaryOrderSchema = new mongoose.Schema(
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
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        totalPrice: {
          type: Number,
          default: 0, // Assuming product price is stored in the product model
        },

        // Assuming you have a Product model with a price field
      },
    ],
    totalAmount: { type: Number, required: true },
    deliveryAddress: {
      street: { type: String, },
      city: { type: String, },
      state: { type: String, },
      zipCode: { type: String,},
      country: { type: String,},
    },
    contactInfo: {
      phone: { type: String,  },
      email: { type: String, },
    },
    couponCode: { type: String },
    couponDiscount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    category: { type: String, enum: ['digital', 'physical'], required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TemporaryOrder", TemporaryOrderSchema);
