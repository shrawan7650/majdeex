const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { handleResponse } = require("../utils/apiResponse"); // Ensure this is correctly imported

// Middleware to authenticate user via JWT
exports.authMiddleware = async (req, res, next) => {
  // Extract token from the Authorization header
 // Extract token from the Authorization header or cookies
 const token = req.headers["authorization"]?.split(" ")[1] || req.cookies.authToken;

  // Debug: log the received token
  console.log("Token:", token);

  // Check if the token is provided
  if (!token) {
    return handleResponse(res, null, "Access denied. No token provided.", 403);
  }

  try {
    // Verify the token using JWT_SECRET
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Verified token:", verified);
    //verify first in databse user hai ki nhi
    const user = await User.findById(verified.id);
    if (!user) {
      return handleResponse(res, null, "User not found", 404);
    }
    // console.log("userId",user)
    // Attach the user object to the request object
    req.userId = user._id;
    

    // Attach the user ID from the verified token to the request object
    // req.userId = verified.id;

    // Debug: log the user ID
    console.log("User  ID:", req.userId);

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    // Handle token verification errors
    console.error("Token verification error:", error);
    return handleResponse(res, null, "Invalid token.", 400);
  }
};
