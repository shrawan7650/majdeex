const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      price: Number,
    },
  ],
  totalAmount: { type: Number, required: true },
  deliveryAddress: {
    street: { type: String,  },
    city: { type: String, },
    state: { type: String,  },
    zipCode: { type: String, },
    country: { type: String, },
  },
  contactInfo: {
    phone: { type: String, },
    email: { type: String, },
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Verified", "Failed", "Refunded"],
    default: "Pending",
  },
  orderStatus: {
    type: String,
    enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Pending",
  },
  category: {
    type: String,
    enum: ["digital", "physical"],
    required: true,
  },
  orderDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
