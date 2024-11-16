const Cart = require("../models/Cart");
const Coupon = require("../models/Coupen");
const Product = require("../models/Product");
const mongoose = require('mongoose');
// Helper function to check coupon validity
const isCouponValid = (coupon, userId) => {
  if (!coupon.isActive || new Date() > coupon.expiryDate) {
    return { valid: false, message: "Coupon is inactive or expired" };
  }

  if (coupon.usedBy.length >= 1) {
    return { valid: false, message: "Coupon already used by this user" };
  }
  return { valid: true };
};

// Create a new coupon
exports.createCoupon = async (req, res) => {
  const { code, discountPercentage, expiryDate, isActive } = req.body;
  let { productId } = req.params;
console.log(
  "Received coupon data:", req.body,
  "productId:", productId,

 );
  // Trim any extraneous characters from productId
  productId = productId.replace(/[^a-zA-Z0-9]/g, '');
  try {
    // Check if the coupon code already exists for the product
    const existingCoupon = await Coupon.findOne({
      code,
      productId: { $in: productId },
    });
    console.log(
      "Coupon code already exists for the product:", existingCoupon
    )
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    // Ensure productId is valid
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }
    console.log("ok")

    // Create and save the new coupon
    const newCoupon = new Coupon({
      code,
      discountPercentage,
      expiryDate,
      isActive,
      productId,
    });
console.log("ok1")
    await newCoupon.save();

    // Update the product with the coupon ID
    await Product.updateOne(
      { _id: productId },
      { $set: { coupon: newCoupon._id } }
    );

    return res.status(201).json({ message: "Coupon created successfully", coupon: newCoupon });
  } catch (error) {
    console.error("Error in creating coupon:", error.message);
    return res.status(500).json({ message: "Error in creating coupon", error: error.message });
  }
}

// Apply a coupon
exports.applyCoupon = async (req, res) => {
  const { couponCode } = req.body;
  const { productId } = req.params;
  const userId = req.userId;

  try {
    // Find the coupon by code
    const coupon = await Coupon.findOne({ code: couponCode });
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    // Validate the coupon
    const { valid, message } = isCouponValid(coupon, userId);
    if (!valid) {
      return res.status(400).json({ message });
    }

    // Check if the coupon applies to the specific product
    if (!coupon.productId.includes(productId)) {
      return res.status(400).json({ message: "Coupon does not apply to this product" });
    }

    // Fetch user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Calculate the discount
    const originalPrice = cart.totalAmount;
    const discountAmount = (originalPrice * coupon.discountPercentage) / 100;
    const finalPrice = originalPrice - discountAmount;

    // Mark the coupon as used
    coupon.usedBy = coupon.usedBy || [];
    coupon.usedBy.push(userId);
    await coupon.save();

    // Send the response with discount details
    return res.status(200).json({
      message: "Coupon applied successfully",
      discountPercentage: coupon.discountPercentage,
      discountAmount: discountAmount.toFixed(2),
      finalPrice: finalPrice.toFixed(2),
    });
  } catch (error) {
    console.error("Error applying coupon:", error.message);
    return res.status(500).json({ message: "Error applying coupon", error: error.message });
  }
};
