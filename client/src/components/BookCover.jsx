// Draws a book cover from a colour + the title, so no images are needed.
export default function BookCover({ book, size = 'medium' }) {
  const color = book.coverColor || '#4338ca';
  return (
    <div
      className={`book-cover book-cover-${size}`}
      style={{ background: `linear-gradient(145deg, ${color}, ${shade(color, -35)})` }}
      aria-label={`Cover of ${book.title}`}
    >
      <div className="book-cover-spine" />
      <div className="book-cover-text">
        <span className="book-cover-title">{book.title}</span>
        <span className="book-cover-rule" />
        <span className="book-cover-author">{book.author}</span>
      </div>
    </div>
  );
}

// Makes a hex colour lighter (positive amount) or darker (negative amount).
function shade(hex, amount) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return hex;
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0xff) + amount);
  const b = clamp((num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
