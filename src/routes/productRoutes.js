// Import necessary modules
const express = require('express');
const { getAllProducts, getProductById, addToWishlist, addProduct, getPaymentVerifiedProducts } = require('../controllers/productController');
const { authMiddleware } = require('../middleware/authMiddleware'); // Middleware to check authentication

const router = express.Router();

// Route to get all products (GET request)
// This route retrieves a list of all products available in the system.
router.get('/', getAllProducts);

// Route to get a specific product by ID (GET request)
// This route retrieves a single product based on the product ID in the URL.
router.get('/:id', getProductById);

// Route to add a new product (POST request)
// This route adds a new product to the system. It typically requires admin privileges.
router.post('/addProduct', addProduct);

// Route to get all payment verified products (GET request)
// This route fetches products that have a verified payment status.
// The `authMiddleware` ensures that only authenticated users can access this data.
router.get('/products/payment-verified', authMiddleware, getPaymentVerifiedProducts);

// Export the router to be used in other parts of the application
module.exports = router;
