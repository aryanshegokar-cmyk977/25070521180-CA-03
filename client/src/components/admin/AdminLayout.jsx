import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Logo';
import ThemeToggle from '../ThemeToggle';
import PaperHills from '../art/PaperHills';

// The frame around every admin page: a sidebar (a top bar on phones) + the page,
// laid on "The Librarian's Desk": a sheet of paper on a wooden desk with a brass nameplate.
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Logo size={34} />
          <div>
            <strong>BookVerse</strong>
            <span>Librarian's Desk</span>
          </div>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin" end>📊 Dashboard</NavLink>
          <NavLink to="/admin/books">📚 Books</NavLink>
          <NavLink to="/admin/vouchers">🎟️ Vouchers</NavLink>
          <NavLink to="/admin/users">👥 Users</NavLink>
        </nav>
        <div className="admin-account">
          <span className="admin-name" title={user.email}>{user.name}</span>
          <ThemeToggle />
          <button className="btn btn-small btn-ghost admin-logout" onClick={handleLogout}>Log out</button>
        </div>
        <PaperHills className="admin-sidebar-hills" />
      </aside>
      <main className="admin-content desk">
        <div className="desk-plate" aria-hidden="true">🪶 The Librarian's Desk</div>
        <div className="desk-paper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
