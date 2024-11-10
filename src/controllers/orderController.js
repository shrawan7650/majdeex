const Razorpay = require("razorpay");
const Coupon = require("../models/Coupen");
const Cart = require("../models/Cart");
const TemporaryOrder = require("../models/TemporaryOrder");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const razorpayConfig = require("../config/razorpayConfig");
const Order = require("../models/Order");
const crypto = require("crypto");
const { sendEmail } = require("../utils/sendEmail");
const {
  orderConfirmationEmail,
} = require("../templates/orderConfirmationEmail");
const Purchase = require("../models/Purchase");
const User = require("../models/User");
const { handleResponse } = require("../utils/apiResponse"); // Ensure this is correctly imported
const Tracking = require("../models/Tracking");

const razorpayInstance = new Razorpay({
  key_id: razorpayConfig.key_id,
  key_secret: razorpayConfig.key_secret,
});

// Checkout Process
// Helper function to validate cart
const validateCart = async (userId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart || cart.products.length === 0) {
    throw { statusCode: 400, message: "Cart is empty" };
  }
  return cart;
};

// Helper function to validate delivery info
const validateDeliveryInfo = (allPhysical, deliveryAddress, contactInfo) => {
  if (
    allPhysical &&
    (!deliveryAddress ||
      !contactInfo ||
      !contactInfo.email ||
      !contactInfo.phone)
  ) {
    throw {
      statusCode: 400,
      message:
        "Please provide a valid delivery address and contact information (phone and email).",
    };
  }
};

// Helper function to apply coupon
const applyCouponDiscount = async (couponCode, totalAmount) => {
  if (!couponCode) return { discount: 0, totalAmount };

  const coupon = await Coupon.findOne({ code: couponCode });
  if (!coupon || !coupon.isActive || new Date() > coupon.expiryDate) {
    throw { statusCode: 400, message: "Invalid or expired coupon" };
  }

  const discount = (totalAmount * coupon.discountPercentage) / 100;
  return {
    discount: discount.toFixed(2),
    totalAmount: parseFloat((totalAmount - discount).toFixed(2)),
  };
};

// Helper function to prepare products for order
const formatCartProducts = (products) => {
  console.log(
    "Products before formatting: ",
  products
  )
  return products.map((product) => ({
    productId: product.productId,
    quantity: product.quantity,
    price: product.price,
    name: product.productName,
    totalPrice: (product.price * product.quantity).toFixed(2),
  }));
};

// Checkout Controller
exports.checkout = async (req, res) => {
  const { deliveryAddress, contactInfo, couponCode } = req.body;
  const userId = req.userId;

  try {
    const cart = await validateCart(userId);
    const allDigital = cart.products.every(
      (product) => product.category === "digital"
    );
    const allPhysical = cart.products.every(
      (product) => product.category === "physical"
    );

    validateDeliveryInfo(allPhysical, deliveryAddress, contactInfo);

    const productsWithPrice = formatCartProducts(cart.products);
    console.log(
"productsWithPrice",productsWithPrice

    )
    let { totalAmount } = cart;
    const { discount, totalAmount: discountedTotal } =
      await applyCouponDiscount(couponCode, totalAmount);

    // Create a temporary order
    const temporaryOrder = new TemporaryOrder({
      userId,
      products: productsWithPrice,
      totalAmount: discountedTotal,
      deliveryAddress: allPhysical ? deliveryAddress : undefined,
      contactInfo: allPhysical ? contactInfo : undefined,
      couponCode,
      couponDiscount: discount,
      category: allDigital ? "digital" : "physical",
      paymentStatus: "pending",
    });

    await temporaryOrder.save();

    // Create a Razorpay order
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(discountedTotal * 100),
      currency: "INR",
      receipt: temporaryOrder._id.toString(),
      payment_capture: 1,
    });

    // Return Razorpay order details
    return handleResponse(
      res,
      {
        razorpayOrder,
        orderId: temporaryOrder._id,
        totalAmount: discountedTotal,
      },
      "Checkout initiated",
      200
    );
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message =
      error.message || "An error occurred during checkout. Please try again.";
    console.error("Error in checkout:", error);
    return handleResponse(res, null, message, statusCode);
  }
};

// Generate a Mock Signature for Testing Payment Verification

// Confirm Payment
// Generate Mock Signature for Testing
function generateMockSignature(orderId, paymentId) {
  const hmac = crypto.createHmac("sha256", razorpayConfig.key_secret);
  hmac.update(orderId + "|" + paymentId);
  return hmac.digest("hex");
}

// Helper to verify payment signature
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  const generatedSignature = generateMockSignature(orderId, paymentId);
  if (generatedSignature !== signature) {
    throw { statusCode: 400, message: "Payment verification failed" };
  }
};

// Helper to create a new order
const createOrder = async (temporaryOrder, email, phone) => {

  console.log("Creating order with temporaryOrder:", temporaryOrder,email,phone);
  const orderData = {
    userId: temporaryOrder.userId,
    products: temporaryOrder.products.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      name: item.name,

    })),
    totalAmount: temporaryOrder.totalAmount,
    contactInfo: temporaryOrder.contactInfo,
    paymentStatus: "Verified",
    orderStatus: "Processing",
    category: temporaryOrder.category,
 
      email: email,
      phone: phone,
  

  };

  // Only add deliveryAddress if category is not "digital"
  if (temporaryOrder.category !== "digital") {
    orderData.deliveryAddress = temporaryOrder.deliveryAddress;
  }

  const order = new Order(orderData);
  return await order.save();
};

// Helper to update product inventory
const updateInventory = async (products) => {
  for (const item of products) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { quantity: -item.quantity },
      $set: { paymentVerified: true },
    });
  }
};

// Helper to create purchase record
const createPurchaseRecord = async (userId, confirmedOrder, email) => {
  const purchase = new Purchase({
    userId,
    orderId: confirmedOrder._id,
    products: confirmedOrder.products,
    totalAmount: confirmedOrder.totalAmount,
    deliveryStatus:
      confirmedOrder.category === "digital" ? "Delivered" : "Pending",
    estimatedArrival:
      confirmedOrder.category === "physical"
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        : null,
    paymentVerified: true,
    email,
    category: confirmedOrder.category,
  });
  return await purchase.save();
};

// Helper to send confirmation email
const sendConfirmationEmail = async (purchase) => {
  console.log(
    "Purchase record created:",
    purchase
  )
  const emailContent = orderConfirmationEmail(
    purchase.orderId,
    purchase.totalAmount,
    purchase.products.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }))
  );
  await sendEmail(purchase.email, "Order Confirmation", emailContent);
};

// Helper to delete coupon by product
async function deleteCouponByProduct(productId, orderConfirmed) {
  try {
    // Check if the order is confirmed
    if (!orderConfirmed) {
      console.log("Order not confirmed, coupon will not be deleted.");
      return;
    }

    // Find and delete the coupon with the given productId
    const deletedCoupon = await Coupon.findOneAndDelete({
      productId: productId,
      isActive: true, // Ensure only active coupons are deleted
    });

    if (deletedCoupon) {
      console.log(`Coupon with code ${deletedCoupon.code} deleted successfully.`);
    } else {
      console.log("No active coupon found for the specified product.");
    }
  } catch (error) {
    console.error("Error deleting coupon:", error.message);
  }
}
async function deleteCartByProduct(userId, productId, orderConfirmed) {
  console.log(
    "Deleting cart for product",
    productId,
    "for user",
    userId,
    "with order confirmed:",
    orderConfirmed
  );

  try {
    // Check if the order is confirmed
    if (!orderConfirmed) {
      console.log("Order not confirmed, cart will not be deleted.");
      return;
    }

    // Convert the productId to ObjectId using `new` keyword
    const productObjectId = new mongoose.Types.ObjectId(productId);

    // Find the cart for the specific user and remove the product with the given productId
    const updatedCart = await Cart.updateOne(
      { 
        userId: userId, // Ensure the cart belongs to the specified user
        "products.productId": productObjectId, // Ensure the productId is treated as ObjectId
      },
      { 
        $pull: { 
          products: { productId: productObjectId } // Remove the product
        }
      }
    );

    if (updatedCart.modifiedCount > 0) {
      console.log(`Product with ID ${productId} deleted from the cart for user ${userId}.`);

      // Optionally, update the totalAmount of the cart after deletion
      const cart = await Cart.findOne({ userId: userId }); // Fetch the updated cart for the user
      if (cart) {
        const updatedTotalAmount = cart.products.reduce((acc, product) => acc + (product.price * product.quantity), 0);
        cart.totalAmount = updatedTotalAmount;
        await cart.save();

        console.log(`Updated total amount for user ${userId}: ${updatedTotalAmount}`);
      }
    } else {
      console.log("Product not found in the cart for user:", userId);
    }
  } catch (error) {
    console.error("Error deleting product from cart:", error.message);
  }
}


async function confirmOrderAndCreateTracking(orderId, estimatedArrivalDate) {
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the purchase
    const purchase = await Purchase.findById(orderId);
    if (!purchase) throw new Error("Purchase not found");

    // Create tracking document only for physical products
    let tracking;
    if (purchase.category === "physical") {
      tracking = await Tracking.create(
        [
          {
            orderId: purchase._id,
            estimatedArrival: estimatedArrivalDate,
            trackingUpdates: [
              { status: "Pending", timestamp: new Date(), remarks: "Order placed" },
            ],
          },
        ],
  
      );

      // Link tracking document to the purchase
      purchase.trackingId = tracking[0]._id;
      await purchase.save({ session });
    }

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return { purchase, tracking };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}
// Confirm Payment Controller
exports.confirmPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { paymentId, orderId, signature, email, phone } = req.body;
    console.log(req.body);

    // Retrieve the temporary order
    const temporaryOrder = await TemporaryOrder.findById(orderId);
    if (!temporaryOrder) {
      throw { statusCode: 404, message: "Order not found" };
    }

    // Verify payment signature
    // verifyPaymentSignature(orderId, paymentId, signature);

    // Create and save new order
    const confirmedOrder = await createOrder(temporaryOrder, email, phone);
    console.log("New order created:", confirmedOrder);

    // Update product inventory
    const updateInventoryData = await updateInventory(confirmedOrder.products);
    console.log("Product inventory updated:", updateInventoryData);

    // Create purchase record and associate with user
    const purchase = await createPurchaseRecord(
      temporaryOrder.userId,
      confirmedOrder,
      email
    );
    await User.findByIdAndUpdate(temporaryOrder.userId, {
      $push: { purchasedItems: purchase._id },
    });

    // Send confirmation email


    // Call the tracking creation function only for physical orders
    if (confirmedOrder.category === "physical") {
      const estimatedArrivalDate = new Date(); // Example: You can set the actual estimated arrival date
      await confirmOrderAndCreateTracking(confirmedOrder._id, estimatedArrivalDate);
      console.log("Tracking information created for physical order.");
    }

    // Delete temporary order and commit transaction
  

      // Loop through products and delete associated coupons after order confirmation
      for (const product of confirmedOrder.products) {
        await deleteCouponByProduct(product.productId, true);
      }
      // Loop through products and delete associated cart after order confirmation
      for (const product of confirmedOrder.products) {
        await deleteCartByProduct( 
          confirmedOrder.userId, product.productId, true);
        
      }
      await TemporaryOrder.findByIdAndDelete(orderId);
 
   
      await sendConfirmationEmail(purchase);
    await session.commitTransaction();

    return handleResponse(
      res,
      null,
      "Payment successful, order confirmed",
      200
    );
  } catch (error) {
    await session.abortTransaction();
    const statusCode = error.statusCode || 500;
    const message =
      error.message || "An error occurred while confirming the payment.";
    console.error("Error in payment confirmation:", error);
    return handleResponse(res, null, message, statusCode);
  } finally {
    session.endSession();
  }
};

// Get Checkout Data
exports.getCheckoutData = async (req, res) => {
  const userId = req.userId;

  try {
    const temporaryOrder = await TemporaryOrderUser.findOne({
      userId,
    }).populate("products.productId");
    if (!temporaryOrder) {
      return handleResponse(res, null, "No checkout data found", 404);
    }

    return handleResponse(
      res,
      temporaryOrder,
      "Checkout data retrieved successfully",
      200
    );
  } catch (error) {
    console.error("Error fetching checkout data:", error);
    return handleResponse(
      res,
      null,
      "An error occurred while retrieving checkout data.",
      500
    );
  }
};

// Get Order History
exports.getOrderHistory = async (req, res) => {
  const userId = req.userId;

  try {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    if (orders.length === 0) {
      return handleResponse(res, null, "No orders found for this user", 404);
    }

    return handleResponse(
      res,
      orders,
      "Order history fetched successfully",
      200
    );
  } catch (error) {
    console.error("Error fetching order history:", error);
    return handleResponse(
      res,
      null,
      "Server error while fetching order history",
      500
    );
  }
};
