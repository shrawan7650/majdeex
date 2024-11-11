const express = require('express');
const { addToCart, getCart, removeFromCart,updateQuantity } = require('../controllers/cartController');
const {  authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Route to add a product to the cart (POST /add)
router.post('/add/:productId', authMiddleware, addToCart);

// Route to get the current user's cart (GET /getCart)
router.get('/getCart', authMiddleware, getCart);

// Route to remove a product from the cart (DELETE /remove)
router.delete('/remove/:productId', authMiddleware, removeFromCart);
//quatity incresease and decrese
// router.put('/updatequantity/:productId', authMiddleware, updateQuantity);

module.exports = router;