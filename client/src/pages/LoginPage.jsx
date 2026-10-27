import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api';

export default function LoginPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Already logged in? Skip this page.
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function switchMode(newMode) {
    setMode(newMode);
    setError('');
  }

  return (
    <div className="auth-page">
      <section className="auth-hero">
        <h1>BookVerse</h1>
        <p>Your pocket library of timeless classics. Read the first chapter of any book for free, unlock the rest with a voucher, and share what you think.</p>
        <ul>
          <li>📖 Free preview of every book</li>
          <li>🎟️ Unlock books with voucher codes</li>
          <li>⭐ Rate and review your reads</li>
        </ul>
      </section>

      <section className="auth-card card">
        <div className="tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>Log in</button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => switchMode('signup')}>Sign up</button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {mode === 'signup' && (
            <label>
              Name
              <input name="name" value={form.name} onChange={update} required autoComplete="name" />
            </label>
          )}
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={update} required autoComplete="email" />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={update}
              required
              minLength={mode === 'signup' ? 6 : undefined}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>
          {mode === 'signup' && <small className="muted">At least 6 characters.</small>}

          {error && <div className="alert alert-error">{error}</div>}

          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
        <p className="auth-switch">
          Staff member? <Link to="/admin/login">Admin login →</Link>
        </p>
      </section>
    </div>
  );
}
