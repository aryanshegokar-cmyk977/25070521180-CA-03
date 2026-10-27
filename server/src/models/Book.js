const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Chapter title is required'], trim: true },
  content: { type: String, required: [true, 'Chapter text is required'] },
});

const bookSchema = new mongoose.Schema(
  {
    // Short id used in books.json to match a book when re-seeding, e.g. "frankenstein".
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    author: { type: String, required: [true, 'Author is required'], trim: true },
    summary: { type: String, default: '' },
    genre: { type: String, default: 'Classic', trim: true },
    year: { type: Number },
    // Colour used to draw the book cover (no images needed).
    coverColor: { type: String, default: '#4f46e5' },
    gutenbergId: { type: Number },
    // Chapter 1 (index 0) is the free preview. The rest need a purchase.
    chapters: { type: [chapterSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);
