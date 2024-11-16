const express = require('express');
const { addToCart, getCart, removeFromCart,updateQuantity } = require('../controllers/cartController');
const {  authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();


router.post('/add/:productId', authMiddleware, addToCart);


router.get('/getCart', authMiddleware, getCart);

router.delete('/remove/:productId', authMiddleware, removeFromCart);

router.put('/updatequantity/:productId', authMiddleware, updateQuantity);

module.exports = router;6