const mongoose = require('mongoose');

// A voucher code is how users "pay" for a book. One use = one book.
const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, default: '' },
    maxUses: { type: Number, required: true, min: [1, 'Max uses must be at least 1'], default: 1 },
    usedCount: { type: Number, default: 0 },
    // Empty = never expires.
    expiresAt: { type: Date, default: null },
    // Users who already used this code (each person can use a code once).
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Voucher', voucherSchema);
