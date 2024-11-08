const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  purchasedItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Purchase'  },
  
]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
