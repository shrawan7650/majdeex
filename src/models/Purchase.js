// models/Purchase.js
const mongoose = require("mongoose");

const PurchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],
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
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: true,
          min: [0, "Price must be a positive number"],
        },
      },
    ],
    category: {
      type: String,
      enum: ["digital", "physical"],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount must be a positive number"],
    },
    trackingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tracking",
      required: function () {
        return this.category === "physical"; // Only required for physical orders
      },
    },
    paymentVerified: {
      type: Boolean,
      default: false,
    },
    purchaseDate: { 
      type: Date, 
      default: Date.now 
    },
  },
  { timestamps: true }
);

PurchaseSchema.index({ userId: 1, orderId: 1 });

module.exports = mongoose.model("Purchase", PurchaseSchema);
