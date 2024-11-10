const mongoose = require('mongoose');

// Validator function for email format
const emailValidator = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// User schema definition with validation
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [20, 'Username must be at most 20 characters'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      validate: [emailValidator, 'Please enter a valid email address'],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
     
    },
    //name
    Name: { type: String },
   // Wishlist array to store references to products
  wishlist: [
    {
      productId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "Product", // Assumes you have a Product model for product details
      },
    },
  ],
    purchasedItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Purchase',
      },
    ],
  },
  { timestamps: true }
);

// Custom validation for purchasedItems to ensure each item is unique
// Yeh code yeh check karta hai ki purchasedItems list mein koi bhi item do baar na ho. Agar koi item do baar hota hai to validation fail ho jayega aur error message milega "Duplicate items are not allowed in purchasedItems".
UserSchema.path('purchasedItems').validate(function (value) {
  const uniqueItems = new Set(value.map((item) => item.toString()));
  return uniqueItems.size === value.length;
}, 'Duplicate items are not allowed in purchasedItems');

// Export the model
module.exports = mongoose.model('User', UserSchema);
