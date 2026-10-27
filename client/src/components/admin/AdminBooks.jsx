import { useEffect, useState } from 'react';
import api, { errorMessage } from '../../api';
import BookCover from '../BookCover';
import BookForm from './BookForm';

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [editing, setEditing] = useState(undefined); // undefined = list, null = new book, id = edit
  const [message, setMessage] = useState(null);

  const load = () =>
    api
      .get('/books')
      .then((res) => setBooks(res.data))
      .catch((err) => setMessage({ type: 'error', text: errorMessage(err) }));

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(book) {
    if (!window.confirm(`Delete "${book.title}"? This also removes it from every library and deletes its reviews.`)) return;
    try {
      const { data } = await api.delete(`/books/${book._id}`);
      setMessage({ type: 'success', text: data.message });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: errorMessage(err) });
    }
  }

  function handleSaved(text) {
    setEditing(undefined);
    setMessage({ type: 'success', text });
    load();
  }

  if (editing !== undefined) {
    return <BookForm bookId={editing} onSaved={handleSaved} onCancel={() => setEditing(undefined)} />;
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Books</h1>
          <p className="muted">{books.length} books in the store</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing(null)}>+ Add book</button>
      </div>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="admin-list">
        {books.map((book) => (
          <div key={book._id} className="admin-row card">
            <BookCover book={book} size="small" />
            <div className="admin-row-info">
              <strong>{book.title}</strong>
              <span className="muted small">{book.author} · {book.genre} · {book.chapterCount} chapters</span>
            </div>
            <div className="btn-row">
              <button className="btn btn-secondary btn-small" onClick={() => setEditing(book._id)}>Edit</button>
              <button className="btn btn-danger btn-small" onClick={() => handleDelete(book)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
