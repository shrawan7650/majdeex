// Import necessary modules
const express = require('express');
const { applyCoupon, createCoupon } = require('../controllers/couponController'); // Import coupon controllers
const { authMiddleware } = require('../middleware/authMiddleware'); // Import authentication middleware

// Initialize the router
const router = express.Router();

// Route to create a new coupon (Admin only)
// This route should be protected to ensure only admins can create coupons
// It doesn't require user authentication, but admin verification should be done in the controller
router.post('/create/:productId', createCoupon); // Coupon creation handler

// Route to apply a coupon (User action)
// This route is protected by authMiddleware to ensure only authenticated users can apply coupons
// The controller applies the coupon based on the user's cart and coupon validity
router.post('/apply/:productId', authMiddleware, applyCoupon); // Coupon application handler

// Export the router for use in other parts of the application
module.exports = router;
