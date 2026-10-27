import { useEffect, useState } from 'react';
import api, { errorMessage } from '../../api';
import Loader from '../../components/Loader';

export default function UsersPage() {
  const [users, setUsers] = useState(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(null);

  const load = () =>
    api
      .get('/admin/users')
      .then((res) => setUsers(res.data))
      .catch((err) => setMessage({ type: 'error', text: errorMessage(err) }));

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(u) {
    if (!window.confirm(`Delete ${u.name} (${u.email})? Their library and reviews will be deleted too.`)) return;
    try {
      const { data } = await api.delete(`/admin/users/${u._id}`);
      setMessage({ type: 'success', text: data.message });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: errorMessage(err) });
    }
  }

  if (!users) return message ? <div className="alert alert-error">{message.text}</div> : <Loader text="Loading users..." />;

  const term = search.toLowerCase();
  const shown = users.filter((u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p className="muted">{users.length} reader account{users.length === 1 ? '' : 's'}</p>
        </div>
        <input
          type="search"
          className="users-search"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search users"
        />
      </div>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {shown.length === 0 ? (
        <p className="muted">No users found.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Books owned</th>
                <th>Reviews</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((u) => (
                <tr key={u._id}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>{u.ownedCount}</td>
                  <td>{u.reviewCount}</td>
                  <td>
                    <button className="btn btn-danger btn-small" onClick={() => handleDelete(u)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
