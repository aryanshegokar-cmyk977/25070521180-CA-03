import { useTheme } from '../context/ThemeContext';

// A paper disc with a sun on one side and a moon on the other. Clicking flips it over.
export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isNight = theme === 'night';

  return (
    <button
      type="button"
      className={`theme-toggle ${isNight ? 'is-night' : ''} ${className}`}
      onClick={toggleTheme}
      aria-label={isNight ? 'Switch to day mode' : 'Switch to night mode'}
      title={isNight ? 'Day mode' : 'Night mode'}
    >
      <span className="theme-toggle-disc">
        <svg className="theme-face theme-face-sun" viewBox="0 0 40 40" aria-hidden="true">
          <g className="sun-rays">
            {Array.from({ length: 8 }, (_, i) => (
              <rect key={i} x="18.5" y="3" width="3" height="7" rx="1.5" transform={`rotate(${i * 45} 20 20)`} />
            ))}
          </g>
          <circle cx="20" cy="20" r="8.5" />
        </svg>
        <svg className="theme-face theme-face-moon" viewBox="0 0 40 40" aria-hidden="true">
          <path d="M26 30.5A12 12 0 1 1 22.5 8a9.5 9.5 0 0 0 3.5 22.5z" />
          <circle cx="29" cy="11" r="1.4" />
          <circle cx="32" cy="18" r="1" />
        </svg>
      </span>
    </button>
  );
}
