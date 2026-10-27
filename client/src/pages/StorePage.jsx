import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { useAuth } from '../context/AuthContext';
import BookCover from '../components/BookCover';
import StarRating from '../components/StarRating';
import Loader from '../components/Loader';

export default function StorePage() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/books/genres').then((res) => setGenres(res.data)).catch(() => {});
  }, []);

  // Re-load the books when the search or genre changes.
  // The short wait (300ms) avoids asking the server on every single key press.
  useEffect(() => {
    const timer = setTimeout(() => {
      api
        .get('/books', { params: { q: search || undefined, genre: genre || undefined } })
        .then((res) => {
          setBooks(res.data);
          setError('');
        })
        .catch((err) => setError(errorMessage(err)))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search, genre]);

  return (
    <>
      <section className="store-hero">
        <div>
          <h1>Hello, {user.name.split(' ')[0]} 👋</h1>
          <p>Discover timeless classics. The first chapter of every book is free to read.</p>
        </div>
        <div className="filters">
          <input
            type="search"
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search books"
          />
          <select value={genre} onChange={(e) => setGenre(e.target.value)} aria-label="Filter by genre">
            <option value="">All genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </section>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <Loader text="Loading books..." />
      ) : books.length === 0 ? (
        <div className="empty-state">
          <h2>No books found</h2>
          <p className="muted">Try a different search or genre.</p>
        </div>
      ) : (
        <div className="book-grid">
          {books.map((book) => (
            <Link key={book._id} to={`/books/${book._id}`} className="book-card">
              <BookCover book={book} />
              <div className="book-card-body">
                <h3>{book.title}</h3>
                <p className="muted">{book.author}</p>
                <div className="book-card-meta">
                  <StarRating value={book.avgRating} size="0.9rem" />
                  <span className="muted small">({book.reviewCount})</span>
                </div>
                {book.owned ? (
                  <span className="badge badge-success">In your library</span>
                ) : (
                  <span className="badge">Free preview</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
