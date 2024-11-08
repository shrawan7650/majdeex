const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { errorResponse, successResponse } = require("../utils/apiResponse");

// Add to Cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.userId;

    // Validate input
    if (!productId || !quantity) {
     errorResponse(res, "Invalid request data", 400);
    }

    // Fetch product details
    const product = await Product.findById(productId);
    if (!product) {
       errorResponse(res, "Product not found", 400);
    }

    // Check product stock
    if (product.quantity < quantity) {
       errorResponse(res, "Insufficient product quantity", 400);
    }

    // Fetch or create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({
        userId,
        products: [{ productId, quantity, price: product.price,
          category: product.category
         }] // Include price
      });
    } else {
      const productIndex = cart.products.findIndex((p) =>
        p.productId.equals(productId)
      );

      if (productIndex > -1) {
        // Update existing product quantity in cart
        const currentQuantity = cart.products[productIndex].quantity + quantity;
        if (product.quantity < currentQuantity) {
          errorResponse(res, "Insufficient product quantity", 400);
        }
        cart.products[productIndex].quantity = currentQuantity;
      } else {
        // Add new product to cart
        if (product.quantity < quantity) {
          errorResponse(res, "Insufficient product quantity", 400);
        }
        cart.products.push({ productId, quantity, price: product.price }); // Include price
      }
    }

    // Calculate total amount
    cart.totalAmount = cart.products.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    await cart.save();
    successResponse(res, cart, "Product added to cart");
  } catch (error) {
    errorResponse(res, error.message, 500, error);
  }
};

// Get Cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.userId;

    // Fetch user's cart and populate product details
    const cart = await Cart.findOne({ userId }).populate("products.productId");
    if (!cart) errorResponse(res, "Cart not found", 404);

    // Check if cart is empty
    if (cart.products.length === 0) {
      successResponse(res, null, "Cart is empty");
    }

    successResponse(res, cart, "Cart retrieved successfully");
  } catch (error) {
    errorResponse(res, error.message, 500, error);
  }
};

// Remove from Cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.userId;

    // Fetch user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart) errorResponse(res, "Cart not found", 404);

    // Find product index in the cart
    const productIndex = cart.products.findIndex((p) =>
      p.productId.equals(productId)
    );

    if (productIndex > -1) {
      // Get product details and adjust total amount
      const product = cart.products[productIndex];
      const productDetails = await Product.findById(productId);
      cart.totalAmount -= product.quantity * productDetails.price;
      cart.products.splice(productIndex, 1);
      await cart.save();

      successResponse(res, cart, "Product removed from cart");
    } else {
      errorResponse(res, "Product not found in cart", 404);
    }
  } catch (error) {
    errorResponse(res, error.message, 500, error);
  }
};
