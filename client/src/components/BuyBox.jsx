import { useState } from 'react';
import api, { errorMessage } from '../api';
import { useAuth } from '../context/AuthContext';

// "Buy Now" with a voucher code. Calls onBought() after a successful purchase.
export default function BuyBox({ bookId, onBought }) {
  const { refreshUser } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleBuy(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/library/buy', { bookId, code });
      refreshUser().catch(() => {}); // updates "books owned" on the Profile page
      onBought?.(data.message);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="buy-box" onSubmit={handleBuy}>
      <label htmlFor={`voucher-${bookId}`}>Have a voucher code? Use it to buy this book.</label>
      <div className="buy-box-row">
        <input
          id={`voucher-${bookId}`}
          placeholder="e.g. WELCOME50"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          autoComplete="off"
          required
        />
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Checking...' : 'Buy Now'}
        </button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
    </form>
  );
}
