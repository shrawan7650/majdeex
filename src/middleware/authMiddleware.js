
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authMiddleware = async (req, res, next) => {
    const token = req.headers['authorization'];
    //debug
    console.log('Token:', token);
    if (!token) return res.status(403).send('Access denied.');

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        console.log("verified",verified)
        // req.user = await User.findById(verified.id);
        req.userId = verified.id; // Using verified token directly for simplicity.
        // debug
        console.log('User:', req.userId);
        // continue to next middleware or route handler.
        // req.user will be available in the request object for the next middleware or route handler.
        next();
    } catch (error) {
        res.status(400).send('Invalid token.');
    }
};