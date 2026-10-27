import Motif, { motifFor } from './art/Motif';

// Draws a paper-cut book cover from the book's colour, genre and title (no images needed).
// Layers: coloured card -> pale moon -> back hill -> cut-out motif -> front hill -> title label.
export default function BookCover({ book, size = 'medium' }) {
  return (
    <div
      className={`book-cover book-cover-${size}`}
      style={{ '--cover': book.coverColor || '#e2603f' }}
      role="img"
      aria-label={`Cover of ${book.title}`}
    >
      <svg className="book-cover-art" viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="200" height="300" className="cover-bg" />
        <circle cx="160" cy="124" r="22" className="cover-moon" />
        <path className="cover-hill cover-hill-back" d="M0 232 C 50 200, 100 206, 140 226 S 190 214, 200 208 V300 H0Z" />
        <Motif name={motifFor(book)} className="cover-motif" x="50" y="146" width="100" height="100" />
        <path className="cover-hill cover-hill-front" d="M0 262 C 60 240, 120 252, 200 238 V300 H0Z" />
      </svg>
      {size !== 'small' && (
        <>
          <span className="book-cover-title">{book.title}</span>
          {book.author && <span className="book-cover-author">{book.author}</span>}
        </>
      )}
    </div>
  );
}
