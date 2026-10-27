import { useState } from 'react';
import AdminBooks from '../components/admin/AdminBooks';
import AdminVouchers from '../components/admin/AdminVouchers';

export default function AdminPage() {
  const [tab, setTab] = useState('books');

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Admin Panel</h1>
          <p className="muted">Create, edit and delete books and voucher codes.</p>
        </div>
      </div>

      <div className="tabs admin-tabs">
        <button className={tab === 'books' ? 'active' : ''} onClick={() => setTab('books')}>📚 Books</button>
        <button className={tab === 'vouchers' ? 'active' : ''} onClick={() => setTab('vouchers')}>🎟️ Vouchers</button>
      </div>

      {tab === 'books' ? <AdminBooks /> : <AdminVouchers />}
    </>
  );
}
