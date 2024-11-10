const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Product name is required'], 
    minlength: [3, 'Product name must be at least 3 characters long'] 
  },

  description: { 
    type: String, 
    required: [true, 'Description is required'], 
    minlength: [10, 'Description must be at least 10 characters long'] 
  },

  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price must be a positive number'] // Price should not be negative
  },

  category: { 
    type: String, 
    enum: ['digital', 'physical'], 
    required: [true, 'Category is required'] 
  },

  ratings: { 
    type: Number, 
    default: 0, 
    min: [0, 'Rating cannot be less than 0'], // Ensure ratings are >= 0
    max: [5, 'Rating cannot be greater than 5'], // Ensure ratings are <= 5
  },

  inStock: { 
    type: Boolean, 
    default: true 
  },

  quantity: { 
    type: Number, 
    required: [true, 'Quantity is required'], 
    min: [0, 'Quantity must be a positive number'], // Quantity should not be negative
    default: 0
  },

  reviews: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: [true, 'User ID is required'] 
    },
    review: { 
      type: String, 
      required: [true, 'Review text is required'], 
      minlength: [5, 'Review must be at least 5 characters long'] 
    },
  }],

  paymentVerified: {
    type: Boolean,
    default: false, // Default to false until payment is verified
  },

  coupon: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Coupon', // Corrected spelling of 'coupon'
    validate: {
      validator: function(value) {
        return mongoose.Types.ObjectId.isValid(value); // Validate if coupon ID is a valid ObjectId
      },
      message: 'Invalid Coupon ID',
    },
  },

}, { timestamps: true });

// Export the Product model
module.exports = mongoose.model('Product', ProductSchema);
