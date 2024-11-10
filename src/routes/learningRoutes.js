// Import required modules
const express = require('express');
const { myLearning } = require('../controllers/learningController'); // Import controller for fetching user's learning data
const { authMiddleware } = require('../middleware/authMiddleware'); // Import authentication middleware

// Initialize the router for handling routes
const router = express.Router();

// Route: /my-learning (GET)
// This route is protected by the authMiddleware to ensure that only authenticated users can access their learning data.
// It calls the 'myLearning' controller to fetch the user's learning progress or data.
router.get('/my-learning', authMiddleware, myLearning);

// Export the router so it can be used in other parts of the application
module.exports = router;
// const { check, validationResult } = require('express-validator');

// router.get(
//   '/my-learning',
//   authMiddleware,
//   [
//     check('filter')
//       .optional()
//       .isIn(['all', 'completed', 'in-progress'])
//       .withMessage('Invalid filter value'),
//   ],
//   (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     next(); // Continue to the myLearning controller if validation passes
//   },
//   myLearning
// );
// const myLearning = async (req, res) => {
//   try {
//     const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10 results
//     const skip = (page - 1) * limit;
    
//     const learningData = await Learning.find({ userId: req.user.id })
//       .skip(skip)
//       .limit(limit);
    
//     const total = await Learning.countDocuments({ userId: req.user.id });
    
//     return res.status(200).json({
//       learningData,
//       total,
//       page,
//       totalPages: Math.ceil(total / limit),
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Server error, please try again later.' });
//   }
// };
