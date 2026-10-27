import { useEffect, useState } from 'react';
import api, { errorMessage } from '../../api';

const EMPTY = { code: '', description: '', maxUses: 1, expiresAt: '' };

// Date from the server -> "YYYY-MM-DD" for the date box.
function toDateInput(value) {
  if (!value) return '';
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);

  const load = () =>
    api
      .get('/vouchers')
      .then((res) => setVouchers(res.data))
      .catch((err) => setMessage({ type: 'error', text: errorMessage(err) }));

  useEffect(() => {
    load();
  }, []);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function startEdit(v) {
    setEditingId(v._id);
    setForm({ code: v.code, description: v.description, maxUses: v.maxUses, expiresAt: toDateInput(v.expiresAt) });
    setMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      maxUses: Number(form.maxUses),
      // The code works until the end of the chosen day.
      expiresAt: form.expiresAt ? new Date(`${form.expiresAt}T23:59:59`).toISOString() : null,
    };
    try {
      if (editingId) await api.put(`/vouchers/${editingId}`, payload);
      else await api.post('/vouchers', payload);
      setMessage({ type: 'success', text: `Voucher ${payload.code.toUpperCase()} saved` });
      cancelEdit();
      load();
    } catch (err) {
      setMessage({ type: 'error', text: errorMessage(err) });
    }
  }

  async function handleDelete(v) {
    if (!window.confirm(`Delete voucher ${v.code}?`)) return;
    try {
      const { data } = await api.delete(`/vouchers/${v._id}`);
      setMessage({ type: 'success', text: data.message });
      if (editingId === v._id) cancelEdit();
      load();
    } catch (err) {
      setMessage({ type: 'error', text: errorMessage(err) });
    }
  }

  const badgeClass = { Active: 'badge-success', Expired: 'badge-danger', 'Used up': 'badge-muted' };

  return (
    <section>
      <form className="card form admin-form" onSubmit={handleSubmit}>
        <h2>{editingId ? `Edit voucher ${form.code}` : 'Create a voucher'}</h2>
        <div className="form-grid">
          <label>
            Code
            <input name="code" value={form.code} onChange={update} required placeholder="e.g. SUMMER25" style={{ textTransform: 'uppercase' }} />
          </label>
          <label>
            Max uses
            <input name="maxUses" type="number" min="1" value={form.maxUses} onChange={update} required />
          </label>
          <label>
            Expires on (leave empty for never)
            <input name="expiresAt" type="date" value={form.expiresAt} onChange={update} />
          </label>
        </div>
        <label>
          Description
          <input name="description" value={form.description} onChange={update} placeholder="Optional note" />
        </label>
        <div className="btn-row">
          <button className="btn btn-primary">{editingId ? 'Save changes' : 'Create voucher'}</button>
          {editingId && <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>}
        </div>
      </form>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <h2 className="section-title">Vouchers ({vouchers.length})</h2>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Status</th>
              <th>Used</th>
              <th>Expires</th>
              <th>Description</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((v) => (
              <tr key={v._id}>
                <td><code>{v.code}</code></td>
                <td><span className={`badge ${badgeClass[v.status]}`}>{v.status}</span></td>
                <td>{v.usedCount} / {v.maxUses}</td>
                <td>{v.expiresAt ? new Date(v.expiresAt).toLocaleDateString() : 'Never'}</td>
                <td className="muted">{v.description}</td>
                <td>
                  <div className="btn-row nowrap">
                    <button className="btn btn-secondary btn-small" onClick={() => startEdit(v)}>Edit</button>
                    <button className="btn btn-danger btn-small" onClick={() => handleDelete(v)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
