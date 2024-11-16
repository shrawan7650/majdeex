const express = require('express');
const router = express.Router();
const { createAddress, updateAddress } = require('../controllers/addressController');
const { authMiddleware } = require('../middleware/authMiddleware');  // Assuming you have an authentication middleware

// Route to create a new address
router.post('/address', authMiddleware, createAddress);  // Protect middleware checks if the user is authenticated

// Route to update an existing address
router.put('/address/:addressId', authMiddleware, updateAddress);

module.exports = router;
