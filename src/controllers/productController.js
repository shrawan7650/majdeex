const Product = require('../models/Product');
const { handleResponse } = require('../utils/apiResponse'); // Assuming handleResponse is a utility function
const mongoose = require('mongoose');

// Helper function to create a product
const createProduct = async (productData) => {
  const product = new Product(productData);
  return await product.save();
};

// Helper function to fetch products by userId and payment verification
const fetchPaymentVerifiedProducts = async (userId) => {
  return await Product.find({ userId, paymentVerified: true });
};

// Add a new product
exports.addProduct = async (req, res) => {
  try {
    const product = await createProduct(req.body);
    return handleResponse(res, product, 'Product added successfully', 201);
  } catch (error) {
    console.error('Error adding product:', error.message);
    return handleResponse(res, null, 'Error adding product', 500);
  }
};

// GET /products - Fetch all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return handleResponse(res, products, 'Products retrieved successfully', 200);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    return handleResponse(res, null, 'Error fetching products', 500);
  }
};

// GET /products/:id - Fetch product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return handleResponse(res, null, 'Product not found', 404);
    }
    return handleResponse(res, product, 'Product retrieved successfully', 200);
  } catch (error) {
    console.error('Error fetching product by ID:', error.message);
    return handleResponse(res, null, 'Error fetching product', 500);
  }
};

// GET /products/user/:userId/payment-verified - Get payment verified products for a user
exports.getPaymentVerifiedProducts = async (req, res) => {
  try {
    // Convert userId to ObjectId
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    
    // Find products with paymentVerified true for the specific user
    const products = await fetchPaymentVerifiedProducts(userId);

    if (!products.length) {
      return handleResponse(res, null, 'No products found', 404);
    }

    return handleResponse(res, products, 'Payment verified products retrieved successfully', 200);
  } catch (error) {
    console.error('Error fetching payment verified products:', error.message);
    return handleResponse(res, null, 'Error fetching payment verified products', 500);
  }
};