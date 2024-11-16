const Product = require("../models/Product");
const mongoose = require("mongoose");

// Helper function to fetch products by userId and payment verification
const fetchPaymentVerifiedProducts = async (userId) => {
  return await Product.find({ userId, paymentVerified: true });
};

exports.addProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({
      message: "Product added successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error adding product:", error.message);
    res.status(500).json({

      message: "Error adding product",
      error: error.message,
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      message: 'Products retrieved successfully',
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({
      message: 'Error fetching products',
      error: error.message,
    });
  }
};


exports.getProductById = async (req, res) => {
  try {
    const{productId} = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }
    res.status(200).json({
      message: 'Product retrieved successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product by ID:', error.message);
    res.status(500).json({
      message: 'Error fetching product',
      error: error.message,
    });
  }
};

// // GET /products/user/:userId/payment-verified - Get payment verified products for a user
// exports.getPaymentVerifiedProducts = async (req, res) => {
//   try {
//     const userId = req.userId;
//     const products = await  Product.find({ userId, paymentVerified: true })
//     console.log(
//       'Fetching payment verified products for user:', userId,
//       products
//     )

//     if (!products.length) {
//       return res.status(404).json({
//         message: 'No products found',
//       });
//     }

//     res.status(200).json({
//       message: 'Payment verified products retrieved successfully',
//       data: products,
//     });
//   } catch (error) {
//     console.error('Error fetching payment verified products:', error.message);
//     res.status(500).json({
//       message: 'Error fetching payment verified products',
//       error: error.message,
//     });
//   }
// };