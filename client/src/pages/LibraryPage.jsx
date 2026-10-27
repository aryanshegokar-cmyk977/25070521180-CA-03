import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api';
import BookCover from '../components/BookCover';
import Loader from '../components/Loader';
import ProgressBar from '../components/ProgressBar';
import Motif from '../components/art/Motif';

const STATUSES = ['To Read', 'Reading', 'Finished'];

export default function LibraryPage() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');
  const [picked, setPicked] = useState(null); // the book pulled off the shelf

  useEffect(() => {
    api
      .get('/library')
      .then((res) => setItems(res.data))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  async function changeStatus(item, status) {
    try {
      const { data } = await api.put(`/library/${item._id}`, { status });
      setItems((list) => list.map((i) => (i._id === item._id ? { ...i, ...data } : i)));
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  // Pull a book off the shelf: highlight its card below and scroll to it.
  function pick(item) {
    setPicked(item._id);
    document.getElementById(`lib-${item._id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
        <>
        <div className="bookshelf" aria-label="Your bookshelf">
          {shown.map((item, i) => (
            <button
              key={item._id}
              className={`spine ${picked === item._id ? 'picked' : ''}`}
              style={{
                '--cover': item.book.coverColor || '#e2603f',
                '--h': `${150 + Math.min(item.totalChapters || 0, 60) * 1.4}px`,
                '--lean': i % 5 === 3 ? '-4deg' : '0deg',
              }}
              onClick={() => pick(item)}
              title={`${item.book.title} · ${item.status}`}
            >
              <span className={`spine-ribbon ribbon-${item.status.replace(' ', '-').toLowerCase()}`} aria-hidden="true" />
              <span className="spine-title">{item.book.title}</span>
              <span className="spine-author">{item.book.author.split(' ').pop()}</span>
            </button>
          ))}
        </div>
        <p className="shelf-legend small muted">
          <span className="ribbon-dot ribbon-to-read" /> To Read
          <span className="ribbon-dot ribbon-reading" /> Reading
          <span className="ribbon-dot ribbon-finished" /> Finished
          <span className="shelf-hint">· tap a book to pull it out</span>
        </p>
        <div className="library-list">
          {shown.map((item) => {
            const lastChapter = item.lastChapter || 1;
            const read = item.chaptersRead?.length || 0;
            return (
              <div key={item._id} id={`lib-${item._id}`} className={`library-item card ${picked === item._id ? 'picked' : ''}`}>
                <Link to={`/books/${item.book._id}`}>
                  <BookCover book={item.book} size="small" />
                </Link>
                <div className="library-info">
                  <h3><Link to={`/books/${item.book._id}`}>{item.book.title}</Link></h3>
                  <p className="muted">{item.book.author}</p>
                  <ProgressBar read={read} total={item.totalChapters} />
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
                    {read ? `Continue (Ch. ${lastChapter})` : 'Start reading'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        </>
      )}
    </>
  );
}
