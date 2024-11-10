const Cart = require("../models/Cart");
const Coupon = require("../models/Coupen");
const Product = require("../models/Product");
const { handleResponse } = require("../utils/apiResponse"); // Assuming this utility exists

// Helper function to validate product IDs
const validateProductIds = async (productIds) => {
  // Ensure productIds is an array, even if a single ID is provided
  if (!Array.isArray(productIds)) {
    productIds = [productIds];
  }

  console.log("Validating product IDs:", productIds);

  // Find all products that match the provided IDs
  const validProducts = await Product.find({ _id: { $in: productIds } });

  console.log("Valid products found:", validProducts);

  // Check if all provided IDs have corresponding valid products
  return validProducts.length === productIds.length ? productIds : false;
};

// Helper function to check coupon validity
const isCouponValid = (coupon, userId) => {
  //debug
  console.log("couen", coupon);
  console.log("userID", userId);
  if (!coupon.isActive || new Date() > coupon.expiryDate) {
    return { valid: false, message: "Coupon is inactive or expired" };
  }
  console.log("coupon.usedBy.length",coupon.usedBy.length)
  // Check if the coupon has already been used by the user
  if (coupon.usedBy.length>=1) {
    return { valid: false, message: "Coupon already used by this user" };
  }
  return { valid: true };
};

// Create a new coupon
exports.createCoupon = async (req, res) => {
  const { code, discountPercentage, expiryDate, isActive } = req.body;
  console.log("Received coupon data:", req.body);
  const { productId } = req.params;
  //debug
  console.log("Creating coupon for product:", productId);

  try {
    // Check if the coupon code already exists
    // Check if the coupon code already exists for this product
// Check if the coupon code already exists for any of the specified products
const existingCoupon = await Coupon.findOne({
  code,
  productId: { $in: productId },
});
    if (existingCoupon) {
      return handleResponse(res, null, "Coupon code already exists", 400);
    }

    // Validate product IDs
    const areValidProducts = await validateProductIds(productId);
    console.log(
      "Validating product IDs:",
      areValidProducts,
      "Coupon for product:",
      productId
    );
    if (!areValidProducts) {
      return handleResponse(res, null, "Some product IDs are invalid", 400);
    }

    // Create and save the new coupon
    const newCoupon = new Coupon({
      code,
      discountPercentage,
      expiryDate,
      isActive,
      productId,
    });

    await newCoupon.save();
    console.log("New coupon created:", newCoupon);

    // Update each product with the new coupon ID
    await Product.updateMany(
      { _id: { $in: newCoupon.productId } },
      { $set: { coupon: newCoupon._id } }
    );

    return handleResponse(res, newCoupon, "Coupon created successfully", 201);
  } catch (error) {
    console.error("Error in creating coupon:", error.message);
    return handleResponse(res, null, error.message, 500);
  }
};

// Apply a coupon
exports.applyCoupon = async (req, res) => {
  const { couponCode } = req.body;
  console.log("Received coupon application data:", req.body);
  const { productId } = req.params;

  const userId = req.userId;
  console.log("Applying coupon for userId:", userId);

  try {
    // Find the coupon by code
    const coupon = await Coupon.findOne({ code: couponCode });
    console.log("coupon", coupon);
    if (!coupon) {
      return handleResponse(res, null, "Coupon not found", 404);
    }

    // Validate the coupon
    const { valid, message } = isCouponValid(coupon, userId);
    console.log("Coupon validation result:", valid, message);
    if (!valid) {
      return handleResponse(res, null, message, 400);
    }

    // Check if the coupon applies to the specific product
    if (!coupon.productId.includes(productId)) {
      return handleResponse(
        res,
        null,
        "Coupon does not apply to this product",
        400
      );
    }

    // Fetch user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return handleResponse(res, null, "Cart not found", 404);
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
    return handleResponse(
      res,
      {
        discountPercentage: coupon.discountPercentage,
        discountAmount: discountAmount.toFixed(2),
        finalPrice: finalPrice.toFixed(2),
      },
      "Coupon applied successfully",
      200
    );
  } catch (error) {
    console.error("Error applying coupon:", error.message);
    return handleResponse(res, null, "Error applying coupon", 500);
  }
};
