// Import required modules
const express = require('express');
const router = express.Router();

// Import authentication middleware and order-related controller functions
const { authMiddleware } = require('../middleware/authMiddleware');
const {  getOrderHistory,processOrder } = require('../controllers/orderController');


router.post("/processOrder",authMiddleware, processOrder);


router.get('/history', authMiddleware, getOrderHistory);

module.exports = router;
