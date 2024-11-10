// Import required modules
const express = require('express');
const router = express.Router();

// Import authentication middleware and order-related controller functions
const { authMiddleware } = require('../middleware/authMiddleware');
const { checkout, confirmPayment, getOrderHistory, getCheckoutData } = require('../controllers/orderController');

// Route to handle user checkout (POST request)
// The authMiddleware ensures that only authenticated users can proceed with checkout.
router.post('/checkout', authMiddleware, checkout);

// Route to fetch the user's checkout details (GET request)
// This is used to retrieve any relevant data for the checkout process.
router.get('/checkout-detials', authMiddleware, getCheckoutData);

// Route to confirm payment (POST request)
// Once a user completes the payment, this route confirms the payment status.
router.post('/confirmPayment', authMiddleware, confirmPayment);

// Route to get the user's order history (GET request)
// This fetches a history of all the orders the user has made.
router.get('/history', authMiddleware, getOrderHistory);

// Export the router to use in other parts of the application
module.exports = router;
