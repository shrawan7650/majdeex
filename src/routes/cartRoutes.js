const express = require('express');
const { addToCart, getCart, removeFromCart } = require('../controllers/cartController');
const {  authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/add', authMiddleware, addToCart);
router.get('/getCart', authMiddleware, getCart);
router.delete('/remove', authMiddleware, removeFromCart);

module.exports = router;