// Simple paper-cut silhouettes used on book covers and empty states.
// Each one is drawn inside a 100 x 100 box.
const MOTIFS = {
  bat: (
    <>
      <path d="M50 42 C 44 32, 32 30, 26 38 C 18 32, 6 36, 2 46 C 12 44, 18 50, 20 58 C 26 52, 34 54, 38 62 C 42 56, 46 56, 50 60 C 54 56, 58 56, 62 62 C 66 54, 74 52, 80 58 C 82 50, 88 44, 98 46 C 94 36, 82 32, 74 38 C 68 30, 56 32, 50 42 Z" />
      <path d="M42 40 L44 28 L50 36 L56 28 L58 40 Z" />
      <circle className="motif-cut" cx="46" cy="40" r="1.8" />
      <circle className="motif-cut" cx="54" cy="40" r="1.8" />
    </>
  ),
  hourglass: (
    <>
      <rect x="22" y="8" width="56" height="9" rx="3" />
      <rect x="22" y="83" width="56" height="9" rx="3" />
      <path d="M30 17 H70 V22 C 70 38, 56 44, 55 50 C 56 56, 70 62, 70 78 V83 H30 V78 C 30 62, 44 56, 45 50 C 44 44, 30 38, 30 22 Z" />
      <path className="motif-cut" d="M38 78 C 40 70, 46 66, 50 64 C 54 66, 60 70, 62 78 Z" />
      <path className="motif-cut" d="M39 27 H61 C 58 34, 53 37, 50 40 C 47 37, 42 34, 39 27 Z" />
    </>
  ),
  chest: (
    <>
      <path d="M14 44 C 14 26, 86 26, 86 44 Z" />
      <rect x="14" y="47" width="72" height="38" rx="4" />
      <rect className="motif-cut" x="14" y="58" width="72" height="4" />
      <rect className="motif-cut" x="44" y="52" width="12" height="16" rx="3" />
      <circle cx="50" cy="59" r="2.2" />
      <circle cx="30" cy="22" r="3" />
      <circle cx="70" cy="18" r="2.4" />
      <circle cx="54" cy="12" r="2" />
    </>
  ),
  tornado: (
    <>
      <rect x="10" y="10" width="80" height="13" rx="6.5" />
      <rect x="18" y="27" width="62" height="12" rx="6" />
      <rect x="28" y="43" width="46" height="11" rx="5.5" />
      <rect x="36" y="58" width="32" height="10" rx="5" />
      <rect x="42" y="72" width="20" height="9" rx="4.5" />
      <rect x="46" y="85" width="10" height="8" rx="4" />
    </>
  ),
  glass: (
    <>
      <path d="M18 18 H82 C 80 38, 66 48, 54 50 V78 H68 V86 H32 V78 H46 V50 C 34 48, 20 38, 18 18 Z" />
      <circle className="motif-cut" cx="40" cy="30" r="3" />
      <circle className="motif-cut" cx="54" cy="36" r="2.4" />
      <circle className="motif-cut" cx="62" cy="26" r="2" />
      <circle cx="72" cy="8" r="2.4" />
      <circle cx="84" cy="10" r="1.6" />
    </>
  ),
  key: (
    <>
      <path d="M30 22 a20 20 0 1 0 0.1 0 Z M30 33 a9 9 0 1 1 -0.1 0 Z" fillRule="evenodd" />
      <rect x="47" y="38" width="44" height="9" rx="3" />
      <rect x="72" y="46" width="7" height="13" rx="2" />
      <rect x="83" y="46" width="7" height="18" rx="2" />
    </>
  ),
  star: (
    <>
      <path d="M50 10 L60 38 L90 39 L66 57 L75 86 L50 69 L25 86 L34 57 L10 39 L40 38 Z" />
      <path className="motif-cut" d="M44 44 L50 30 L56 44" fill="none" strokeWidth="3" strokeLinecap="round" />
      <circle cx="88" cy="12" r="3" />
      <circle cx="14" cy="16" r="2" />
    </>
  ),
  balloon: (
    <>
      <path d="M50 6 C 24 6, 14 30, 26 48 C 32 56, 40 62, 42 68 H58 C 60 62, 68 56, 74 48 C 86 30, 76 6, 50 6 Z" />
      <path className="motif-cut" d="M50 8 C 40 20, 40 50, 46 66 M50 8 C 60 20, 60 50, 54 66" fill="none" strokeWidth="3" />
      <rect x="41" y="67" width="3" height="13" rx="1.5" transform="rotate(12 42 73)" />
      <rect x="56" y="67" width="3" height="13" rx="1.5" transform="rotate(-12 58 73)" />
      <rect x="38" y="78" width="24" height="15" rx="3" />
    </>
  ),
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

// Picks a motif for a book: its own one if it has one, otherwise one for its genre
// (unknown genres get an open book).
const BOOK_MOTIF = {
  dracula: 'bat',
  'time-machine': 'hourglass',
  'treasure-island': 'chest',
  'wizard-of-oz': 'tornado',
  'great-gatsby': 'glass',
  'secret-garden': 'key',
  'peter-pan': 'star',
  'around-the-world': 'balloon',
};
const GENRE_MOTIF = {
  fantasy: 'rabbit', mystery: 'magnifier', horror: 'bolt', romance: 'heart',
  'science fiction': 'hourglass', adventure: 'balloon', drama: 'key',
};

export function motifFor(book) {
  return BOOK_MOTIF[book?.slug] || GENRE_MOTIF[String(book?.genre || '').toLowerCase()] || 'book';
}

export default function Motif({ name = 'book', className = '', ...rest }) {
  return (
    <svg className={`motif ${className}`} viewBox="0 0 100 100" aria-hidden="true" focusable="false" {...rest}>
      {MOTIFS[name] || MOTIFS.book}
    </svg>
  );
}
