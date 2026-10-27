// The BookVerse mark: a paper book under a little sun (or moon at night, via CSS).
export default function Logo({ size = 34 }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect className="logo-bg" width="64" height="64" rx="16" />
      <circle className="logo-sun" cx="46" cy="18" r="7" />
      <path className="logo-book" d="M32 22c-6-5-14-5-20-3v28c6-2 14-2 20 3 6-5 14-5 20-3V19c-6-2-14-2-20 3z" />
      <path className="logo-spine" d="M32 22v28" />
    </svg>
  );
}
