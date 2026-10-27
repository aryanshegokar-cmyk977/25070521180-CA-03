import { Link } from 'react-router-dom';
import Motif from '../components/art/Motif';

export default function NotFoundPage() {
  return (
    <div className="empty-state">
      <Motif name="rabbit" className="empty-art" />
      <h1>Page not found</h1>
      <p className="muted">This page wandered off like the White Rabbit.</p>
      <Link className="btn btn-primary" to="/">Back home</Link>
    </div>
  );
}
