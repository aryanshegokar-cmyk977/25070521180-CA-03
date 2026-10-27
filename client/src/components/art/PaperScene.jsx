import { useEffect, useRef } from 'react';

// A paper-cut storybook landscape drawn in SVG (no image files).
// Day shows a sun, clouds, birds and butterflies; night shows a moon, hanging stars,
// fireflies and the odd shooting star. The colours come from CSS variables, so the same
// drawing works for both themes.
//
// Switching theme plays a little show: the sun and moon sit on one big "sky wheel" that
// turns half a circle, so the sun sets behind the hills while the moon rises, and the
// paper stars are lowered on their strings.
//
// The layers also shift a little with the mouse (parallax), like a real pop-up book.
// The sky itself is painted by the container's CSS (class "sky").

const HILLS = {
  far: 'M0 250 C 180 190, 360 200, 520 232 S 860 168, 1040 200 S 1300 228, 1440 188 V420 H0Z',
  mid: 'M0 300 C 200 250, 380 262, 560 292 S 900 236, 1100 254 S 1340 292, 1440 270 V420 H0Z',
  near: 'M0 352 C 160 322, 340 332, 480 352 S 820 312, 1000 332 S 1300 362, 1440 336 V420 H0Z',
  front: 'M0 398 C 240 376, 520 386, 760 398 S 1200 380, 1440 392 V420 H0Z',
};

// The castle's own hill: a rounded mound with a flat top, so the castle stands on solid ground.
const CASTLE_HILL = 'M700 300 C 760 252, 800 192, 850 186 H930 C 980 192, 1020 252, 1080 300 Z';

// The sun and moon turn around this point. Sun on top by day, moon on the opposite side.
const WHEEL = { x: 1210, y: 580, r: 470 };
const SKY_Y = WHEEL.y - WHEEL.r; // = 110, where the sun / moon sits when it is "up"

// [x, string length, size, delay] - kept clear of the moon and the castle
const HANGING_STARS = [
  [120, 70, 1, 0], [300, 120, 0.8, 1.2], [470, 60, 1.15, 0.6], [640, 130, 0.7, 2],
  [1010, 46, 0.85, 1.6], [1360, 120, 1.05, 0.3], [1420, 50, 0.7, 2.4],
];
const TINY_STARS = [
  [90, 40], [250, 110], [420, 30], [600, 95], [760, 40], [880, 120], [1010, 130],
  [1080, 30], [1320, 30], [1400, 180], [40, 150], [470, 160], [700, 150], [1290, 200],
];
const FIREFLIES = [[240, 300], [380, 270], [610, 330], [930, 290], [1180, 310], [1320, 280], [80, 330], [760, 340]];
const CLOUDS = [
  { x: 120, y: 70, s: 1.1, d: 0 },
  { x: 560, y: 40, s: 0.8, d: -6 },
  { x: 1300, y: 150, s: 0.7, d: -12 },
];
const BUTTERFLIES = [[300, 330, 0], [1120, 300, 2.5]];

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

function Tree({ x, y, s = 1, kind = 'round', delay = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="scene-tree" style={{ animationDelay: `${delay}s` }}>
        <rect className="scene-trunk" x="-3" y="-6" width="6" height="22" rx="2" />
        {kind === 'round' ? (
          <circle cx="0" cy="-20" r="17" />
        ) : (
          <path d="M0 -52 L18 -14 H-18 Z M0 -36 L22 2 H-22 Z" />
        )}
      </g>
    </g>
  );
}

function Butterfly({ x, y, delay }) {
  return (
    <g transform={`translate(${x} ${y}) scale(1.6)`}>
      <g className="scene-butterfly" style={{ animationDelay: `${delay}s` }}>
        <path className="scene-wing" d="M0 0 C -10 -14, -20 -6, -12 2 C -18 8, -8 14, 0 4 Z" />
        <path className="scene-wing scene-wing-right" d="M0 0 C 10 -14, 20 -6, 12 2 C 18 8, 8 14, 0 4 Z" />
      </g>
    </g>
  );
}

function Castle() {
  // Drawn so its bottom edge (y = 82) sits on the flat top of the castle hill (y = 186).
  return (
    <g className="scene-castle" transform="translate(856 104)">
      <rect x="-16" y="12" width="20" height="70" />
      <rect x="64" y="12" width="20" height="70" />
      <rect x="0" y="30" width="68" height="52" />
      <path className="scene-roof" d="M-20 14 L-6 -14 L8 14 Z M60 14 L74 -14 L88 14 Z M-4 32 L34 2 L72 32 Z" />
      <path className="scene-door" d="M26 82 V62 a8 8 0 0 1 16 0 V82 Z" />
      <rect className="scene-window" x="-10" y="30" width="8" height="12" rx="4" />
      <rect className="scene-window" x="70" y="30" width="8" height="12" rx="4" style={{ animationDelay: '1.3s' }} />
      <rect className="scene-window" x="12" y="44" width="8" height="10" rx="4" style={{ animationDelay: '0.6s' }} />
      <rect className="scene-window" x="48" y="44" width="8" height="10" rx="4" style={{ animationDelay: '2.1s' }} />
      <path className="scene-flag" d="M74 -14 V-34 L90 -28 L74 -22" />
      <path className="scene-flag" d="M-6 -14 V-30 L-20 -25 L-6 -20" style={{ animationDelay: '0.8s' }} />
    </g>
  );
}

export default function PaperScene({ className = '' }) {
  const svgRef = useRef(null);

  // Parallax: move the layers a few pixels with the mouse.
  useEffect(() => {
    const svg = svgRef.current;
    const area = svg?.parentElement;
    if (!area || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    function move(e) {
      const box = area.getBoundingClientRect();
      svg.style.setProperty('--px', ((e.clientX - box.left) / box.width - 0.5).toFixed(3));
      svg.style.setProperty('--py', ((e.clientY - box.top) / box.height - 0.5).toFixed(3));
    }
    function reset() {
      svg.style.setProperty('--px', 0);
      svg.style.setProperty('--py', 0);
    }
    area.addEventListener('pointermove', move);
    area.addEventListener('pointerleave', reset);
    return () => {
      area.removeEventListener('pointermove', move);
      area.removeEventListener('pointerleave', reset);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
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

      {/* Night sky: twinkling stars, plus a shooting star now and then */}
      <g className="night-only parallax parallax-sky">
        {TINY_STARS.map(([x, y], i) => (
          <circle
            key={i}
            className="scene-twinkle"
            cx={x}
            cy={y}
            r="2"
            style={{ animationDelay: `${(i % 5) * 0.7}s` }}
          />
        ))}
        <path className="scene-shooting-star" d="M300 40 L380 70" />
      </g>

      {/* The sky wheel: sun on top (day), moon on the opposite side (night) */}
      <g className="parallax parallax-sky">
        <g className="sky-wheel" style={{ transformOrigin: `${WHEEL.x}px ${WHEEL.y}px` }}>
          <g>
            <circle cx={WHEEL.x} cy={SKY_Y} r="120" fill="url(#scene-glow)" />
            <g className="scene-sun-rays" style={{ transformOrigin: `${WHEEL.x}px ${SKY_Y}px` }}>
              {Array.from({ length: 12 }, (_, i) => (
                <rect key={i} x={WHEEL.x - 5} y={SKY_Y - 70} width="10" height="26" rx="5" transform={`rotate(${i * 30} ${WHEEL.x} ${SKY_Y})`} />
              ))}
            </g>
            <circle className="scene-sun" cx={WHEEL.x} cy={SKY_Y} r="42" />
          </g>
          {/* Upside down here, so it is the right way up once the wheel has turned */}
          <g transform={`rotate(180 ${WHEEL.x} ${WHEEL.y})`}>
            <circle cx={WHEEL.x} cy={SKY_Y} r="130" fill="url(#scene-glow)" />
            <path className="scene-moon" d={`M${WHEEL.x + 25} ${SKY_Y + 48} A50 50 0 1 1 ${WHEEL.x + 8} ${SKY_Y - 48} A40 40 0 0 0 ${WHEEL.x + 25} ${SKY_Y + 48}Z`} />
            <circle className="scene-moon-crater" cx={WHEEL.x - 20} cy={SKY_Y - 10} r="6" />
            <circle className="scene-moon-crater" cx={WHEEL.x - 10} cy={SKY_Y + 22} r="4" />
          </g>
        </g>
      </g>

      {/* Paper stars lowered on strings at night */}
      <g className="parallax parallax-sky">
        <g className="night-only scene-stars-drop">
          {HANGING_STARS.map(([x, len, s, delay]) => (
            <g key={x} className="scene-hanging" style={{ animationDelay: `${delay}s` }}>
              <line className="scene-string" x1={x} y1="-200" x2={x} y2={len} />
              <path className="scene-star" d={starPath(x, len + 14 * s, 15 * s)} />
            </g>
          ))}
        </g>
      </g>

      {/* Clouds + birds slide in by day */}
      <g className="parallax parallax-sky">
        <g className="day-only scene-clouds-slide">
          {CLOUDS.map((c) => <Cloud key={c.x} {...c} />)}
          <g className="scene-birds">
            <path d="M380 130 q10 -10 20 0 q10 -10 20 0" />
            <path d="M420 108 q7 -7 14 0 q7 -7 14 0" />
            <path d="M350 104 q6 -6 12 0 q6 -6 12 0" />
          </g>
        </g>
      </g>

      {/* Paper hills, back to front, each layer casting a soft shadow */}
      <g className="parallax parallax-far">
        <path className="scene-hill scene-hill-1" d={HILLS.far} />
        <path className="scene-hill scene-hill-1" d={CASTLE_HILL} />
        <path className="scene-path" d="M890 190 C 872 210, 920 222, 896 244 S 880 276, 904 300" />
        <Castle />
        <Tree x={812} y={214} s={0.55} kind="pine" delay={0.4} />
        <Tree x={972} y={214} s={0.5} delay={1.1} />
      </g>

      <g className="parallax parallax-mid">
        <path className="scene-hill scene-hill-2" d={HILLS.mid} />
        <Tree x={1180} y={262} s={1} kind="pine" delay={0.2} />
        <Tree x={1215} y={268} s={0.75} delay={0.9} />
      </g>

      <g className="parallax parallax-near">
        <path className="scene-hill scene-hill-3" d={HILLS.near} />
        <Tree x={560} y={330} s={0.9} kind="pine" delay={0.5} />
        <Tree x={640} y={338} s={0.75} delay={1.4} />
        <Tree x={90} y={350} s={0.8} kind="pine" delay={0.7} />
        <Tree x={1360} y={338} s={1.1} delay={0} />

        <g className="day-only">
          {BUTTERFLIES.map(([x, y, d]) => <Butterfly key={x} x={x} y={y} delay={d} />)}
        </g>
        <g className="night-only">
          {FIREFLIES.map(([x, y], i) => (
            <circle key={i} className="scene-firefly" cx={x} cy={y} r="3" style={{ animationDelay: `${i * 0.9}s` }} />
          ))}
        </g>
      </g>

      <g className="parallax parallax-front">
        <path className="scene-hill scene-hill-4" d={HILLS.front} />
      </g>
    </svg>
  );
}
