// Import necessary modules
const express = require('express');
const { getAllProducts, getProductById, addProduct } = require('../controllers/productController');


const router = express.Router();


router.post('/addProduct', addProduct);
router.get('/', getAllProducts);
router.get('/:productId', getProductById);

module.exports = router;
