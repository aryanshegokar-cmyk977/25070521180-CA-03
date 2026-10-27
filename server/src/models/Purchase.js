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
    // Reading tracker: which chapters have been opened, and where the reader stopped.
    chaptersRead: { type: [Number], default: [] },
    lastChapter: { type: Number, default: 1 },
    lastReadAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// A user can own each book only once.
purchaseSchema.index({ user: 1, book: 1 }, { unique: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
