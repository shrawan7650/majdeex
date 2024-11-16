const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Payment = require("../models/paymentModel");
const Product = require("../models/Product");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const orderConfirmationEmail = require("../templates/orderConfirmationEmail");
const Tracking = require("../models/Tracking");
//mongosse
const mongoose = require("mongoose");
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
    if (!orderConfirmed) {
      console.log("Order not confirmed, cart will not be deleted.");
      return;
    }

    const productObjectId = new mongoose.Types.ObjectId(productId);

    // Fetch the product details dynamically to ensure accurate price retrieval
    const product = await Product.findById(productObjectId);
    console.log("product",product)
    if (!product) {
      console.log(`Product with ID ${productId} not found in the database.`);
      return;
    }

    // Remove the product from the user's cart
    const updatedCart = await Cart.updateOne(
      { userId, "products.productId": productObjectId },
      { $pull: { products: { productId: productObjectId } } }
    );
console.log(
  "Updated cart for user",
  updatedCart
)
    if (updatedCart.modifiedCount > 0) {
      console.log(`Product with ID ${productId} deleted from the cart for user ${userId}.`);

      // Recalculate the total amount after removing the product
      const cart = await Cart.findOne({ userId });
      if (cart) {
        const updatedTotalAmount = cart.products.reduce(async (acc, item) => {
          const productDetails = await Product.findById(item.productId);
          if (!productDetails) return acc;
          return acc + productDetails.price * item.quantity;
        }, 0);

        cart.totalAmount = await updatedTotalAmount; // Resolve promise before saving
        await cart.save();

        console.log(`Updated total amount for user ${userId}: ${cart.totalAmount}`);
      }
    } else {
      console.log("Product not found in the cart for user:", userId);
    }
  } catch (error) {
    console.error("Error deleting product from cart:", error.message);
  }
}



async function confirmOrderAndCreateTracking(orderId, estimatedArrivalDate) {
  console.log(
    "Confirming order",
    orderId,
    "with estimated arrival date:",
    estimatedArrivalDate
  );

  try {
    // Find the order
    const order = await Order.findById(orderId).populate({
      path: "products.productId",
      select: "category name", // Ensure category exists in the Product schema
    });

    if (!order) {
      throw new Error("Order not found");
    }

    let tracking;

    // Iterate through products to check if any is physical
    const hasPhysicalProduct = order.products.some(
      (item) => item.productId && item.productId.category === "physical"
    );

    if (hasPhysicalProduct) {
      // Create a tracking document
      tracking = await Tracking.create({
        orderId: order._id,
        estimatedArrival: estimatedArrivalDate,
        trackingUpdates: [
          {
            status: "Pending",
            timestamp: new Date(),
            remarks: "Order placed",
          },
        ],
      });

      // Link the tracking document to the order
      order.trackingId = tracking._id;
      await order.save();
    }

    return { order, tracking };
  } catch (error) {
    console.error("Error confirming order and creating tracking:", error.message);
    throw error;
  }
}


exports.processOrder = async (req, res) => {
  try {
    const userId = req.userId;
    console.log("Processing order for user:", userId);

    // Find payment details for the user
    const payment = await Payment.findOne({ owner: userId }).populate(
      "productId deliveryAddress"
    );

    console.log("Payment details:", payment);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Fetch user details
    const user = await User.findById(userId);
    console.log("User details:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch user's cart
    const cart = await Cart.findOne({ userId });
    console.log("Cart details:", cart);

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    let totalAmount = 0;
    for (const item of cart.products) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res
          .status(404)
          .json({ message: `Product with ID ${item.productId} not found` });
      }

      if (product.quantity < item.quantity) {
        return res
          .status(400)
          .json({ message: `Not enough stock for ${product.name}` });
      }

      totalAmount += product.price * item.quantity;
    }

    console.log("Total amount:", totalAmount);

    // Create the order
    const order = new Order({
      userId,
      products: cart.products,
      totalAmount,
      paymentStatus: payment.razorpay_signature ? "Success" : "Failed",
      phone: user?.phone || "",
      email: user?.email || "",
      address: payment.deliveryAddress._id,
      paymentId: payment.razorpay_order_id,
      paymentVerified: true,
    });

    const confirmedOrder = await order.save();
    console.log("Confirmed order:", confirmedOrder);

    // Deduct product quantities
    for (const item of cart.products) {
      const product = await Product.findById(item.productId);
      product.quantity -= item.quantity;
      await product.save();

      // Check category and handle physical products
      if (product.category === "physical") {
        const estimatedArrivalDate = new Date();
        await confirmOrderAndCreateTracking(confirmedOrder._id, estimatedArrivalDate);
        console.log("Tracking information created for physical order.");
      }
    }

    // Send order confirmation email
    // await sendEmail(
    //   user.email,
    //   "Order Confirmation",
    //   orderConfirmationEmail(confirmedOrder)
    // );

    // Remove products from cart
    for (const product of confirmedOrder.products) {
      await deleteCartByProduct(confirmedOrder.userId, product.productId, true);
    }

    return res.status(201).json({
      message: "Order processed successfully",
      order: confirmedOrder,
    });
  } catch (error) {
    console.error("Error during order processing:", error);
    return res.status(500).json({
      message: error.message || "An error occurred during order processing.",
    });
  }
};



// Get Order History
exports.getOrderHistory = async (req, res) => {
  const userId = req.userId;

  try {
    // Fetch the order history for the user, sorted by the most recent, and populate products and address
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "products.productId",
        select: "name price category", // Adjust fields as per your schema
      })
      .populate({
        path: "address",
        select: "street city state postalCode", // Adjust fields as per your schema
      });

    // If no orders are found, send a 404 response
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: "No orders found for this user" });
    }

    // If orders are found, send them in the response
    return res.status(200).json({
      success: true,
      message: "Order history fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching order history:", error);

    // Handle server error with a 500 response
    return res.status(500).json({
      success: false,
      message: "Server error while fetching order history",
    });
  }
};
