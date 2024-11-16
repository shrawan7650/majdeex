const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Helper to check if the product is available
const isProductAvailable = (product, quantity) => product && product.quantity >= quantity;

// Helper to calculate the total amount in the cart
const calculateTotalAmount = async (productIdsWithQuantities) => {
  // console.log(
  //   "Product IDs with quantities:",
  //   productIdsWithQuantities
  // )
  
  const products = await Product.find({ '_id': { $in: productIdsWithQuantities.map(item => item.productId) } });
  // console.log("Found products:", products);

 
  return productIdsWithQuantities.reduce((total, item) => {

    const product = products.find(p => p._id.toString() === item.productId.toString());
    // console.log("Product:", product);
    
    if (product) {
      return total + product.price * item.quantity;
    }
    
    return total;
  }, 0);
};

// Add to Cart
exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.userId;

    if (!productId || !quantity) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!isProductAvailable(product, quantity)) {
      return res.status(400).json({ message: "Insufficient product quantity" });
    }

    let cart = await Cart.findOne({ userId });
    console.log(
"cart",cart
    )
    if (!cart) {
      cart = new Cart({
        userId,
        products: [{ productId, quantity}]
      });
    } else {
      const productIndex = cart.products.findIndex((p) => p.productId.equals(productId));
      if (productIndex > -1) {
        const currentQuantity = cart.products[productIndex].quantity + quantity;
        if (!isProductAvailable(product, currentQuantity)) {
          return res.status(400).json({ message: "Insufficient product quantity" });
        }
        cart.products[productIndex].quantity = currentQuantity;
      } else {
        cart.products.push({ productId, quantity});
      }
    }
console.log("cart2",cart)
    cart.totalAmount = await calculateTotalAmount(cart.products);
    await cart.save();

    res.status(201).json({ cart, message: "Product added to cart" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get Cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.userId;
    const cart = await Cart.findOne({ userId }).populate("products.productId");

    if (!cart || cart.products.length === 0) {
      return res.status(404).json({ message: "Cart not found or empty" });
    }

    res.status(200).json({ cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Remove from Cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.userId;
    console.log(
      "Product ID to remove:", productId,
      "User ID:", userId
    );

    const cart = await Cart.findOne({ userId });
    console.log("Cart:", cart);

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the product in the cart
    const productIndex = cart.products.findIndex((p) => p.productId.equals(productId));
    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Fetch product details from the Product collection using the productId
    const product = cart.products[productIndex];
    const productDetails = await Product.findById(product.productId);
    if (!productDetails) {
      return res.status(404).json({ message: "Product not found in Product collection" });
    }

    // Ensure quantity and price are valid numbers before performing the subtraction
    if (isNaN(product.quantity) || isNaN(productDetails.price)) {
      return res.status(400).json({ message: "Invalid quantity or price for the product" });
    }

    // Correctly calculate totalAmount (check if totalAmount is a valid number)
    if (isNaN(cart.totalAmount)) {
      cart.totalAmount = 0; // Initialize totalAmount if it is NaN
    }

    // Subtract the product's price * quantity from totalAmount
    cart.totalAmount -= product.quantity * productDetails.price;

    // Ensure totalAmount is not NaN after the subtraction
    if (isNaN(cart.totalAmount)) {
      cart.totalAmount = 0; // Default to 0 if totalAmount becomes NaN
    }

    // Remove the product from the cart
    cart.products.splice(productIndex, 1);

    // Save the updated cart
    await cart.save();

    res.status(200).json({ cart, message: "Product removed from cart" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
// Update Quantity
exports.updateQuantity = async (req, res) => {
  const { productId } = req.params;
  const { quantity, action } = req.body;

  // Validate input data
  if (typeof quantity !== "number" || quantity < 0 || !["increase", "decrease"].includes(action)) {
    return res.status(400).json({ message: "Invalid quantity or action" });
  }

  try {
    // Fetch the user's cart
    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the product in the cart
    const productIndex = cart.products.findIndex((p) => p.productId.toString() === productId);
    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Fetch product details from the Product model
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found in Product collection" });
    }

    // Check if the product category is "physical"
    if (product.category !== "physical") {
      return res.status(400).json({ message: "Cannot update cart for non-physical products" });
    }

    // Get the current quantity and update it based on the action
    const currentQuantity = cart.products[productIndex].quantity;
    cart.products[productIndex].quantity = action === "increase"
      ? currentQuantity + quantity
      : Math.max(0, currentQuantity - quantity);

    // Recalculate totalAmount after updating quantity
    cart.totalAmount = await calculateTotalAmount(cart.products);
    await cart.save();

    res.status(200).json({ cart, message: "Cart updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};