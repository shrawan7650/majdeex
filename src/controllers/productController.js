const Product = require('../models/Product');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const mongoose = require('mongoose');

// Add a new product
exports.addProduct = async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.status(201).json({ message: 'Product added successfully' });
};


// // GET /products - Fetch all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    successResponse(res, products);
  } catch (error) {
    errorResponse(res, error.message);
  }
};



// // GET /products/:id - Fetch product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return errorResponse(res, 'Product not found', 404);
    successResponse(res, product);
  } catch (error) {
    errorResponse(res, error.message);
  }
};
//get product only paymentverifed true with user

exports.getPaymentVerifiedProducts = async (req, res) => {
  try {
    // Convert userId to ObjectId if it's a string
    const userId =new  mongoose.Types.ObjectId(req.params.userId);
    console.log("userId", userId);

    // Find products with paymentVerified true for the specific user
    const products = await Product.find({ userId, paymentVerified: true });

    if (!products.length) {
      return errorResponse(res, 'No products found', 404);
    }

    console.log("data", products);
    successResponse(res, products);
  } catch (error) {
    console.error(error);
    errorResponse(res, error.message);
  }
};

