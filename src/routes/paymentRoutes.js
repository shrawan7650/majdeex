const express = require('express');
const { getRazorpayKey, checkout, paymentVerification } = require('../controllers/paymentController');

const router = express.Router();

router.get('/getkey', getRazorpayKey); // Route to get Razorpay API key
router.post('/checkout', checkout); // Route to initiate a checkout session
router.post('/paymentVerification', paymentVerification); // Route to verify payment

module.exports = router;
