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
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"], // Ensure at least 1 product is selected
        },
        price: {
          type: Number,
          required: true,
          min: [0, "Price must be a positive number"], // Ensure price is positive
        },
        name:{
          type: String, // Marked as required
          // unique: true, // Ensure product name is unique within the order
        },
        // Total price can be calculated dynamically
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount must be a positive number"], // Total must be positive
    },
    deliveryAddress: {
      street: { type: String }, // Marked as required
      city: { type: String}, // Marked as required
      state: { type: String}, // Marked as required
      zipCode: { type: String}, // Marked as required
      country: { type: String}, // Marked as required
    },
    contactInfo: {
      phone: { type: String }, // Mark phone as required
      email: {
        type: String,
       
        match: [/\S+@\S+\.\S+/, "Please provide a valid email address"], // Email validation
      },
    },
    couponCode: { type: String }, // You can later validate the coupon exists
    couponDiscount: { type: Number, default: 0, min: [0, "Discount cannot be negative"] }, // Ensure no negative discounts
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    category: {
      type: String,
      enum: ["digital", "physical"],
      required: true,
    },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);



module.exports = mongoose.model("TemporaryOrder", TemporaryOrderSchema);
