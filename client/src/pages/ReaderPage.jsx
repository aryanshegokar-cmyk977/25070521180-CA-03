import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errorMessage } from '../api';
import BuyBox from '../components/BuyBox';
import Loader from '../components/Loader';
import ProgressBar from '../components/ProgressBar';
import { useStats } from '../context/StatsContext';
import { useQuill } from '../context/QuillContext';
import { recall, remember } from '../storage';

const FONT_SIZES = [16, 18, 20, 22, 24];

export default function ReaderPage() {
  const { id, chapter } = useParams();
  const number = Number(chapter);
  const navigate = useNavigate();
  const { stats, refreshStats } = useStats();
  const { say } = useQuill();
  const streakBefore = useRef(null);
  if (streakBefore.current === null && stats) streakBefore.current = stats.streak;

  const [book, setBook] = useState(null); // details + chapter list
  const [page, setPage] = useState(null); // the current chapter (or locked info)
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showChapters, setShowChapters] = useState(false);
  const [fontSize, setFontSize] = useState(() => recall('readerFontSize', 18));

  const loadBook = useCallback(() => {
    return api
      .get(`/books/${id}`)
      .then((res) => setBook(res.data))
      .catch((err) => setError(errorMessage(err)));
  }, [id]);

  const loadChapter = useCallback(() => {
    setPage(null);
    return api
      .get(`/books/${id}/chapters/${number}`)
      .then((res) => {
        setPage(res.data);
        // Reading tracker: remember this chapter (progress, "continue reading" and the streak).
        api
          .post('/library/progress', { bookId: id, chapter: number })
          .then(({ data }) => {
            if (data.purchase) setBook((b) => (b ? { ...b, purchase: data.purchase } : b));
            // First chapter of the day: cheer the streak on.
            if (streakBefore.current !== null && data.streak > streakBefore.current) {
              say(data.streak === 1 ? 'First chapter today! Your 🔥 streak has started.' : `🔥 ${data.streak} days in a row! Hoo-hoo, keep it up!`, 'happy');
            }
            streakBefore.current = data.streak;
            refreshStats();
          })
          .catch(() => {});
      })
      .catch((err) => {
        // A locked chapter comes back as an error, but with useful info.
        if (err.response?.data?.locked) setPage(err.response.data);
        else setError(errorMessage(err));
      });
  }, [id, number, refreshStats, say]);

  useEffect(() => {
    loadBook();
  }, [loadBook]);

  useEffect(() => {
    setError('');
    setShowChapters(false);
    window.scrollTo(0, 0);
    loadChapter();
  }, [loadChapter]);

  function changeFont(step) {
    const index = Math.min(FONT_SIZES.length - 1, Math.max(0, FONT_SIZES.indexOf(fontSize) + step));
    setFontSize(FONT_SIZES[index]);
    remember('readerFontSize', FONT_SIZES[index]);
  }

  async function markFinished() {
    try {
      const { data } = await api.put(`/library/${book.purchase._id}`, { status: 'Finished' });
      setBook((b) => ({ ...b, purchase: data }));
      setMessage('Marked as Finished. Well done! 🎉');
      say(`You finished ${book.title}! That deserves a stamp. 📕`, 'wow');
      refreshStats();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function handleBought(msg) {
    setMessage(msg);
    await loadBook();
    await loadChapter();
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="alert alert-error">{error}</div>
        <Link className="btn btn-secondary" to={`/books/${id}`}>Back to the book</Link>
      </div>
    );
  }
  if (!book) return <Loader text="Opening book..." />;

  const total = book.chapters.length;
  const isLast = number === total;

  return (
    <div className="reader">
      <aside className={`reader-sidebar ${showChapters ? 'open' : ''}`}>
        <Link to={`/books/${id}`} className="back-link">← {book.title}</Link>
        <ol className="reader-toc">
          {book.chapters.map((ch) => (
            <li key={ch.number}>
              <Link
                to={`/read/${id}/${ch.number}`}
                className={`${ch.number === number ? 'current' : ''} ${ch.locked ? 'locked' : ''}`}
              >
                <span>{ch.title}</span>
                {ch.locked && <span aria-label="locked">🔒</span>}
              </Link>
            </li>
          ))}
        </ol>
      </aside>

      <article className="reader-main">
        <div className="reader-toolbar">
          <button className="btn btn-secondary btn-small reader-toc-toggle" onClick={() => setShowChapters(!showChapters)}>
            {showChapters ? 'Hide chapters' : '☰ Chapters'}
          </button>
          <span className="muted small">Chapter {number} of {total}</span>
          {book.purchase && (
            <div className="reader-progress">
              <ProgressBar read={book.purchase.chaptersRead?.length || 0} total={total} label={false} />
            </div>
          )}
          <div className="btn-row">
            <button className="btn btn-secondary btn-small" onClick={() => changeFont(-1)} aria-label="Smaller text">A−</button>
            <button className="btn btn-secondary btn-small" onClick={() => changeFont(1)} aria-label="Bigger text">A+</button>
          </div>
        </div>

        {message && <div className="alert alert-success">{message}</div>}

        {!page ? (
          <Loader text="Loading chapter..." />
        ) : page.locked ? (
          <div className="locked-panel card">
            <div className="wax-seal" aria-hidden="true"><span>BV</span></div>
            <h2>{page.title}</h2>
            <p>This chapter is locked. Buy <strong>{book.title}</strong> with a voucher code to unlock all {total} chapters.</p>
            <BuyBox bookId={book._id} onBought={handleBought} />
          </div>
        ) : (
          <div className="reader-page page-turn" key={number}>
            <span className="reader-kicker">Chapter {number}</span>
            <h1 className="reader-title">{page.title}</h1>
            <div className="ornament" aria-hidden="true">❦</div>
            <div className="reader-text" style={{ fontSize }}>
              {page.content.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            {number === total && <div className="ornament reader-end" aria-hidden="true">~ The End ~</div>}
          </div>
        )}

        <nav className="reader-nav">
          <button className="btn btn-secondary" disabled={number <= 1} onClick={() => navigate(`/read/${id}/${number - 1}`)}>
            ← Previous
          </button>
          {isLast && book.owned && book.purchase?.status !== 'Finished' ? (
            <button className="btn btn-primary" onClick={markFinished}>✓ Mark as Finished</button>
          ) : (
            <button className="btn btn-primary" disabled={isLast} onClick={() => navigate(`/read/${id}/${number + 1}`)}>
              Next →
            </button>
          )}
        </nav>
      </article>
    </div>
  );
}
