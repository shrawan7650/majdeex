// Import necessary modules
const express = require('express');
const { applyCoupon, createCoupon } = require('../controllers/couponController'); 
const { authMiddleware } = require('../middleware/authMiddleware'); 

// Initialize the router
const router = express.Router();

router.post('/create/:productId', createCoupon); 

router.post('/apply/:productId', authMiddleware, applyCoupon);

module.exports = router;
