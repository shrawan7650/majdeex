// models/Tracking.js
const mongoose = require("mongoose");

const TrackingSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    currentStatus: {
      type: String,
      enum: ["Pending", "Shipped", "In Transit", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Pending",
    },
    estimatedArrival: {
      type: Date,
      required: true, // Required for physical orders
    },
    trackingUpdates: [
      {
        status: {
          type: String,
          enum: ["Shipped","Pending", "In Transit", "Out for Delivery", "Delivered"],
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        location: {
          type: String,
          default: "",
        },
        remarks: {
          type: String,
          default: "",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tracking", TrackingSchema);
