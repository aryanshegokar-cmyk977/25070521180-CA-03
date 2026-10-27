const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Purchase = require('../models/Purchase');
const Voucher = require('../models/Voucher');
const { protect, usersOnly } = require('../middleware/auth');
const { httpError } = require('../middleware/error');
const { voucherLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.use(protect, usersOnly);

const STATUSES = ['To Read', 'Reading', 'Finished'];

// POST /api/library/buy  { bookId, code }
// "Buy Now": a valid voucher code acts as payment and adds the book to My Library.
router.post('/buy', voucherLimiter, async (req, res) => {
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
    throw httpError(400, `Sorry, the code ${code} expired on ${voucher.expiresAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.`);
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

// How many chapters each book has, as { bookId: count } (without loading the chapter text).
async function chapterCounts(bookIds) {
  const rows = await Book.aggregate([
    { $match: { _id: { $in: bookIds } } },
    { $project: { total: { $size: '$chapters' } } },
  ]);
  return Object.fromEntries(rows.map((r) => [r._id.toString(), r.total]));
}

// GET /api/library  - my books, with reading progress
router.get('/', async (req, res) => {
  const purchases = (
    await Purchase.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .populate('book', 'title author coverColor genre year slug')
  ).filter((p) => p.book); // skip any purchase whose book was deleted

  const totals = await chapterCounts(purchases.map((p) => p.book._id));
  res.json(purchases.map((p) => ({ ...p.toObject(), totalChapters: totals[p.book._id.toString()] || 0 })));
});

// A date as "YYYY-MM-DD" in the server's own time zone.
function dayString(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function yesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayString(d);
}

// The streak still counts if the last reading day was today or yesterday.
function currentStreak(user) {
  const { current, lastDay } = user.streak || {};
  return lastDay === dayString(new Date()) || lastDay === yesterdayString() ? current : 0;
}

// POST /api/library/progress  { bookId, chapter }  - called by the Reader when a chapter is opened
router.post('/progress', async (req, res) => {
  const { bookId } = req.body || {};
  const chapter = Number(req.body?.chapter);
  if (!mongoose.isValidObjectId(bookId) || !Number.isInteger(chapter) || chapter < 1) {
    throw httpError(400, 'Book and chapter number are required');
  }

  const purchase = await Purchase.findOne({ user: req.user._id, book: bookId });
  if (chapter > 1 && !purchase) throw httpError(403, 'This chapter is locked');

  // Streak: +1 if the last reading day was yesterday, start again at 1 if it was longer ago.
  const today = dayString(new Date());
  const streak = req.user.streak;
  if (streak.lastDay !== today) {
    streak.current = streak.lastDay === yesterdayString() ? streak.current + 1 : 1;
    streak.best = Math.max(streak.best, streak.current);
    streak.lastDay = today;
    await req.user.save();
  }

  // Progress is kept for books you own (chapter 1 previews only count towards the streak).
  if (purchase) {
    if (!purchase.chaptersRead.includes(chapter)) purchase.chaptersRead.push(chapter);
    purchase.lastChapter = chapter;
    purchase.lastReadAt = new Date();
    if (purchase.status === 'To Read') purchase.status = 'Reading';
    await purchase.save();
  }

  res.json({ streak: currentStreak(req.user), purchase });
});

// The stamps on the reader's library card. Each one is earned by doing something in the app.
const STAMPS = [
  { id: 'first-book', icon: '🎟️', name: 'First Ticket', hint: 'Buy your first book', earned: (s) => s.booksOwned >= 1 },
  { id: 'bookworm', icon: '🐛', name: 'Bookworm', hint: 'Read 10 chapters', earned: (s) => s.chaptersRead >= 10 },
  { id: 'the-end', icon: '📕', name: 'The End', hint: 'Finish a book', earned: (s) => s.finished >= 1 },
  { id: 'on-fire', icon: '🔥', name: 'On Fire', hint: 'Read 3 days in a row', earned: (s) => s.bestStreak >= 3 },
  { id: 'explorer', icon: '🧭', name: 'Explorer', hint: 'Own books from 3 genres', earned: (s) => s.genres >= 3 },
  { id: 'collector', icon: '📚', name: 'Collector', hint: 'Own 5 books', earned: (s) => s.booksOwned >= 5 },
];

// GET /api/library/stats  - numbers for the reading tracker (navbar badge, Profile, Store)
router.get('/stats', async (req, res) => {
  const purchases = (
    await Purchase.find({ user: req.user._id }).populate('book', 'title genre coverColor slug author')
  ).filter((p) => p.book);
  const totals = await chapterCounts(purchases.map((p) => p.book._id));

  const stats = {
    booksOwned: purchases.length,
    chaptersRead: purchases.reduce((sum, p) => sum + p.chaptersRead.length, 0),
    finished: purchases.filter((p) => p.status === 'Finished').length,
    genres: new Set(purchases.map((p) => p.book.genre)).size,
    streak: currentStreak(req.user),
    bestStreak: req.user.streak?.best || 0,
  };

  // The book read most recently, for the "Continue reading" button.
  const last = purchases
    .filter((p) => p.lastReadAt && p.status !== 'Finished')
    .sort((a, b) => b.lastReadAt - a.lastReadAt)[0];

  res.json({
    ...stats,
    stamps: STAMPS.map(({ earned, ...stamp }) => ({ ...stamp, earned: earned(stats) })),
    continueReading: last
      ? {
          book: last.book,
          chapter: last.lastChapter,
          totalChapters: totals[last.book._id.toString()] || 0,
          chaptersRead: last.chaptersRead.length,
        }
      : null,
  });
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
