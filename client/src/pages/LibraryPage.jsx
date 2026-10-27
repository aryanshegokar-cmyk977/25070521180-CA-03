import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api';
import BookCover from '../components/BookCover';
import Loader from '../components/Loader';
import { recall } from '../storage';
import Motif from '../components/art/Motif';

const STATUSES = ['To Read', 'Reading', 'Finished'];

export default function LibraryPage() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/library')
      .then((res) => setItems(res.data))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  async function changeStatus(item, status) {
    try {
      const { data } = await api.put(`/library/${item._id}`, { status });
      setItems((list) => list.map((i) => (i._id === item._id ? data : i)));
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  if (!items) return error ? <div className="alert alert-error">{error}</div> : <Loader text="Loading your library..." />;

  const count = (status) => items.filter((i) => i.status === status).length;
  const shown = filter === 'All' ? items : items.filter((i) => i.status === filter);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>My Library</h1>
          <p className="muted">{items.length} book{items.length === 1 ? '' : 's'} you own</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="tabs">
        {['All', ...STATUSES].map((s) => (
          <button key={s} className={filter === s ? 'active' : ''} onClick={() => setFilter(s)}>
            {s} ({s === 'All' ? items.length : count(s)})
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="empty-state">
          <Motif name="book" className="empty-art" />
          <h2>{items.length ? `Nothing in "${filter}"` : 'Your library is empty'}</h2>
          <p className="muted">{items.length ? 'Change a book\'s tag to move it here.' : 'Buy a book with a voucher code and it will appear here.'}</p>
          {!items.length && <Link to="/" className="btn btn-primary">Browse the Store</Link>}
        </div>
      ) : (
        <div className="library-list">
          {shown.map((item) => {
            const lastChapter = recall(`lastChapter:${item.book._id}`, 1);
            return (
              <div key={item._id} className="library-item card">
                <Link to={`/books/${item.book._id}`}>
                  <BookCover book={item.book} size="small" />
                </Link>
                <div className="library-info">
                  <h3><Link to={`/books/${item.book._id}`}>{item.book.title}</Link></h3>
                  <p className="muted">{item.book.author}</p>
                  <p className="muted small">Added {new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="library-actions">
                  <select
                    value={item.status}
                    onChange={(e) => changeStatus(item, e.target.value)}
                    aria-label={`Status of ${item.book.title}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <Link className="btn btn-primary" to={`/read/${item.book._id}/${lastChapter}`}>
                    {lastChapter > 1 ? `Continue (Ch. ${lastChapter})` : 'Read'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
