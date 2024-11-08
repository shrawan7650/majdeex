const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middleware/authMiddleware');
const { checkout, confirmPayment,getOrderHistory, getCheckoutData } = require('../controllers/orderController');


router.post('/checkout', authMiddleware,checkout );

router.get('/checkout-detials', authMiddleware, getCheckoutData);
router.post('/confirmPayment', authMiddleware, confirmPayment);

router.get('/history', authMiddleware, getOrderHistory);

module.exports = router;
