const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Review = require('../models/Review');
const { protect, usersOnly } = require('../middleware/auth');
const { httpError } = require('../middleware/error');

const router = express.Router();

router.use(protect);

// GET /api/reviews/book/:bookId  - all reviews for a book, newest first
router.get('/book/:bookId', async (req, res) => {
  const reviews = await Review.find({ book: req.params.bookId })
    .sort({ createdAt: -1 })
    .populate('user', 'name');
  res.json(reviews);
});

// POST /api/reviews  { bookId, rating, comment }  - write a review
router.post('/', usersOnly, async (req, res) => {
  const { bookId, rating, comment } = req.body || {};
  if (!mongoose.isValidObjectId(bookId) || !(await Book.exists({ _id: bookId }))) throw httpError(404, 'Book not found');

  if (await Review.exists({ user: req.user._id, book: bookId })) {
    throw httpError(400, 'You already reviewed this book. You can edit your review instead.');
  }

  const review = await Review.create({ user: req.user._id, book: bookId, rating, comment });
  await review.populate('user', 'name');
  res.status(201).json(review);
});

// Finds a review the current user may change (their own, or any review for an admin).
async function findEditableReview(req) {
  const review = await Review.findById(req.params.id);
  if (!review) throw httpError(404, 'Review not found');
  const isOwner = review.user.equals(req.user._id);
  if (!isOwner && req.user.role !== 'admin') throw httpError(403, 'You can only change your own reviews');
  return review;
}

// PUT /api/reviews/:id  { rating, comment }  - edit my review
router.put('/:id', usersOnly, async (req, res) => {
  const review = await findEditableReview(req);
  const { rating, comment } = req.body || {};
  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  await review.save();
  await review.populate('user', 'name');
  res.json(review);
});

// DELETE /api/reviews/:id  - delete my review (admins can delete any)
router.delete('/:id', async (req, res) => {
  const review = await findEditableReview(req);
  await review.deleteOne();
  res.json({ message: 'Review deleted' });
});

module.exports = router;
