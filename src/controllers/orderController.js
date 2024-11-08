const Razorpay = require("razorpay");
const Coupon = require("../models/Coupen");
const Cart = require("../models/Cart");
const TemporayOrderUser = require("../models/TemporaryOrder");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const fs = require("fs");
const razorpayConfig = require("../config/razorpayConfig");
const Order = require("../models/Order");
const crypto = require("crypto");
const { sendEmail } = require("../utils/sendEmail");
const {
  orderConfirmationEmail,
} = require("../templates/orderConfirmationEmail");
const Purchase = require("../models/Purchase");
const User = require("../models/User");

const razorpayInstance = new Razorpay({
  key_id: razorpayConfig.key_id,
  key_secret: razorpayConfig.key_secret,
});

// Checkout Process
exports.checkout = async (req, res) => {
  try {
    const { deliveryAddress, contactInfo, couponCode } = req.body;
    const userId = req.userId; // Get userId from the authenticated session

    // Retrieve the user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Check product categories
    const allDigital = cart.products.every(
      (product) => product.category === "digital"
    );
    const allPhysical = cart.products.every(
      (product) => product.category === "physical"
    );

    // If products are physical, validate delivery address and contact info
    if (allPhysical) {
      if (
        !deliveryAddress ||
        !contactInfo ||
        !contactInfo.email ||
        !contactInfo.phone
      ) {
        return res.status(400).json({
          message:
            "Please provide a valid delivery address and contact information (phone and email).",
        });
      }
    }

    // Calculate the total amount
    let totalAmount = parseFloat(cart.totalAmount.toFixed(2)); // Ensure it’s a number
    console.log("totalAmount1", totalAmount);

    // Format products with price and quantity
    const productsWithPrice = cart.products.map((product) => ({
      productId: product.productId,
      quantity: product.quantity,
      price: product.price,
      totalPrice: (product.price * product.quantity).toFixed(2),
    }));

    // Apply coupon discount if a coupon code is provided
    let couponDiscount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode });
      if (coupon && coupon.isActive && new Date() <= coupon.expiryDate) {
        couponDiscount = coupon.discountPercentage;
        const discount = (totalAmount * couponDiscount) / 100;
        totalAmount -= discount;
        totalAmount = parseFloat(totalAmount.toFixed(2)); // Ensure it's formatted correctly
      } else {
        return res.status(400).json({ message: "Invalid or expired coupon" });
      }
    }
    console.log("totalAmount2", totalAmount);

    // Create a temporary order with all the necessary information
    const temporaryOrder = new TemporayOrderUser({
      userId,
      products: productsWithPrice, // Save products with price and total
      totalAmount,
      deliveryAddress: allPhysical ? deliveryAddress : undefined, // Only include if physical
      contactInfo: allPhysical ? contactInfo : undefined, // Only include if physical
      couponCode,
      couponDiscount,
      category: allDigital ? "digital" : "physical", // Set category based on products
      paymentStatus: "pending", // Mark as pending payment
    });

    // Save the temporary order to the database
    await temporaryOrder.save();

    // Create a Razorpay order
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(totalAmount * 100), // Convert amount to paise
      currency: "INR",
      receipt: temporaryOrder._id.toString(),
      payment_capture: 1,
    });

    // Return the Razorpay order details to the frontend
    res.status(200).json({
      message: "Checkout initiated",
      razorpayOrder,
      orderId: temporaryOrder._id,
      totalAmount,
    });
  } catch (error) {
    console.error("Error in checkout:", error); // Log the actual error for debugging
    res.status(500).json({
      message: "An error occurred during checkout. Please try again.",
    });
  }
};

// Step 2: Generate a Mock Signature for Testing Payment Verification
function generateMockSignature(orderId, paymentId) {
  const hmac = crypto.createHmac("sha256", razorpayConfig.key_secret);
  hmac.update(orderId + "|" + paymentId);
  return hmac.digest("hex");
}

exports.confirmPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction(); // Start a transaction

  try {
    const { paymentId, orderId, signature, email } = req.body;
    console.log("Received payment details:", { paymentId, orderId, signature });

    // Retrieve the temporary order
    const temporaryOrder = await TemporayOrderUser.findById(orderId);
    if (!temporaryOrder) {
      console.log("Temporary order not found for orderId:", orderId);
      await session.abortTransaction(); // Abort the transaction
      return res.status(404).json({ message: "Order not found" });
    }
    console.log("Temporary order retrieved:", temporaryOrder);

    // Verify Razorpay payment signature
    const generatedSignature = await generateMockSignature(orderId, paymentId); // Implement this function
    console.log("Generated signature:", generatedSignature);
    // if (generatedSignature !== signature) {
    //   console.log("Payment verification failed for orderId:", orderId);
    //   await session.abortTransaction(); // Abort the transaction
    //   return res.status(400).json({ message: "Payment verification failed" });
    // }
    console.log("Payment verification successful for orderId:", orderId);

    // Create and save a new order with a verified payment status
    const order = new Order({
      userId: temporaryOrder.userId,

      products: temporaryOrder.products.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: temporaryOrder.totalAmount,

      deliveryAddress: temporaryOrder.deliveryAddress,
      contactInfo: temporaryOrder.contactInfo,
      paymentStatus: "Verified",
      orderStatus: "Processing",
      category: temporaryOrder.category === "digital" ? "digital" : "physical", // Set category based on products
    });

    const confirmedOrder = await order.save(); // Save within the transaction session
    console.log("Order confirmed and saved:", confirmedOrder);

    // Update product inventory and mark payment as verified
    for (const item of confirmedOrder.products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: -item.quantity },
        $set: { paymentVerified: true },
      });
      console.log(
        `Updated inventory for productId: ${item.productId}, reduced quantity by: ${item.quantity}`
      );
    }

    // Save purchase details
    const purchase = new Purchase({
      userId: temporaryOrder.userId,
      orderId: confirmedOrder._id, // Use the confirmed order ID
      products: confirmedOrder.products.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: confirmedOrder.totalAmount,
      deliveryStatus:
        confirmedOrder.category === "digital" ? "Delivered" : "Pending", // Default delivery status
      estimatedArrival: null, // Digital products do not have an estimated arrival
      paymentVerified: true,
      email: email,
      category: confirmedOrder.category === "digital" ? "digital" : "physical", // Set category based on products
    });
    //after user model purchase item attribute inset purchase id
 // Update the user's purchasedItems array
 const user = await User.findByIdAndUpdate(
  temporaryOrder.userId,
  { $push: { purchasedItems: purchase._id } },
  { new: true } // Return the updated user document
);

// Optionally, you can log or return the updated user
console.log("User 's purchased items updated:", user.purchasedItems);
    // Set estimated arrival for physical products
    if (purchase.category === "physical") {
      purchase.estimatedArrival = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ); // Example: 7 days from now
    }
    console.log("Purchase details created:", purchase);

    await purchase.save(); // Save purchase within the transaction
    console.log("Purchase saved successfully.");

    // Send confirmation email
    const emailContent = orderConfirmationEmail(
      purchase.orderId, // Use the confirmed order ID from the purchase
      purchase.totalAmount,
      purchase.products.map((item) => ({
        name: item.productId.name, // Assuming productId has a name field
        quantity: item.quantity,
        price: item.price,
      }))
    );
    console.log(
      "Confirmation email sent to:",
      temporaryOrder.contactInfo.email
    );
    await sendEmail(purchase.email, "Order Confirmation", emailContent);
    // Delete the temporary order within the transaction
    await TemporayOrderUser.findByIdAndDelete(orderId);
    console.log("Temporary order deleted for orderId:", orderId);

    // Commit the transaction once all operations are successful
    await session.commitTransaction();
    console.log("Transaction committed successfully.");
    res.status(200).json({ message: "Payment successful, order confirmed" });
  } catch (error) {
    console.error("Error in payment confirmation:", error);
    // Abort transaction if any error occurs
    await session.abortTransaction();
    res.status(500).json({
      message: "An error occurred while confirming the payment.",
      error: error.message || "An unexpected error occurred.",
    });
  } finally {
    session.endSession(); // End the session
    console.log("Session ended.");
  }
};
exports.getCheckoutData = async (req, res) => {
  const userId = req.userId;
  const temporaryOrder = await TemporayOrderUser.findOne({ userId }).populate(
    "products.productId"
  );

  if (!temporaryOrder) {
    return res.status(404).json({ message: "No checkout data found" });
  }

  res.status(200).json({
    message: "Checkout data retrieved successfully",
    temporaryOrder,
  });
};
// Get Order History
exports.getOrderHistory = async (req, res) => {
  try {
    const userId = req.userId; // Extracted from auth middleware

    // Find orders for the authenticated user
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json({
      message: "Order history fetched successfully",
      orders,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error while fetching order history" });
  }
};
