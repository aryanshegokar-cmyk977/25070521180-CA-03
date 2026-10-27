import { Link } from 'react-router-dom';
import { useStats } from '../context/StatsContext';

// A little paper badge in the navbar, like the coin counter in a game:
// books owned, chapters read and the reading streak.
export default function ReadingHud() {
  const { stats } = useStats();
  if (!stats) return null;

  return (
    <Link to="/profile" className="hud" title="Your reading tracker">
      <span className="hud-item" aria-label={`${stats.booksOwned} books owned`}>
        <span aria-hidden="true">📚</span> {stats.booksOwned}
      </span>
      <span className="hud-item" aria-label={`${stats.chaptersRead} chapters read`}>
        <span aria-hidden="true">📖</span> {stats.chaptersRead}
      </span>
      <span className={`hud-item hud-streak-item ${stats.streak ? 'hud-streak' : ''}`} aria-label={`${stats.streak} day reading streak`}>
        <span aria-hidden="true" className="hud-flame">🔥</span> {stats.streak}
      </span>
    </Link>
  );
}
