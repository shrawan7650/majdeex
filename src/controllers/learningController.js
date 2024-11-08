const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// GET /users/my-learning - Access purchased digital products
exports.myLearning = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('purchasedItems');
    if (!user) return errorResponse(res, 'User not found', 404);
    successResponse(res, user.purchasedItems);
  } catch (error) {
    errorResponse(res, error.message);
  }
};
