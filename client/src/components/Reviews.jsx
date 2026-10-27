import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';

// Review list + a form to write, edit or delete your own review.
// Calls onChange() whenever reviews change, so the average rating can refresh.
export default function Reviews({ bookId, onChange }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const myReview = reviews.find((r) => r.user?._id === user.id);

  async function load() {
    const { data } = await api.get(`/reviews/book/${bookId}`);
    setReviews(data);
  }

  useEffect(() => {
    load().catch((err) => setError(errorMessage(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  function startEdit() {
    setRating(myReview.rating);
    setComment(myReview.comment);
    setEditing(true);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating) return setError('Please pick a star rating');
    setBusy(true);
    setError('');
    try {
      if (myReview) await api.put(`/reviews/${myReview._id}`, { rating, comment });
      else await api.post('/reviews', { bookId, rating, comment });
      await load(); // refresh the list first, so old stars never flash on screen
      setEditing(false);
      setRating(0);
      setComment('');
      onChange?.();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(review) {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${review._id}`);
      setEditing(false);
      await load();
      onChange?.();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const showForm = !myReview || editing;

  return (
    <section className="reviews">
      <h2>Reviews</h2>

      {showForm ? (
        <form className="card form review-form" onSubmit={handleSubmit}>
          <h3>{myReview ? 'Edit your review' : 'Write a review'}</h3>
          <StarRating value={rating} onChange={setRating} size="1.8rem" />
          <textarea
            placeholder="What did you think? (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
          />
          {error && <div className="alert alert-error">{error}</div>}
          <div className="btn-row">
            <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save review'}</button>
            {editing && <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>}
          </div>
        </form>
      ) : (
        error && <div className="alert alert-error">{error}</div>
      )}

      {reviews.length === 0 ? (
        <p className="muted">No reviews yet. Be the first!</p>
      ) : (
        <ul className="review-list">
          {reviews.map((review) => {
            const mine = review.user?._id === user.id;
            return (
              <li key={review._id} className={`review ${mine ? 'review-mine' : ''}`}>
                <div className="review-head">
                  <div className="avatar">{(review.user?.name || '?')[0].toUpperCase()}</div>
                  <div>
                    <strong>{review.user?.name || 'Deleted user'}{mine && ' (you)'}</strong>
                    <div className="review-sub">
                      <StarRating value={review.rating} size="0.9rem" />
                      <span className="muted small">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                {review.comment && <p>{review.comment}</p>}
                {mine && (
                  <div className="btn-row">
                    {!editing && <button className="btn btn-secondary btn-small" onClick={startEdit}>Edit</button>}
                    <button className="btn btn-danger btn-small" onClick={() => handleDelete(review)}>Delete</button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
