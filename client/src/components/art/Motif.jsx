// Simple paper-cut silhouettes used on book covers and empty states.
// Each one is drawn inside a 100 x 100 box.
const MOTIFS = {
  rabbit: (
    <>
      <ellipse cx="60" cy="27" rx="5" ry="15" transform="rotate(-12 60 27)" />
      <ellipse cx="72" cy="28" rx="5" ry="15" transform="rotate(14 72 28)" />
      <circle cx="66" cy="48" r="13" />
      <ellipse cx="48" cy="70" rx="24" ry="19" />
      <circle cx="25" cy="68" r="7" />
      <ellipse cx="62" cy="88" rx="10" ry="4" />
      <circle className="motif-cut" cx="71" cy="45" r="2" />
    </>
  ),
  magnifier: (
    <>
      <path d="M42 12 a30 30 0 1 0 0.1 0 Z M42 24 a18 18 0 1 1 -0.1 0 Z" fillRule="evenodd" />
      <rect x="58" y="62" width="14" height="34" rx="6" transform="rotate(-45 65 79)" />
      <path className="motif-cut" d="M30 34 a14 14 0 0 1 10 -8" fill="none" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  bolt: <path d="M58 6 L22 56 H46 L36 94 L80 38 H55 L66 6 Z" />,
  heart: (
    <>
      <path d="M50 88 C 20 66, 8 48, 16 31 C 24 15, 44 15, 50 30 C 56 15, 76 15, 84 31 C 92 48, 80 66, 50 88 Z" />
      <path className="motif-cut" d="M30 36 a10 10 0 0 1 10 -8" fill="none" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  book: (
    <>
      <path d="M50 30 C 38 21, 22 21, 10 25 V80 C 22 76, 38 76, 50 84 C 62 76, 78 76, 90 80 V25 C 78 21, 62 21, 50 30 Z" />
      <path className="motif-cut" d="M50 33 V80" fill="none" strokeWidth="3" />
    </>
  ),
};

// Picks a motif from the book's genre (unknown genres get an open book).
const GENRE_MOTIF = { fantasy: 'rabbit', mystery: 'magnifier', horror: 'bolt', romance: 'heart' };

export function motifFor(book) {
  return GENRE_MOTIF[String(book?.genre || '').toLowerCase()] || 'book';
}

export default function Motif({ name = 'book', className = '', ...rest }) {
  return (
    <svg className={`motif ${className}`} viewBox="0 0 100 100" aria-hidden="true" focusable="false" {...rest}>
      {MOTIFS[name] || MOTIFS.book}
    </svg>
  );
}
