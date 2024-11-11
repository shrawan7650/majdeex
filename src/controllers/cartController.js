const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { handleResponse } = require("../utils/apiResponse");

// Helper function to check product availability
const isProductAvailable = (product, quantity) => {
  return product && product.quantity >= quantity;
};

// Helper function to update cart total
const calculateTotalAmount = (products) => {
  return products.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
};

// Add to Cart
exports.addToCart = async (req, res) => {
  try {
    //prodctId req,parma
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.userId;

    // Validate input
    if (!productId || !quantity) {
      return handleResponse(res, null, "Invalid request data", 400);
    }

    // Fetch product details
    const product = await Product.findById(productId);
    console.log("product", product);
    if (!product) {
      return handleResponse(res, null, "Product not found", 404);
    }

    // Check product stock
    if (!isProductAvailable(product, quantity)) {
      return handleResponse(res, null, "Insufficient product quantity", 400);
    }

    // Fetch or create cart
    let cart = await Cart.findOne({ userId });
    console.log("cart", cart);
    if (!cart) {
      // Create a new cart if it doesn't exist
      cart = new Cart({
        userId,

        products: [
          {
            productId,
            productName: product.name, // Assuming the product model has a `name` field
            quantity,
            price: product.price,
            category: product.category,
          },
        ],
      });
    } else {
      // Update existing cart
      const productIndex = cart.products.findIndex((p) =>
        p.productId.equals(productId)
      );
      if (productIndex > -1) {
        // Update existing product quantity in cart
        const currentQuantity = cart.products[productIndex].quantity + quantity;
        if (!isProductAvailable(product, currentQuantity)) {
          return handleResponse(
            res,
            null,
            "Insufficient product quantity",
            400
          );
        }
        cart.products[productIndex].quantity = currentQuantity;
      } else {
        // Add new product to cart
        cart.products.push({
          productId,
          quantity,
          price: product.price,
          category: product.category,
          productName: product.name,
        });
      }
    }

    // Update total amount
    cart.totalAmount = calculateTotalAmount(cart.products);
    await cart.save();

    return handleResponse(res, cart, "Product added to cart", 201);
  } catch (error) {
    console.error(error);
    return handleResponse(res, null, error.message, 500);
  }
};

// Get Cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.userId;

    // Fetch user's cart and populate product details
    const cart = await Cart.findOne({ userId }).populate("products.productId");
    if (!cart) {
      return handleResponse(res, null, "Cart not found", 404);
    }

    // Check if cart is empty
    if (cart.products.length === 0) {
      return handleResponse(res, null, "Cart is empty", 200);
    }

    return handleResponse(res, cart, "Cart retrieved successfully", 200);
  } catch (error) {
    console.error(error);
    return handleResponse(res, null, error.message, 500);
  }
};

// Remove from Cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const userId = req.userId;

    // Fetch user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return handleResponse(res, null, "Cart not found", 404);
    }

    // Find product index in the cart
    const productIndex = cart.products.findIndex((p) =>
      p.productId.equals(productId)
    );
    if (productIndex === -1) {
      return handleResponse(res, null, "Product not found in cart", 404);
    }

    // Get product details and adjust total amount
    const product = cart.products[productIndex];
    const productDetails = await Product.findById(productId);
    if (!productDetails) {
      return handleResponse(res, null, "Product not found", 404);
    }

    // Adjust total amount and remove product from cart
    cart.totalAmount -= product.quantity * productDetails.price;
    cart.products.splice(productIndex, 1); // Remove product from cart
    await cart.save(); // Save the updated cart to the database

    return handleResponse(res, cart, "Product removed from cart", 200); // Return success response
  } catch (error) {
    console.error(error); // Log the error for debugging
    return handleResponse(res, null, error.message, 500); // Return error response
  }
};
// Find the cart for the authenticated user
const findUserCart = async (userId) => {
  return await Cart.findOne({ userId });
};

// Update product quantity in the cart
const updateProductQuantity = (cart, productId, quantity, action) => {
  const productIndex = cart.products.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (productIndex === -1) {
    return { error: "Product not found in cart." };
  }

  if (action === "increase") {
    cart.products[productIndex].quantity += quantity;
  } else if (action === "decrease") {
    cart.products[productIndex].quantity = Math.max(
      0,
      cart.products[productIndex].quantity - quantity
    );
  }

  return { cart };
};

// Calculate the total amount
const calculateTotalAmountQuantity = (cart) => {
  return cart.products.reduce((total, product) => {
    return total + product.quantity * product.price; // Assuming price is in the product details
  }, 0);
};
exports.updateQuantity = async (req, res) => {
  const { productId } = req.params;
  const { quantity, action } = req.body;

  // Validate quantity and action
  if (typeof quantity !== "number" || quantity < 0) {
    return handleResponse(
      res,
      null,
      "Quantity must be a non-negative number.",
      400
    );
  }

  if (!["increase", "decrease"].includes(action)) {
    return handleResponse(
      res,
      null,
      "Action must be either 'increase' or 'decrease'.",
      400
    );
  }

  try {
    // Find the cart for the authenticated user
    const cart = await findUserCart(req.userId);
    if (!cart) {
      return handleResponse(res, null, "Cart not found.", 404);
    }

    // Update product quantity
    const { error } = updateProductQuantity(cart, productId, quantity, action);
    if (error) {
      return handleResponse(res, null, error, 404);
    }

    // Calculate and update total amount
    cart.totalAmount = calculateTotalAmountQuantity(cart);

    // Save the updated cart
    await cart.save();

    return handleResponse(res, cart, "Cart updated successfully.", 200);
  } catch (error) {
    console.error("Error updating cart:", error);
    return handleResponse(
      res,
      null,
      "An error occurred while updating the cart.",
      500
    );
  }
};
