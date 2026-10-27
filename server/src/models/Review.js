const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    rating: {
      type: Number,
      required: [true, 'Please pick a star rating'],
      min: [1, 'Rating must be 1 to 5 stars'],
      max: [5, 'Rating must be 1 to 5 stars'],
    },
    comment: { type: String, default: '', trim: true, maxlength: [1000, 'Review is too long'] },
  },
  { timestamps: true }
);

// One review per user per book (they can edit it instead).
reviewSchema.index({ user: 1, book: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
