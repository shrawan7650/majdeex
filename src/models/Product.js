// const mongoose = require('mongoose');

// const ProductSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   description: { type: String, required: true },
//   price: { type: Number, required: true },
//   category: { type: String, enum: ['digital', 'physical'], required: true },
//   // ratings: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User ' }, rating: Number }],
//   inStock: { type: Boolean, default: true }, // New field for stock availability
//   // reviews: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User ' }, review: String }]
// }, { timestamps: true });

// module.exports = mongoose.model('Product', ProductSchema);
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, enum: ['digital', 'physical'], required: true },
  ratings: { type: Number, default: 0 }, // Average ratings
  inStock: { type: Boolean, default: true }, // Stock availability
  quantity: { type: Number, required: true, default: 0 } ,// Quantity available
 reviews: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User ' }, review: String }],
    // New field to track payment verification
    paymentVerified: {
      type: Boolean,
      default: false // Default is false until payment is verified
  },
  //coupen filed object id
  coupen: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupen' },

}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);