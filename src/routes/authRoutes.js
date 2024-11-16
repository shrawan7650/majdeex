const express = require('express');
const rateLimit = require('express-rate-limit'); // For rate limiting requests
const { signup, login } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);

// POST: User login route with validation middleware
router.post('/login', login);

module.exports = router;
