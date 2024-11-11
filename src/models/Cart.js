const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, 'User ID is required'],
      validate: {
        validator: function (value) {
          return mongoose.Types.ObjectId.isValid(value); // Validate if the userId is a valid ObjectId
        },
        message: 'Invalid User ID'
      }
    },
    products: [
      {
        productId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Product", 
          required: [true, 'Product ID is required'],
          validate: {
            validator: function (value) {
              return mongoose.Types.ObjectId.isValid(value); // Validate if the productId is a valid ObjectId
            },
            message: 'Invalid Product ID'
          }
        },
          productName: { // New field for product name
          type: String,
          required: [true, 'Product name is required'] // Ensure product name is provided
        },
        quantity: { 
          type: Number, 
          default: 0, 
          min: [0, 'Quantity must be at least 0'], // Ensure quantity is at least 0
        },
        price: { 
          type: Number, 
          required: [true, 'Price is required'],
          min: [0, 'Price must be greater than or equal to 0'], // Ensure price is positive or zero
        },
        category: { 
          type: String, 
          enum: {
            values: ['digital', 'physical'], 
            message: 'Category must be either digital or physical'
          },

          
      
          required: [true, 'Category is required']
        }
      }
    ],
    totalAmount: { 
      type: Number, 
      default: 0, 
      min: [0, 'Total amount must be at least 0'], // Ensure totalAmount is not negative
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);
