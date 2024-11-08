const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Add product to wishlist
router.post('/addToWishlist', authMiddleware,wishlistController.addToWishlist);

// Get wishlist by userId
router.get('/wishlist/:userId', wishlistController.getWishlist);

// Remove product from wishlist
router.delete('/removeFromWishlist/:productId',authMiddleware, wishlistController.removeFromWishlist);

module.exports = router;
