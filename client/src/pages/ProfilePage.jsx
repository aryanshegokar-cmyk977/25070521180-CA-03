import { useState } from 'react';
import api, { errorMessage } from '../api';
import { useAuth } from '../context/AuthContext';
import { useStats } from '../context/StatsContext';

export default function ProfilePage() {
  const { user, ownedCount, setUser } = useAuth();
  const { stats } = useStats();

  const [name, setName] = useState(user.name);
  const [nameMsg, setNameMsg] = useState(null);

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [passMsg, setPassMsg] = useState(null);

  async function saveName(e) {
    e.preventDefault();
    try {
      const { data } = await api.put('/auth/me', { name });
      setUser(data.user);
      setNameMsg({ type: 'success', text: 'Name updated' });
    } catch (err) {
      setNameMsg({ type: 'error', text: errorMessage(err) });
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      return setPassMsg({ type: 'error', text: 'The new passwords do not match' });
    }
    try {
      await api.put('/auth/me/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
      setPassMsg({ type: 'success', text: 'Password changed' });
    } catch (err) {
      setPassMsg({ type: 'error', text: errorMessage(err) });
    }
  }

  const updatePass = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  return (
    <>
      <section className="profile-header card">
        <div className="avatar avatar-large">{user.name[0].toUpperCase()}</div>
        <div>
          <h1>{user.name}</h1>
          <p className="muted">{user.email}</p>
          {user.role === 'admin' && <span className="badge">Admin</span>}
        </div>
        <div className="profile-stats">
          <div>
            <strong>{ownedCount}</strong>
            <span>Books owned</span>
          </div>
          <div>
            <strong>{new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</strong>
            <span>Member since</span>
          </div>
        </div>
      </section>

      {stats && (
        <section className="library-card card">
          <div className="library-card-head">
            <h2>Reader's Library Card</h2>
            <span className="library-card-no">No. {user.id.slice(-6).toUpperCase()}</span>
          </div>
          <div className="tracker-stats">
            <div><strong>{stats.chaptersRead}</strong><span>Chapters read</span></div>
            <div><strong>{stats.finished}</strong><span>Books finished</span></div>
            <div><strong>🔥 {stats.streak}</strong><span>Day streak</span></div>
            <div><strong>{stats.bestStreak}</strong><span>Best streak</span></div>
          </div>
          <h3>Stamps</h3>
          <ul className="stamps">
            {stats.stamps.map((stamp, i) => (
              <li
                key={stamp.id}
                className={`stamp ${stamp.earned ? 'earned' : ''}`}
                style={{ '--tilt': `${(i % 3) * 5 - 5}deg` }}
                title={stamp.earned ? `Earned: ${stamp.hint}` : `Locked: ${stamp.hint}`}
              >
                <span className="stamp-icon" aria-hidden="true">{stamp.icon}</span>
                <strong>{stamp.name}</strong>
                <span className="small">{stamp.hint}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="profile-forms">
        <form className="card form" onSubmit={saveName}>
          <h2>Change name</h2>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          {nameMsg && <div className={`alert alert-${nameMsg.type}`}>{nameMsg.text}</div>}
          <button className="btn btn-primary">Save name</button>
        </form>

        <form className="card form" onSubmit={savePassword}>
          <h2>Change password</h2>
          <label>
            Current password
            <input name="currentPassword" type="password" value={passwords.currentPassword} onChange={updatePass} required autoComplete="current-password" />
          </label>
          <label>
            New password
            <input name="newPassword" type="password" value={passwords.newPassword} onChange={updatePass} required minLength={6} autoComplete="new-password" />
          </label>
          <label>
            Confirm new password
            <input name="confirm" type="password" value={passwords.confirm} onChange={updatePass} required minLength={6} autoComplete="new-password" />
          </label>
          {passMsg && <div className={`alert alert-${passMsg.type}`}>{passMsg.text}</div>}
          <button className="btn btn-primary">Change password</button>
        </form>
      </div>
    </>
  );
}
