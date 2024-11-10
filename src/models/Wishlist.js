const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Fixed reference to 'User' without extra space
        required: true
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', // Fixed reference to 'Product' without extra space
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        },
        quantity: {
            type: Number,
            default: 1, // Default quantity if you want to track how many items in the wishlist
            min: [1, 'Quantity must be at least 1'] // Ensures at least 1 item
        }
    }]
});



const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
