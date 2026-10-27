import { useRef, useState } from 'react';
import api, { errorMessage } from '../api';
import { useAuth } from '../context/AuthContext';
import { useStats } from '../context/StatsContext';
import { useQuill } from '../context/QuillContext';
import { celebrate } from '../celebrate';

// "Buy Now" with a voucher code. Calls onBought() after a successful purchase.
export default function BuyBox({ bookId, onBought }) {
  const { refreshUser } = useAuth();
  const { refreshStats } = useStats();
  const { say } = useQuill();
  const formRef = useRef(null);
  const [shakes, setShakes] = useState(0); // bumps on every wrong code to replay the shake
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
      refreshStats();
      const box = formRef.current?.getBoundingClientRect();
      if (box) celebrate(box.left + box.width / 2, box.top + box.height / 2);
      say('Hoo-ray! A brand new book for your shelf! 🎉', 'happy');
      onBought?.(data.message);
    } catch (err) {
      setError(errorMessage(err));
      setShakes((n) => n + 1);
      say('Hoo... that code didn\'t work. Check the message under the ticket!', 'sad');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      ref={formRef}
      key={shakes}
      className={`buy-box ticket ${shakes ? 'shake' : ''}`}
      onSubmit={handleBuy}
    >
      <span className="ticket-stub" aria-hidden="true">ADMIT ONE</span>
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
