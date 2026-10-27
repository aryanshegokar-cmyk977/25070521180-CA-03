import { useState } from 'react';

// Shows 1-5 stars. If onChange is given, the stars can be clicked to pick a rating.
export default function StarRating({ value = 0, onChange, size = '1rem' }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  if (!onChange) {
    return (
      <span className="stars" style={{ fontSize: size }} aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={n <= Math.round(value) ? 'star on' : 'star'}>★</span>
        ))}
      </span>
    );
  }

  return (
    <span className="stars stars-input" style={{ fontSize: size }} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={n <= shown ? 'star on' : 'star'}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </span>
  );
}
