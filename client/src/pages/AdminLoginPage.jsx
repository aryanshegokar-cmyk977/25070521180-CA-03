import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api';
import PaperScene from '../components/art/PaperScene';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';

// Separate login page for staff. No sign-up here: admin accounts come from the seed script.
export default function AdminLoginPage() {
  const { user, adminLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await adminLogin(form.email, form.password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-auth-page sky">
      <PaperScene className="auth-scene scene-muted" />
      <ThemeToggle className="auth-theme-toggle" />
      <section className="admin-auth-card card">
        <div className="admin-auth-brand">
          <Logo size={40} />
          <div>
            <strong>BookVerse</strong>
            <span>Admin Console</span>
          </div>
        </div>
        <h1>Staff sign in</h1>
        <p className="admin-auth-sub">Manage books, voucher codes and readers.</p>

        <form onSubmit={handleSubmit} className="form">
          <label>
            Admin email
            <input name="email" type="email" value={form.email} onChange={update} required autoComplete="username" />
          </label>
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={update} required autoComplete="current-password" />
          </label>
          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Signing in...' : 'Sign in to Admin'}
          </button>
        </form>

        <p className="auth-switch">
          <Link to="/login">← Reader login</Link>
        </p>
      </section>
    </div>
  );
}
