const User = require("../models/User");
const { hashData, compareData, generateToken } = require("../config/encryption");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// Signup
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input (basic check, can be expanded)
    if (!username || !email || !password) {
      return errorResponse(res, "All fields are required", 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, "User already exists", 409);
    }

    // Hash password and create new user
    const hashedPassword = await hashData(password);
    const user = new User({ username, email, password: hashedPassword });

    // Save user to the database
    await user.save();

    // Send success response
    successResponse(res, {
      id: user._id,
      username: user.username,
      email: user.email,
    }, "User created successfully", 201);
  } catch (error) {
    console.error("Signup error: ", error);
    errorResponse(res, "Internal server error", 500, error.message);
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input (basic check)
    if (!username || !password) {
      return errorResponse(res, "Username and password are required", 400);
    }

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    // Compare passwords
    const isPasswordValid = await compareData(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    // Generate JWT token
    const token = generateToken({
      id: user._id,
      username: user.username,
      email: user.email,
    });

    // Send success response with token
    successResponse(res, { token }, "Login successful");
  } catch (error) {
    console.error("Login error: ", error);
    errorResponse(res, "Internal server error", 500, error.message);
  }
};
