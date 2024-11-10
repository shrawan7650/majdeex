const User = require('../models/User');
const { handleResponse } = require('../utils/apiResponse'); // Assuming handleResponse is a utility function

// Helper function to fetch user with purchased items
const WithPurchasedItems = async (userId) => {
  return await User.findById(userId).populate('purchasedItems');
};

// GET /users/my-learning - Access purchased digital products
exports.myLearning = async (req, res) => {
  try {
    // Fetch user with purchased items
    const user = await WithPurchasedItems(req.userId);
    
    // Check if user exists
    if (!user) {
      return handleResponse(res, null, 'User  not found', 404);
    }

    // Return the purchased items
    return handleResponse(res, user.purchasedItems, 'Purchased items retrieved successfully', 200);
  } catch (error) {
    console.error('Error retrieving purchased items:', error.message);
    return handleResponse(res, null, 'Error retrieving purchased items', 500);
  }
};