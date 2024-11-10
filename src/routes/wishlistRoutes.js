const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middleware/authMiddleware');
const { addToWishlist, getWishlist ,removeFromWishlist} = require('../controllers/wishlistController');

// Add product to wishlist
router.post('/addToWishlist/:productId', authMiddleware, addToWishlist);

// Get wishlist by userId
router.get('/wishlist/',authMiddleware, getWishlist);

// Remove product from wishlist
router.delete('/removeFromWishlist/:productId',authMiddleware,);

module.exports = router;
