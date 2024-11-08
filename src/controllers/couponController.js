const Cart = require("../models/Cart");
const Coupon = require("../models/Coupen");
const Product = require("../models/Product");

// Create a new coupon
exports.createCoupon = async (req, res) => {
    const { code, discountPercentage, expiryDate, isActive, productId } = req.body;

    try {
      // Log the incoming request data for debugging
      console.log("Received coupon data:", req.body);
  
      // Check if the coupon code already exists
      const existingCoupon = await Coupon.findOne({ code });
      if (existingCoupon) {
        console.log("Coupon code already exists:", code);
        return res.status(400).json({ message: "Coupon code already exists" });
      }
  
      // Validate product IDs
      const validProducts = await Product.find({ _id: { $in: productId } });
      console.log("Valid products found:", validProducts);
      if (validProducts.length !== productId.length) {
        console.log("Invalid product IDs detected.");
        return res.status(400).json({ message: "Some product IDs are invalid" });
      }
  
      // Create and save the new coupon
      const newCoupon = new Coupon({ code, discountPercentage, expiryDate, isActive, productId });
      await newCoupon.save();
      console.log("New coupon created:", newCoupon);
  
      // Update each product in productId with the new coupon ID
      const updateResult = await Product.updateMany(
        { _id: { $in: newCoupon.productId } },
        { $set: { coupon: newCoupon._id } } // Ensure this field matches your schema
      );
      console.log("Products updated with coupon ID:", updateResult);
  
      res.status(201).json(newCoupon);
    } catch (error) {
      console.error("Error in creating coupon:", error.message);
      res.status(500).json({ message: error.message });
    }
};

// Apply a coupon
exports.applyCoupon = async (req, res) => {
  const { couponCode, productId } = req.body;
  const userId = req.userId;

  try {
    // Find the coupon by code
    const coupon = await Coupon.findOne({ code: couponCode });
    console.log("coupen",coupon)
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    // Check if the coupon is active and not expired
    if (!coupon.isActive || new Date() > coupon.expiryDate) {
      return res.status(400).json({ message: "Coupon is inactive or expired" });
    }

    // Check if the coupon applies to the specific product
    if (!coupon.productId.includes(productId)) {
      return res
        .status(400)
        .json({ message: "Coupon does not apply to this product" });
    }
   // Check if the user has already used the coupon
   if (coupon.usedBy && coupon.usedBy.includes(userId)) {
    return res.status(400).json({ message: "Coupon already used by this user" });
  }
 
    const product = await Cart.findOne({ userId });
    console.log("product", product);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    console.log("prodct", product);

    // Calculate the discount
    const originalPrice = product.totalAmount;
    console.log("originalPrice", originalPrice);
    const discountAmount = (originalPrice * coupon.discountPercentage) / 100;
    const finalPrice = originalPrice - discountAmount;
    console.log("finalPrice", finalPrice);
    // Mark the coupon as used by adding the user to the `usedBy` array
      // Mark the coupon as used by adding the user to the `usedBy` array
      coupon.usedBy.push(userId);
      await coupon.save();


    // Send the response with discount details (excluding original price)
    res.status(200).json({
      message: "Coupon applied successfully",
      discountPercentage: coupon.discountPercentage,
      discountAmount: discountAmount.toFixed(2),
      finalPrice: finalPrice.toFixed(2),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error applying coupon", error: error.message });
  }
};
