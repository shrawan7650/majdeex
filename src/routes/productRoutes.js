const express = require('express');
const { getAllProducts, getProductById, addToWishlist, addProduct, getPaymentVerifiedProducts } = require('../controllers/productController');
const { authMiddleware } = require('../middleware/authMiddleware');
// const { authMiddleware } = require('../middlewares/auth');
const router = express.Router();

router.get('/', getAllProducts);             // Fetch all products
router.get('/:id', getProductById);          // Fetch product by ID
router.post('/addProduct', addProduct);
router.get('/products/payment-verified',authMiddleware,getPaymentVerifiedProducts)

module.exports = router;
