import { useEffect, useState } from 'react';
import api, { errorMessage } from '../../api';
import BookCover from '../BookCover';
import Loader from '../Loader';

const EMPTY_BOOK = {
  title: '',
  author: '',
  year: '',
  genre: 'Classic',
  coverColor: '#4338ca',
  summary: '',
  chapters: [{ title: 'Chapter 1', content: '' }],
};

// Create a new book (bookId = null) or edit an existing one, including its chapters.
export default function BookForm({ bookId, onSaved, onCancel }) {
  const [book, setBook] = useState(bookId ? null : EMPTY_BOOK);
  const [current, setCurrent] = useState(0); // which chapter is open in the editor
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!bookId) return;
    api
      .get(`/books/${bookId}/full`)
      .then((res) => setBook({ ...res.data, year: res.data.year ?? '' }))
      .catch((err) => setError(errorMessage(err)));
  }, [bookId]);

  if (!book) return error ? <div className="alert alert-error">{error}</div> : <Loader text="Loading book..." />;

  const update = (e) => setBook({ ...book, [e.target.name]: e.target.value });

  function updateChapter(field, value) {
    const chapters = book.chapters.map((ch, i) => (i === current ? { ...ch, [field]: value } : ch));
    setBook({ ...book, chapters });
  }

  function addChapter() {
    const chapters = [...book.chapters, { title: `Chapter ${book.chapters.length + 1}`, content: '' }];
    setBook({ ...book, chapters });
    setCurrent(chapters.length - 1);
  }

  function removeChapter() {
    if (book.chapters.length === 1) return setError('A book needs at least one chapter');
    if (!window.confirm(`Delete "${book.chapters[current].title}"?`)) return;
    const chapters = book.chapters.filter((_, i) => i !== current);
    setBook({ ...book, chapters });
    setCurrent(Math.max(0, current - 1));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const emptyIndex = book.chapters.findIndex((ch) => !ch.title.trim() || !ch.content.trim());
    if (emptyIndex !== -1) {
      setCurrent(emptyIndex);
      return setError(`Chapter ${emptyIndex + 1} needs a title and some text`);
    }

    const payload = {
      title: book.title,
      author: book.author,
      year: book.year === '' ? undefined : Number(book.year),
      genre: book.genre,
      coverColor: book.coverColor,
      summary: book.summary,
      chapters: book.chapters.map(({ title, content }) => ({ title, content })),
    };

    setBusy(true);
    try {
      if (bookId) await api.put(`/books/${bookId}`, payload);
      else await api.post('/books', payload);
      onSaved(bookId ? `Saved "${book.title}"` : `Added "${book.title}"`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const chapter = book.chapters[current];

  return (
    <form className="card form admin-form" onSubmit={handleSubmit}>
      <h2>{bookId ? `Edit "${book.title}"` : 'Add a new book'}</h2>

      <div className="book-form-top">
        <div className="book-form-preview">
          <BookCover book={{ ...book, title: book.title || 'Title', author: book.author || 'Author' }} />
        </div>
        <div className="form">
          <div className="form-grid">
            <label>Title<input name="title" value={book.title} onChange={update} required /></label>
            <label>Author<input name="author" value={book.author} onChange={update} required /></label>
            <label>Year<input name="year" type="number" value={book.year} onChange={update} /></label>
            <label>Genre<input name="genre" value={book.genre} onChange={update} /></label>
            <label>Cover colour<input name="coverColor" type="color" value={book.coverColor} onChange={update} /></label>
          </div>
          <label>Summary<textarea name="summary" value={book.summary} onChange={update} rows={3} /></label>
        </div>
      </div>

      <div className="chapter-editor">
        <div className="chapter-editor-head">
          <h3>Chapters ({book.chapters.length})</h3>
          <div className="btn-row">
            <select value={current} onChange={(e) => setCurrent(Number(e.target.value))} aria-label="Choose chapter to edit">
              {book.chapters.map((ch, i) => (
                <option key={i} value={i}>{i + 1}. {ch.title || '(no title)'}</option>
              ))}
            </select>
            <button type="button" className="btn btn-secondary btn-small" onClick={addChapter}>+ Add chapter</button>
            <button type="button" className="btn btn-danger btn-small" onClick={removeChapter}>Delete chapter</button>
          </div>
        </div>
        <p className="muted small">Chapter 1 is the free preview. All other chapters are locked until the book is bought.</p>
        <label>
          Chapter {current + 1} title
          <input value={chapter.title} onChange={(e) => updateChapter('title', e.target.value)} />
        </label>
        <label>
          Chapter {current + 1} text
          <textarea rows={14} value={chapter.content} onChange={(e) => updateChapter('content', e.target.value)} />
        </label>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="btn-row">
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save book'}</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
