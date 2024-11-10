const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      name: {
        type: String,
        required: true,
      },
    },
  ],
  totalAmount: { type: Number, required: true },

  phone: {
    type: String,
    required: [true, "Phone number is required"],
    validate: {
      validator: function (value) {
        return /^[0-9]{10}$/.test(value); // Validate phone number (10 digits)
      },
      message: "Invalid Phone Number",
    },
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    validate: {
      validator: function (value) {
        return /^\S+@\S+\.\S+$/.test(value); // Basic email validation regex
      },
      message: "Invalid Email Address",
    },
  },

  // Conditionally required field
  deliveryAddress: {
    street: {
      type: String,
      required: function () {
        return this.category !== "digital";
      },
      message: "Street is required for physical products",
    },
    city: {
      type: String,
      required: function () {
        return this.category !== "digital";
      },
      message: "City is required for physical products",
    },
    state: {
      type: String,
      required: function () {
        return this.category !== "digital";
      },
      message: "State is required for physical products",
    },
    zipCode: {
      type: String,
      required: function () {
        return this.category !== "digital";
      },
      validate: {
        validator: function (value) {
          return /^[0-9]{5}$/.test(value); // Simple regex to validate zip code (e.g., 12345)
        },
        message: "Invalid Zip Code",
      },
    },
    country: {
      type: String,
      required: function () {
        return this.category !== "digital";
      },
      message: "Country is required for physical products",
    },
  },
  category: { type: String, required: true, enum: ["digital", "physical"] }, // Added 'category' to determine if the product is digital or physical
  paymentStatus: { type: String, required: true },
  orderStatus: { type: String, required: true },
  email: { type: String, required: true },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
