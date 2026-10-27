const mongoose = require('mongoose');

// A purchase = one book in one user's library.
const purchaseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    voucherCode: { type: String },
    status: {
      type: String,
      enum: ['To Read', 'Reading', 'Finished'],
      default: 'To Read',
    },
  },
  { timestamps: true }
);

// A user can own each book only once.
purchaseSchema.index({ user: 1, book: 1 }, { unique: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
