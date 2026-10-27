import { useMemo } from 'react';

// "Magic air" that floats behind every reader page, filling the empty space around the content.
// Day: dry autumn leaves drifting down. Night: twinkling stars and slow silver dust.
// It sits behind everything (pointer-events: none) and is fainter on the Reader page.

// A small fixed random generator, so the pattern is the same on every visit (no jumping).
function seeded(seed) {
  let n = seed;
  return () => {
    n = (n * 9301 + 49297) % 233280;
    return n / 233280;
  };
}

const LEAF_COLOURS = ['#d9772f', '#b8432f', '#e0a93b', '#c95f2a', '#a8622e'];

// Leaves sit mostly near the left and right edges, where the page is empty.
function sideX(rand) {
  const x = rand() * 18;
  return rand() < 0.5 ? x : 100 - x;
}

export default function AmbientLayer({ faint = false }) {
  const { leaves, stars, dust } = useMemo(() => {
    const rand = seeded(7);
    return {
      leaves: Array.from({ length: 16 }, (_, i) => ({
        left: i % 3 === 0 ? rand() * 100 : sideX(rand),
        size: 18 + rand() * 16,
        duration: 14 + rand() * 12,
        delay: -rand() * 26,
        sway: 30 + rand() * 50,
        colour: LEAF_COLOURS[i % LEAF_COLOURS.length],
      })),
      stars: Array.from({ length: 46 }, (_, i) => ({
        left: i % 4 === 0 ? rand() * 100 : sideX(rand),
        top: rand() * 100,
        size: 1.5 + rand() * 2.5,
        delay: -rand() * 4,
      })),
      dust: Array.from({ length: 18 }, () => ({
        left: rand() * 100,
        top: rand() * 100,
        duration: 18 + rand() * 16,
        delay: -rand() * 30,
      })),
    };
  }, []);

  return (
    <div className={`ambient ${faint ? 'ambient-faint' : ''}`} aria-hidden="true">
      <div className="day-only ambient-day">
        {leaves.map((leaf, i) => (
          <span
            key={i}
            className="leaf-fall"
            style={{
              left: `${leaf.left}%`,
              animationDuration: `${leaf.duration}s`,
              animationDelay: `${leaf.delay}s`,
              '--sway': `${leaf.sway}px`,
            }}
          >
            <svg className="leaf" viewBox="0 0 24 24" style={{ width: leaf.size, fill: leaf.colour, animationDelay: `${leaf.delay}s` }}>
              <path d="M12 2 C 15 6, 20 7, 21 12 C 18 12, 17 14, 18 17 C 15 16, 13 18, 12.6 21 H11.4 C 11 18, 9 16, 6 17 C 7 14, 6 12, 3 12 C 4 7, 9 6, 12 2 Z" />
              <path d="M12 6 V21" stroke="rgba(0,0,0,0.18)" strokeWidth="0.8" fill="none" />
            </svg>
          </span>
        ))}
      </div>
      <div className="night-only ambient-night">
        {stars.map((star, i) => (
          <span
            key={i}
            className="ambient-star"
            style={{ left: `${star.left}%`, top: `${star.top}%`, width: star.size, height: star.size, animationDelay: `${star.delay}s` }}
          />
        ))}
        {dust.map((mote, i) => (
          <span
            key={i}
            className="ambient-dust"
            style={{ left: `${mote.left}%`, top: `${mote.top}%`, animationDuration: `${mote.duration}s`, animationDelay: `${mote.delay}s` }}
          />
        ))}
      </div>
    </div>
  );
}
