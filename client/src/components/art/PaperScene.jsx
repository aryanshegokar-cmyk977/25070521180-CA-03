// A paper-cut storybook landscape drawn in SVG (no image files).
// Day shows a sun, clouds and birds; night shows a moon, hanging stars and fireflies.
// The colours come from CSS variables, so the same drawing works for both themes.
// The sky itself is painted by the container's CSS (class "sky"), so the scene can sit
// at the bottom of tall phone screens without a visible seam.

const HILLS = {
  far: 'M0 250 C 180 190, 360 200, 520 232 S 860 168, 1040 200 S 1300 228, 1440 188 V420 H0Z',
  mid: 'M0 300 C 200 250, 380 262, 560 292 S 900 236, 1100 254 S 1340 292, 1440 270 V420 H0Z',
  near: 'M0 352 C 160 322, 340 332, 480 352 S 820 312, 1000 332 S 1300 362, 1440 336 V420 H0Z',
  front: 'M0 398 C 240 376, 520 386, 760 398 S 1200 380, 1440 392 V420 H0Z',
};

// [x, string length, size, delay]
const HANGING_STARS = [
  [150, 70, 1, 0], [330, 120, 0.8, 1.2], [520, 60, 1.15, 0.6], [690, 140, 0.7, 2],
  [1080, 80, 0.9, 1.6], [1240, 130, 1.1, 0.3], [1370, 60, 0.8, 2.4],
];
const TINY_STARS = [
  [90, 40], [250, 110], [420, 30], [600, 95], [760, 40], [880, 120], [1010, 30],
  [1150, 140], [1320, 30], [1400, 120], [40, 150], [470, 160],
];
const FIREFLIES = [[240, 300], [380, 270], [610, 330], [930, 290], [1180, 310], [1320, 280], [80, 330]];
const CLOUDS = [
  { x: 120, y: 70, s: 1.1, d: 0 },
  { x: 560, y: 40, s: 0.8, d: -6 },
  { x: 1150, y: 110, s: 0.9, d: -12 },
];

function starPath(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.45;
    pts.push(`${(cx + Math.cos(angle) * radius).toFixed(1)},${(cy + Math.sin(angle) * radius).toFixed(1)}`);
  }
  return `M${pts.join('L')}Z`;
}

function Cloud({ x, y, s, d }) {
  return (
    <g className="scene-cloud" style={{ animationDelay: `${d}s` }}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path d="M20 60 C 0 60, 0 30, 26 32 C 30 8, 70 4, 80 28 C 92 14, 128 20, 124 44 C 150 44, 150 60, 130 60 Z" />
      </g>
    </g>
  );
}

function Tree({ x, y, s = 1, kind = 'round' }) {
  return (
    <g className="scene-tree" transform={`translate(${x} ${y}) scale(${s})`}>
      <rect className="scene-trunk" x="-3" y="-6" width="6" height="22" rx="2" />
      {kind === 'round' ? (
        <circle cx="0" cy="-20" r="17" />
      ) : (
        <path d="M0 -52 L18 -14 H-18 Z M0 -36 L22 2 H-22 Z" />
      )}
    </g>
  );
}

export default function PaperScene({ className = '' }) {
  return (
    <svg
      className={`paper-scene ${className}`}
      viewBox="0 0 1440 420"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="scene-glow">
          <stop offset="0" style={{ stopColor: 'var(--glow)', stopOpacity: 0.55 }} />
          <stop offset="1" style={{ stopColor: 'var(--glow)', stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      {/* Sun (day) */}
      <g className="day-only">
        <circle cx="960" cy="92" r="120" fill="url(#scene-glow)" />
        <g className="scene-sun-rays">
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x="955" y="22" width="10" height="26" rx="5" transform={`rotate(${i * 30} 960 92)`} />
          ))}
        </g>
        <circle className="scene-sun" cx="960" cy="92" r="42" />
      </g>

      {/* Moon + stars (night) */}
      <g className="night-only">
        {TINY_STARS.map(([x, y], i) => (
          <circle key={i} className="scene-twinkle" cx={x} cy={y} r="2" style={{ animationDelay: `${(i % 5) * 0.7}s` }} />
        ))}
        <circle cx="960" cy="92" r="130" fill="url(#scene-glow)" />
        <path className="scene-moon" d="M985 140 A50 50 0 1 1 968 44 A40 40 0 0 0 985 140Z" />
        {HANGING_STARS.map(([x, len, s, delay]) => (
          <g key={x} className="scene-hanging" style={{ animationDelay: `${delay}s` }}>
            <line className="scene-string" x1={x} y1="0" x2={x} y2={len} />
            <path className="scene-star" d={starPath(x, len + 14 * s, 15 * s)} />
          </g>
        ))}
      </g>

      {/* Clouds + birds (day) */}
      <g className="day-only">
        {CLOUDS.map((c) => <Cloud key={c.x} {...c} />)}
        <g className="scene-birds">
          <path d="M380 130 q10 -10 20 0 q10 -10 20 0" />
          <path d="M420 108 q7 -7 14 0 q7 -7 14 0" />
          <path d="M350 104 q6 -6 12 0 q6 -6 12 0" />
        </g>
      </g>

      {/* Paper hills, back to front, each layer casting a soft shadow */}
      <path className="scene-hill scene-hill-1" d={HILLS.far} />

      {/* Little castle on the far hill */}
      <g className="scene-castle" transform="translate(800 118)">
        <rect x="-16" y="12" width="20" height="70" />
        <rect x="64" y="12" width="20" height="70" />
        <rect x="0" y="30" width="68" height="52" />
        <path className="scene-roof" d="M-20 14 L-6 -14 L8 14 Z M60 14 L74 -14 L88 14 Z M-4 32 L34 2 L72 32 Z" />
        <path className="scene-door" d="M26 82 V62 a8 8 0 0 1 16 0 V82 Z" />
        <rect className="scene-window" x="-10" y="30" width="8" height="12" rx="4" />
        <rect className="scene-window" x="70" y="30" width="8" height="12" rx="4" />
        <rect className="scene-window" x="12" y="44" width="8" height="10" rx="4" />
        <rect className="scene-window" x="48" y="44" width="8" height="10" rx="4" />
        <path className="scene-flag" d="M74 -14 V-34 L90 -28 L74 -22" />
      </g>

      <path className="scene-hill scene-hill-2" d={HILLS.mid} />
      <Tree x={1180} y={262} s={1} kind="pine" />
      <Tree x={1215} y={268} s={0.75} />

      <path className="scene-hill scene-hill-3" d={HILLS.near} />
      <Tree x={560} y={330} s={0.9} kind="pine" />
      <Tree x={640} y={338} s={0.75} />
      <Tree x={90} y={350} s={0.8} kind="pine" />
      <Tree x={1360} y={338} s={1.1} />

      {/* Fireflies (night) */}
      <g className="night-only">
        {FIREFLIES.map(([x, y], i) => (
          <circle key={i} className="scene-firefly" cx={x} cy={y} r="3" style={{ animationDelay: `${i * 0.9}s` }} />
        ))}
      </g>

      <path className="scene-hill scene-hill-4" d={HILLS.front} />
    </svg>
  );
}
