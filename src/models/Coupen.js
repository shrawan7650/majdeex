const mongoose = require('mongoose');
const CouponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discountPercentage: { type: Number, required: true, min: 0, max: 100 },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    productId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    usedBy: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] } // Default to empty array
}, { timestamps: true });

module.exports = mongoose.model('Coupon', CouponSchema);
