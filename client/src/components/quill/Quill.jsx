import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQuill } from '../../context/QuillContext';

// Little facts Quill shares when you tap him.
const TIPS = [
  'Hoo! Chapter 1 of every book is free. Try a few before you buy!',
  'Mary Shelley was only 18 when she started writing Frankenstein.',
  'Read a chapter every day to keep your 🔥 streak alive!',
  'The Great Gatsby only became free to read in 2021. Hoo knew?',
  'Bram Stoker never visited Transylvania. He read about it in a library!',
  'Tap the sun or moon at the top to switch between day and night.',
  'H. G. Wells wrote both The Time Machine and The War of the Worlds.',
  'Collect all six stamps on your library card. Check your Profile!',
  'Alice in Wonderland started as a story told on a boat trip.',
  'Lost your place? The "Continue reading" card on the Store takes you back.',
];

// Quill the owl, a paper-cut guide who sits in the corner and pops up with tips.
export default function Quill() {
  const { message, say, hush } = useQuill();
  const { user } = useAuth();
  const { pathname } = useLocation();

  // Say hello once per visit.
  useEffect(() => {
    if (sessionStorage.getItem('quill-hello')) return;
    const first = user?.name?.split(' ')[0] || 'reader';
    const timer = setTimeout(() => {
      sessionStorage.setItem('quill-hello', '1'); // only marked once Quill has actually spoken
      say(`Hoo-hoo! Welcome, ${first}! I'm Quill. Tap me any time for a tip.`, 'happy');
    }, 900);
    return () => clearTimeout(timer);
  }, [say, user?.name]);

  function tap() {
    if (message) return hush();
    say(TIPS[Math.floor(Math.random() * TIPS.length)], 'wow');
  }

  const mood = message?.mood || 'calm';

  return (
    <div className={`quill quill-${mood} ${pathname.startsWith('/read/') ? 'quill-reading' : ''}`}>
      {message && (
        <div className="quill-bubble" key={message.id} role="status">
          {message.text}
        </div>
      )}
      <button className="quill-owl" onClick={tap} aria-label="Quill the owl: tap for a reading tip">
        <svg viewBox="0 0 100 110" aria-hidden="true">
          {/* quill feather tucked behind the ear */}
          <path className="owl-feather" d="M74 6 C 90 2, 96 14, 86 24 C 82 28, 74 30, 68 32 C 70 22, 70 12, 74 6 Z" />
          <path className="owl-feather-line" d="M84 10 L 66 36" />
          {/* body + ear tufts */}
          <path className="owl-body" d="M22 30 L 18 8 L 36 22 C 44 19, 56 19, 64 22 L 82 8 L 78 30 C 90 44, 92 70, 82 88 C 74 102, 26 102, 18 88 C 8 70, 10 44, 22 30 Z" />
          <path className="owl-belly" d="M50 50 C 68 50, 74 70, 70 86 C 64 96, 36 96, 30 86 C 26 70, 32 50, 50 50 Z" />
          <path className="owl-belly-marks" d="M40 66 q4 4 8 0 M52 66 q4 4 8 0 M44 76 q4 4 8 0 M56 76 q2 3 4 1" />
          {/* wings */}
          <path className="owl-wing owl-wing-left" d="M18 50 C 6 60, 6 80, 18 90 C 22 76, 24 62, 18 50 Z" />
          <path className="owl-wing owl-wing-right" d="M82 50 C 94 60, 94 80, 82 90 C 78 76, 76 62, 82 50 Z" />
          {/* eyes */}
          <circle className="owl-eye-ring" cx="36" cy="40" r="13" />
          <circle className="owl-eye-ring" cx="64" cy="40" r="13" />
          <circle className="owl-eye" cx="36" cy="40" r="9" />
          <circle className="owl-eye" cx="64" cy="40" r="9" />
          <circle className="owl-pupil" cx="37" cy="41" r="4.5" />
          <circle className="owl-pupil" cx="63" cy="41" r="4.5" />
          <circle className="owl-shine" cx="39" cy="38" r="1.6" />
          <circle className="owl-shine" cx="65" cy="38" r="1.6" />
          <g className="owl-lids">
            <rect x="23" y="27" width="26" height="26" rx="13" />
            <rect x="51" y="27" width="26" height="26" rx="13" />
          </g>
          {/* beak + feet */}
          <path className="owl-beak" d="M45 48 L 55 48 L 50 58 Z" />
          <path className="owl-feet" d="M36 96 l -4 8 M40 97 v8 M44 96 l 4 8 M56 96 l -4 8 M60 97 v8 M64 96 l 4 8" />
        </svg>
      </button>
    </div>
  );
}
