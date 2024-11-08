const express = require('express');
const { applyCoupon,createCoupon } = require('../controllers/couponController');
const { authMiddleware } = require('../middleware/authMiddleware');



const router = express.Router();
router.post('/create', createCoupon);//admin panel part
router.post('/apply',authMiddleware, applyCoupon);

module.exports = router;