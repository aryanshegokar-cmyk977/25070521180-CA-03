const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Purchase = require('../models/Purchase');
const Voucher = require('../models/Voucher');
const { protect } = require('../middleware/auth');
const { httpError } = require('../middleware/error');

const router = express.Router();

router.use(protect);

const STATUSES = ['To Read', 'Reading', 'Finished'];

// POST /api/library/buy  { bookId, code }
// "Buy Now": a valid voucher code acts as payment and adds the book to My Library.
router.post('/buy', async (req, res) => {
  const { bookId } = req.body || {};
  const code = String(req.body?.code || '').trim().toUpperCase();
  if (!code) throw httpError(400, 'Please enter a voucher code');

  const book = mongoose.isValidObjectId(bookId) ? await Book.findById(bookId).select('title') : null;
  if (!book) throw httpError(404, 'Book not found');

  // 1. Already own the book?
  if (await Purchase.exists({ user: req.user._id, book: book._id })) {
    throw httpError(400, 'You already own this book. Find it in My Library!');
  }

  // 2. Does the code exist?
  const voucher = await Voucher.findOne({ code });
  if (!voucher) {
    throw httpError(400, `"${code}" is not a valid voucher code. Check the spelling and try again.`);
  }

  // 3. Has it expired?
  const now = new Date();
  if (voucher.expiresAt && voucher.expiresAt < now) {
    throw httpError(400, `Sorry, the code ${code} expired on ${voucher.expiresAt.toDateString()}.`);
  }

  // 4. Are all its uses gone?
  if (voucher.usedCount >= voucher.maxUses) {
    throw httpError(400, `Sorry, the code ${code} has been fully used up.`);
  }

  // 5. Has this person used it before?
  if (voucher.usedBy.some((id) => id.equals(req.user._id))) {
    throw httpError(400, `You have already used the code ${code}. Each code works once per person.`);
  }

  // Use up one go of the voucher. The conditions are checked again here, all in one
  // database step, so two people can't grab the last use at the same moment.
  const used = await Voucher.findOneAndUpdate(
    {
      _id: voucher._id,
      usedBy: { $ne: req.user._id },
      $expr: { $lt: ['$usedCount', '$maxUses'] },
    },
    { $inc: { usedCount: 1 }, $addToSet: { usedBy: req.user._id } },
    { returnDocument: 'after' }
  );
  if (!used) throw httpError(400, `Sorry, the code ${code} has just been used up.`);

  try {
    const purchase = await Purchase.create({ user: req.user._id, book: book._id, voucherCode: code });
    res.status(201).json({ message: `"${book.title}" is now in your library. Enjoy!`, purchase });
  } catch (err) {
    // Saving failed (e.g. bought twice at the same moment): give the voucher use back.
    await Voucher.updateOne({ _id: voucher._id }, { $inc: { usedCount: -1 }, $pull: { usedBy: req.user._id } });
    if (err.code === 11000) throw httpError(400, 'You already own this book. Find it in My Library!');
    throw err;
  }
});

// GET /api/library  - my books
router.get('/', async (req, res) => {
  const purchases = await Purchase.find({ user: req.user._id })
    .sort({ updatedAt: -1 })
    .populate('book', 'title author coverColor genre year slug');
  // Skip any purchase whose book was deleted.
  res.json(purchases.filter((p) => p.book));
});

// PUT /api/library/:id  { status }  - change the To Read / Reading / Finished tag
router.put('/:id', async (req, res) => {
  const { status } = req.body || {};
  if (!STATUSES.includes(status)) throw httpError(400, `Status must be one of: ${STATUSES.join(', ')}`);

  const purchase = await Purchase.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { status },
    { returnDocument: 'after' }
  ).populate('book', 'title author coverColor genre year slug');
  if (!purchase) throw httpError(404, 'That book is not in your library');
  res.json(purchase);
});

module.exports = router;
