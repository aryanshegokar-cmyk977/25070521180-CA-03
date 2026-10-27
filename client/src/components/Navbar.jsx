import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // menu open on phones

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          <Logo />
          BookVerse
        </Link>

        <div className="navbar-right">
          <ThemeToggle />
          <button
            className="menu-toggle"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={close}>Store</NavLink>
          <NavLink to="/library" onClick={close}>My Library</NavLink>
          <NavLink to="/profile" onClick={close}>Profile</NavLink>
          <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
        </nav>
      </div>
    </header>
  );
}
