import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errorMessage } from '../api';
import BookCover from '../components/BookCover';
import StarRating from '../components/StarRating';
import BuyBox from '../components/BuyBox';
import Reviews from '../components/Reviews';
import Loader from '../components/Loader';

export default function BookDetailsPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(() => {
    return api
      .get(`/books/${id}`)
      .then((res) => setBook(res.data))
      .catch((err) => setError(errorMessage(err)));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (error && !book) return <div className="alert alert-error">{error}</div>;
  if (!book) return <Loader text="Loading book..." />;

  function handleBought(message) {
    setSuccess(message);
    load();
  }

  const lockedCount = book.chapters.filter((c) => c.locked).length;

  return (
    <>
      <Link to="/" className="back-link">← Back to Store</Link>

      <section className="details">
        <div className="details-cover">
          <BookCover book={book} size="large" />
        </div>

        <div className="details-info">
          <span className="badge">{book.genre}</span>
          <h1>{book.title}</h1>
          <p className="details-author">by {book.author}{book.year ? ` · ${book.year}` : ''}</p>
          <div className="book-card-meta">
            <StarRating value={book.avgRating} size="1.2rem" />
            <span className="muted">
              {book.reviewCount ? `${book.avgRating} from ${book.reviewCount} review${book.reviewCount > 1 ? 's' : ''}` : 'No reviews yet'}
            </span>
          </div>
          <p className="details-summary">{book.summary}</p>
          <p className="muted small">{book.chapters.length} chapters</p>

          {success && <div className="alert alert-success">{success}</div>}

          {book.owned ? (
            <div className="owned-box">
              <span className="badge badge-success">✓ In your library · {book.purchase?.status}</span>
              <Link className="btn btn-primary" to={`/read/${book._id}/1`}>Start reading</Link>
            </div>
          ) : (
            <div className="purchase-panel card">
              <div className="btn-row">
                <Link className="btn btn-secondary" to={`/read/${book._id}/1`}>📖 Read free preview</Link>
              </div>
              <p className="muted small">Chapter 1 is free. Buy the book to unlock all {lockedCount} other chapters.</p>
              <BuyBox bookId={book._id} onBought={handleBought} />
            </div>
          )}
        </div>
      </section>

      <section className="chapter-list-section">
        <h2>Chapters</h2>
        <ol className="chapter-list">
          {book.chapters.map((ch) => (
            <li key={ch.number}>
              <Link to={`/read/${book._id}/${ch.number}`} className={ch.locked ? 'locked' : ''}>
                <span className="chapter-num">{ch.number}</span>
                <span className="chapter-title">{ch.title}</span>
                <span aria-label={ch.locked ? 'locked' : 'unlocked'}>{ch.locked ? '🔒' : ch.number === 1 && !book.owned ? 'Free' : ''}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <Reviews bookId={book._id} onChange={load} />
    </>
  );
}
