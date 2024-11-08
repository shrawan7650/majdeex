const Wishlist = require('../models/Wishlist');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Add Product to Wishlist
exports.addToWishlist = async (req, res) => {
    const {  productId } = req.body;
    const userId = req.userId;

    try {
        // Find the user's wishlist
        let wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            // If no wishlist exists, create a new one
            wishlist = new Wishlist({ userId, products: [] });
        }

        // Check if the product is already in the wishlist
        const productExists = wishlist.products.some(item => item.productId.toString() === productId);

        if (productExists) {
            return errorResponse(res, "Product already in wishlist", 400);
        }

        // Add the product to the wishlist
        wishlist.products.push({ productId });
        await wishlist.save();

        successResponse(res, { userId, productId }, "Product added to wishlist", 201);
    } catch (error) {
        errorResponse(res, "Error adding to wishlist", 500, error.message);
    }
};

// Get Wishlist by UserId
exports.getWishlist = async (req, res) => {
    const { userId } = req.params;

    try {
        const wishlist = await Wishlist.findOne({ userId }).populate('products.productId');

        if (!wishlist) {
            return errorResponse(res, "Wishlist not found", 404);
        }

        successResponse(res, wishlist.products, "Wishlist fetched successfully");
    } catch (error) {
        errorResponse(res, "Error fetching wishlist", 500, error.message);
    }
};

// Remove Product from Wishlist
exports.removeFromWishlist = async (req, res) => {
    const { productId } = req.params;
    const userId = req.userId;


    try {
        const wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            return errorResponse(res, "Wishlist not found", 404);
        }

        // Remove the product from the wishlist
        wishlist.products = wishlist.products.filter(item => item.productId.toString() !== productId);
        await wishlist.save();

        successResponse(res, { userId, productId }, "Product removed from wishlist");
    } catch (error) {
        errorResponse(res, "Error removing from wishlist", 500, error.message);
    }
};
