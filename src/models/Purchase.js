const mongoose = require("mongoose");

const PurchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User ",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    //email
    email: { type: String, required: true },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true }, // Added quantity
        price: { type: Number, required: true }, // Added price
       
      },
    ],
    category: { type: String, enum: ["digital", "physical"], required: true },
    totalAmount: { type: Number, required: true },
    deliveryStatus: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"], // Added enum for delivery status
      default: "Pending",
    },
    estimatedArrival: {
      type: Date, // For physical products
    },
    paymentVerified: {
      type: Boolean,
      default: false, // To track if payment is verified
    },
    purchaseDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Optionally, you can create indexes
PurchaseSchema.index({ userId: 1, orderId: 1 }); // Example index

module.exports = mongoose.model("Purchase", PurchaseSchema);