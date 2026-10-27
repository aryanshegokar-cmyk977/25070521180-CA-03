import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import PaperHills from './art/PaperHills';
import AmbientLayer from './art/AmbientLayer';
import { StatsProvider } from '../context/StatsContext';

// The frame around every reader page: floating leaves/stars behind, navbar on top,
// page in the middle, paper hills at the bottom.
export default function Layout() {
  const { pathname } = useLocation();

  return (
    <StatsProvider>
      <AmbientLayer faint={pathname.startsWith('/read/')} />
      <Navbar />
      <main className="container">
        <Outlet />
      </main>
      <footer className="footer">
        <PaperHills />
        <p>BookVerse · Classic books from Project Gutenberg</p>
      </footer>
    </StatsProvider>
  );
}
