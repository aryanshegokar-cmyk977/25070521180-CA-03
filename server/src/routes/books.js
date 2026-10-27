const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Purchase = require('../models/Purchase');
const Review = require('../models/Review');
const { protect, adminOnly } = require('../middleware/auth');
const { httpError } = require('../middleware/error');
const { escapeRegex, slugify } = require('../utils/helpers');

const router = express.Router();

// Every book route needs a logged-in user.
router.use(protect);

// Fields an admin is allowed to set on a book.
const EDITABLE_FIELDS = ['title', 'author', 'summary', 'genre', 'year', 'coverColor', 'gutenbergId', 'chapters'];

function pickBookFields(body = {}) {
  const data = {};
  for (const field of EDITABLE_FIELDS) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  return data;
}

// Average star rating + number of reviews for each book id.
async function ratingsFor(bookIds) {
  const rows = await Review.aggregate([
    { $match: { book: { $in: bookIds } } },
    { $group: { _id: '$book', avgRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
  ]);
  const map = {};
  for (const row of rows) {
    map[row._id.toString()] = { avgRating: Math.round(row.avgRating * 10) / 10, reviewCount: row.reviewCount };
  }
  return map;
}

// Can this user read chapter number N of this book?
// Chapter 1 is a free preview. Owners and admins can read everything.
async function canRead(user, bookId, number) {
  if (number === 1 || user.role === 'admin') return true;
  return Boolean(await Purchase.exists({ user: user._id, book: bookId }));
}

// GET /api/books?q=alice&genre=Fantasy  - list books for the Store (no chapter text)
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.q) {
    const pattern = new RegExp(escapeRegex(req.query.q), 'i');
    filter.$or = [{ title: pattern }, { author: pattern }];
  }
  if (req.query.genre) filter.genre = req.query.genre;

  const books = await Book.aggregate([
    { $match: filter },
    { $sort: { title: 1 } },
    {
      $project: {
        title: 1, author: 1, summary: 1, genre: 1, year: 1, coverColor: 1, slug: 1,
        chapterCount: { $size: '$chapters' },
      },
    },
  ]);

  const ratings = await ratingsFor(books.map((b) => b._id));
  const owned = await Purchase.find({ user: req.user._id }).distinct('book');
  const ownedSet = new Set(owned.map((id) => id.toString()));

  res.json(
    books.map((b) => ({
      ...b,
      avgRating: ratings[b._id.toString()]?.avgRating || 0,
      reviewCount: ratings[b._id.toString()]?.reviewCount || 0,
      owned: ownedSet.has(b._id.toString()),
    }))
  );
});

// GET /api/books/genres  - list of genres for the Store filter
router.get('/genres', async (req, res) => {
  const genres = await Book.distinct('genre');
  res.json(genres.filter(Boolean).sort());
});

// GET /api/books/:id  - book details with chapter titles (no chapter text)
router.get('/:id', async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw httpError(404, 'Book not found');

  const purchase = await Purchase.findOne({ user: req.user._id, book: book._id });
  const ratings = await ratingsFor([book._id]);

  res.json({
    _id: book._id,
    slug: book.slug,
    title: book.title,
    author: book.author,
    summary: book.summary,
    genre: book.genre,
    year: book.year,
    coverColor: book.coverColor,
    gutenbergId: book.gutenbergId,
    chapters: book.chapters.map((ch, i) => ({
      number: i + 1,
      title: ch.title,
      locked: !(i === 0 || purchase || req.user.role === 'admin'),
    })),
    owned: Boolean(purchase),
    purchase,
    avgRating: ratings[book._id.toString()]?.avgRating || 0,
    reviewCount: ratings[book._id.toString()]?.reviewCount || 0,
  });
});

// GET /api/books/:id/chapters/:number  - the text of one chapter (if unlocked)
router.get('/:id/chapters/:number', async (req, res) => {
  const number = Number(req.params.number);
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, 'Book not found');
  if (!Number.isInteger(number) || number < 1) throw httpError(404, 'Chapter not found');

  // Load only the one chapter we need (plus the chapter count), not the whole book.
  const [book] = await Book.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
    {
      $project: {
        total: { $size: '$chapters' },
        chapter: { $arrayElemAt: ['$chapters', number - 1] },
      },
    },
  ]);
  if (!book) throw httpError(404, 'Book not found');
  if (!book.chapter) throw httpError(404, 'Chapter not found');

  const { title, content } = book.chapter;
  if (!(await canRead(req.user, book._id, number))) {
    return res.status(403).json({
      message: 'This chapter is locked. Buy the book to unlock all chapters.',
      locked: true,
      number,
      title,
      total: book.total,
    });
  }

  res.json({ number, title, content, total: book.total, locked: false });
});

// ---------- Admin only below ----------

// GET /api/books/:id/full  - everything, including all chapter text (for editing)
router.get('/:id/full', adminOnly, async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw httpError(404, 'Book not found');
  res.json(book);
});

// POST /api/books  - create a book
router.post('/', adminOnly, async (req, res) => {
  const data = pickBookFields(req.body);
  if (!data.title) throw httpError(400, 'Title is required');

  // Make a unique short id from the title.
  let slug = slugify(data.title) || 'book';
  let n = 2;
  while (await Book.exists({ slug })) slug = `${slugify(data.title)}-${n++}`;

  const book = await Book.create({ ...data, slug });
  res.status(201).json(book);
});

// PUT /api/books/:id  - update a book
router.put('/:id', adminOnly, async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw httpError(404, 'Book not found');
  book.set(pickBookFields(req.body));
  await book.save();
  res.json(book);
});

// DELETE /api/books/:id  - delete a book (and its purchases + reviews)
router.delete('/:id', adminOnly, async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) throw httpError(404, 'Book not found');
  await Purchase.deleteMany({ book: book._id });
  await Review.deleteMany({ book: book._id });
  res.json({ message: `Deleted "${book.title}"` });
});

module.exports = router;
