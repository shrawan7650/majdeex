const express = require('express');
const rateLimit = require('express-rate-limit'); // For rate limiting requests
const { signup, login } = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../middleware/validationMiddleware');
const router = express.Router();

// // Set up rate limiter: max 5 requests per 15 minutes (900 seconds)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
//   max: 5, // Limit each IP to 5 requests per windowMs
//   message: 'Too many requests, please try again later', // Message to show when rate limit is exceeded
//   standardHeaders: true, // Return rate limit info in `X-RateLimit-*` headers
//   legacyHeaders: false, // Disable the `X-RateLimit-*` headers for legacy reasons
// });
// POST: User signup route with validation middleware
router.post('/signup',validateSignup, signup);

// POST: User login route with validation middleware
router.post('/login', validateLogin, login);

module.exports = router;
