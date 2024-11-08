const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User ', // Assuming you have a User model
        required: true
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', // Assuming you have a Product model
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }]
});

// Create the model
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;