import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="empty-state">
      <h1>Page not found</h1>
      <p>This page wandered off like the White Rabbit.</p>
      <Link className="btn btn-primary" to="/">Back to the Store</Link>
    </div>
  );
}
