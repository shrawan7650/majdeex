// Importing required modules
const express = require("express"); // Express.js framework
const rateLimit = require("express-rate-limit"); // Rate limiting
const dotenv = require("dotenv"); // Environment variables
const morgan = require("morgan"); // HTTP request logger
const cors = require("cors"); // Cross-Origin Resource Sharing
const cookieParser = require("cookie-parser"); // Cookie parsing

// Load environment variables
dotenv.config();

// Import route modules
const authRoutes = require("./routes/authRoutes"); // Authentication routes
const productRoutes = require("./routes/productRoutes"); // Product routes
const cartRoutes = require("./routes/cartRoutes"); // Cart routes
const couponRoutes = require("./routes/couponRoutes"); // Coupon routes
const orderRoutes = require("./routes/orderRoutes"); // Order routes
const wishlistRoutes = require("./routes/wishlistRoutes"); // Wishlist routes
const learningRoutes = require("./routes/learningRoutes"); // Learning module routes
const trackingRoutes =require('./routes/trackingRoutes')


// Create an instance of the express app
const app = express();

// CORS configuration for testing with Postman
app.use(cors({
  origin: "*", // Allow all origins for testing purposes
  methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed methods
  credentials: true // Allow credentials (like cookies) if needed
}));
// Global rate limiter (limit to 100 requests per IP per 1 hour)
const globalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Max 100 requests per hour
  message: "Too many requests, please try again later",
});
app.use(globalLimiter); // Apply rate limiter to all routes

// Middleware setup
app.use(morgan("dev")); // Log HTTP requests in development
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded payloads
app.use(cookieParser()); // Parse cookies

// Route handling
app.use("/api/auth", authRoutes); // Auth routes
app.use("/api/products", productRoutes); // Product routes
app.use("/api/cart", cartRoutes); // Cart routes
app.use("/api/coupons", couponRoutes); // Coupon routes
app.use("/api/wishlist", wishlistRoutes); // Wishlist routes
app.use("/api/orders", orderRoutes); // Order routes
app.use("/api/learning", learningRoutes); // Learning module routes
app.use('/api/tracking', trackingRoutes);      // Routes for tracking-related endpoint
// 404 Error handling for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Page Not Found" });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Export the app instance for use in the server
module.exports = app;
