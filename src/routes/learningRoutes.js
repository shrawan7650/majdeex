const express = require('express');
const { myLearning } = require('../controllers/learningController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my-learning', authMiddleware, myLearning);

module.exports = router;
