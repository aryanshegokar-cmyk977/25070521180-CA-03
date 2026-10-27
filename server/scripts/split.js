// Preview how books will be split into chapters. Saves nothing.
//   npm run split                 -> every book
//   npm run split frankenstein    -> just one book (use its "slug" from books.json)
const { loadBooks } = require('./loadBooks');

const only = process.argv[2];
const books = loadBooks().filter((b) => !only || b.details.slug === only);

if (!books.length) {
  console.log(`No book with slug "${only}" in data/books.json`);
  process.exit(1);
}

for (const { details, chapters, skipped, usedFallback } of books) {
  console.log(`\n${details.title} (${details.slug}): ${chapters.length} chapters`);
  if (usedFallback) console.log('  (no chapter headings found, so it was split into equal parts)');
  chapters.forEach((ch, i) => {
    const words = ch.content.split(/\s+/).length;
    const preview = ch.content.slice(0, 50).replace(/\s+/g, ' ');
    console.log(`  ${String(i + 1).padStart(3)}. ${ch.title.padEnd(45)} ${String(words).padStart(6)} words  "${preview}..."`);
  });
  if (skipped.length) console.log(`  Skipped (too short, probably a contents list): ${skipped.join(', ')}`);
}
console.log('\nLooks right? Run "npm run seed" to save it to the database.');
