import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../../api';
import BookCover from '../../components/BookCover';
import Loader from '../../components/Loader';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/stats')
      .then((res) => setStats(res.data))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!stats) return <Loader text="Loading dashboard..." />;

  const cards = [
    { label: 'Readers', value: stats.users, link: '/admin/users', icon: '👥' },
    { label: 'Books', value: stats.books, link: '/admin/books', icon: '📚' },
    { label: 'Books sold', value: stats.booksSold, icon: '🛒' },
    { label: 'Voucher uses', value: stats.voucherUses, link: '/admin/vouchers', icon: '🎟️' },
    { label: 'Reviews', value: stats.reviews, icon: '⭐' },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">An overview of the BookVerse store.</p>
        </div>
      </div>

      <div className="stat-grid">
        {cards.map((c) => {
          const body = (
            <>
              <span className="stat-icon">{c.icon}</span>
              <strong>{c.value}</strong>
              <span>{c.label}</span>
            </>
          );
          return c.link ? (
            <Link key={c.label} to={c.link} className="stat-card card">{body}</Link>
          ) : (
            <div key={c.label} className="stat-card card">{body}</div>
          );
        })}
      </div>

      <section className="card">
        <h2>Recent purchases</h2>
        {stats.recentPurchases.length === 0 ? (
          <p className="muted">No books bought yet.</p>
        ) : (
          <ul className="recent-list">
            {stats.recentPurchases.map((p) => (
              <li key={p._id}>
                <BookCover book={{ ...p.book, author: '' }} size="small" />
                <div>
                  <strong>{p.user.name}</strong> bought <strong>{p.book.title}</strong>
                  <div className="muted small">
                    {new Date(p.createdAt).toLocaleString()} · code <code>{p.voucherCode}</code>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
