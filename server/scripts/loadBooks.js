// Reads data/books.json and turns each entry into a book with chapters.
// Shared by the seed script and the split preview script.
const fs = require('fs');
const path = require('path');
const { splitBook } = require('../src/utils/splitBook');

const DATA_DIR = path.join(__dirname, '..', 'data');

function loadBooks() {
  const list = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'books.json'), 'utf8'));

  return list.map((entry) => {
    const { textFile, chapterPattern, ignoreCase, chapters: typedChapters, ...details } = entry;
    let chapters = [];
    let skipped = [];
    let usedFallback = false;

    if (textFile) {
      // Option A: a whole book in a .txt file, split automatically.
      const filePath = path.join(DATA_DIR, 'books', textFile);
      if (!fs.existsSync(filePath)) {
        throw new Error(`"${entry.title}": text file not found: data/books/${textFile}`);
      }
      const result = splitBook(fs.readFileSync(filePath, 'utf8'), { chapterPattern, ignoreCase });
      ({ chapters, skipped, usedFallback } = result);
    } else if (Array.isArray(typedChapters)) {
      // Option B: chapters typed straight into books.json.
      chapters = typedChapters;
    }

    if (!chapters.length) throw new Error(`"${entry.title}" has no chapters`);
    return { details, chapters, skipped, usedFallback };
  });
}

module.exports = { loadBooks };
