const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Function to hash the data (e.g., password)
const hashData = async (data) => {
  try {
    // Generate salt with 10 rounds for added security
    const salt = await bcrypt.genSalt(10);

    // Hash the provided data using the salt
    const hashedData = await bcrypt.hash(data, salt);

    // Return the hashed data
    return hashedData;
  } catch (error) {
    // Handle potential errors during the hashing process
    console.error("Error in hashData:", error.message);
    throw new Error("Failed to hash data");  // Re-throw the error for further handling
  }
};

// Function to compare data (e.g., password) with hashed data
const compareData = async (data, hashedData) => {
  //debug
  console.log("compareData - Data:", data);
  console.log("compareData - Hashed Data:", hashedData);

  // Compare the provided data with the hashed data using bcrypt.compare() method
  try {
    // Compare the plain data with the hashed data
    const isMatch = await bcrypt.compare(data, hashedData);
    console.log("compareData - Result:", isMatch);

    // Return the result of the comparison (true/false)
    return isMatch;
  } catch (error) {
    // Handle potential errors during the comparison process
    console.error("Error in compareData:", error.message);
    throw new Error("Failed to compare data");  // Re-throw the error for further handling
  }
};

// Function to generate a JWT token for the user
const generateToken = (user) => {
  try {
    // Log the user information for debugging (can be removed in production)
    console.log("generateToken - User:", user);

    // Generate and return a signed JWT token with user ID as payload
    // Token expires in 1 hour
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  } catch (error) {
    // Handle errors related to token generation
    console.error("Error in generateToken:", error.message);
    throw new Error("Failed to generate token");  // Re-throw the error for further handling
  }
};

// Export the functions to be used in other parts of the application
module.exports = { hashData, compareData, generateToken };
