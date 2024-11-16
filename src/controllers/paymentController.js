const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/paymentModel"); 
const Address = require("../models/addressModel");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Get Razorpay Key
exports.getRazorpayKey = (req, res) => {
  const key = process.env.RAZORPAY_KEY_ID;
  res.status(200).json({ key, success: true });
};

// Checkout and create an order
exports.checkout = async (req, res) => {
  try {
    const options = {
      amount: Number(req.body.amount * 100),
      currency: "INR",
    };
    if (!razorpayInstance.orders) {
      return res.status(500).send("Orders API is not available");
    }

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({ order, success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
};

// Verify payment signature
exports.paymentVerification = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      notes,
    } = req.body;
    console.log("Received payment verification request:", req.body);

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ message: "Missing Razorpay payment details" });
    }

    if (!notes || !notes.user_id || !notes.product_title) {
      return res
        .status(400)
        .json({ message: "Missing order notes or required details" });
    }

    const user_id = req.body.notes?.user_id;
    const product_title = req.body.notes?.product_title;
    const productId = req.body.notes?.product_id;

    // Fetch the default address for the user
    const defaultAddress = await Address.findOne({
      user: user_id,
      isDefault: true,
    });


    if (!defaultAddress) {
      return res
        .status(404)
        .json({ message: "Default address not found for the user" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthenticate = expectedSignature === razorpay_signature;

    if (isAuthenticate) {
      await Payment.create({
        owner: user_id,
        product: product_title,
        productId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        deliveryAddress: defaultAddress._id,
      });

      return res.json({
        success: true,
        redirectUrl: `https://example.com/success?refrence=${razorpay_payment_id}`,
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Error during payment verification:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
