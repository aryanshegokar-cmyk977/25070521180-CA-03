// A short strip of layered paper hills, used along the bottom of pages and the admin sidebar.
export default function PaperHills({ className = '' }) {
  return (
    <svg className={`paper-hills ${className}`} viewBox="0 0 1440 120" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <path className="scene-hill scene-hill-1" d="M0 60 C 200 20, 420 30, 620 58 S 1000 20, 1200 40 S 1380 70, 1440 50 V120 H0Z" />
      <path className="scene-hill scene-hill-2" d="M0 82 C 240 50, 460 60, 700 82 S 1120 52, 1440 76 V120 H0Z" />
      <g className="scene-tree" transform="translate(300 64) scale(0.7)">
        <rect className="scene-trunk" x="-3" y="-6" width="6" height="22" rx="2" />
        <circle cx="0" cy="-20" r="17" />
      </g>
      <g className="scene-tree" transform="translate(1100 62) scale(0.6)">
        <rect className="scene-trunk" x="-3" y="-6" width="6" height="22" rx="2" />
        <path d="M0 -52 L18 -14 H-18 Z M0 -36 L22 2 H-22 Z" />
      </g>
      <path className="scene-hill scene-hill-3" d="M0 100 C 300 80, 600 92, 900 102 S 1300 86, 1440 96 V120 H0Z" />
    </svg>
  );
}
