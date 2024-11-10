const User = require("../models/User");
const { hashData, compareData, generateToken } = require("../config/encryption");
const { handleResponse } = require("../utils/apiResponse");

// Signup
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input (basic check, can be expanded)
    if (!username || !email || !password) {
      return handleResponse(res, null, "All fields are required", 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return handleResponse(res, null, "User already exists", 409);
    }

    // Hash password and create new user
    const hashedPassword = await hashData(password);
    const user = new User({ username, email, password: hashedPassword });

    // Save user to the database
    await user.save();

    // Send success response
    handleResponse(
      res,
      {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      "User created successfully",
      201
    );
  } catch (error) {
    console.error("Signup error: ", error);
    handleResponse(res, error.message, "Internal server error", 500);
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input (basic check)
    if (!username || !password) {
      return handleResponse(res, null, "Username and password are required", 400);
    }

    // Check if user exists
    const user = await User.findOne({ username });
    //debuging user
    console.log("user",user)
    if (!user) {
      return handleResponse(res, null, "Invalid credentials", 401);
    }

    // Compare passwords
    const isPasswordValid = await compareData(password, user.password);
    console.log("isPasswordValid",isPasswordValid);
    if (!isPasswordValid) {
      return handleResponse(res, null, "Invalid credentials", 401);
    }

    // Generate JWT token
    const token = generateToken({
      id: user._id,
      username: user.username,
      email: user.email,
    });

    // Set token as a cookie in the response
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set true if in production
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    
    // Send success response with token
    handleResponse(res, { token }, "Login successful", 200);
  } catch (error) {
    console.error("Login error: ", error);
    handleResponse(res, error.message, "Internal server error", 500);
  }
};
