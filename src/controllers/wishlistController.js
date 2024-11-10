const User = require("../models/User");
const Wishlist = require("../models/Wishlist");
const { handleResponse } = require("../utils/apiResponse");

// Add Product to Wishlist
exports.addToWishlist = async (req, res) => {
  const { productId } = req.params;
  const userId = req.userId;

  try {
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, products: [] });
    }

    const productExists = wishlist.products.some(
      (item) => item.productId.toString() === productId
    );

    if (productExists) {
      return handleResponse(res, null, "Product already in wishlist", 400);
    }

    wishlist.products.push({ productId });
    await wishlist.save();
    //also update user wishlist

    // Also add the product to the user's wishlist in the User collection
    await User.findByIdAndUpdate(
      userId,
      { $push: { wishlist: { productId } } },
      { new: true }
    ).exec();

    handleResponse(
      res,
      { userId, productId },
      "Product added to wishlist",
      201
    );
  } catch (error) {
    handleResponse(res, null, "Error adding to wishlist", 500, error.message);
  }
};

// Get Wishlist by UserId
exports.getWishlist = async (req, res) => {
    const userId = req.userId;
  console.log(
    "Get Wishlist by UserId",
    userId 
  )

  try {
    const wishlist = await Wishlist.findOne({ userId }).populate(
      "products.productId"
    );
    console.log(
        "Get Wishlist by UserId",
        { wishlist }
      );
    

    if (!wishlist) {
      return handleResponse(res, null, "Wishlist not found", 404);
    }

    handleResponse(
      res,
      wishlist.products,
      "Wishlist fetched successfully",
      200
    );
  } catch (error) {
    handleResponse(res, null, "Error fetching wishlist", 500, error.message);
  }
};

// Remove Product from Wishlist// Remove Product from Wishlist
exports.removeFromWishlist = async (req, res) => {
    const { productId } = req.params;
    const userId = req.userId;
  
    try {
      // Find the user's wishlist in the Wishlist collection
      const wishlist = await Wishlist.findOne({ userId });
  
      if (!wishlist) {
        return handleResponse(res, null, "Wishlist not found", 404);
      }
  
      // Remove the product from the wishlist in the Wishlist collection
      wishlist.products = wishlist.products.filter(
        (item) => item.productId.toString() !== productId
      );
      await wishlist.save();
  
      // Remove the product from the user's wishlist in the User collection
      await User.findByIdAndUpdate(
        userId,
        { $pull: { wishlist: { productId } } },
        { new: true }
      ).exec();
  
      // Send success response
      handleResponse(res, { userId, productId }, "Product removed from wishlist", 200);
    } catch (error) {
      handleResponse(res, null, "Error removing from wishlist", 500, error.message);
    }
  };
