import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import PaperHills from './art/PaperHills';
import { StatsProvider } from '../context/StatsContext';

// The frame around every reader page: navbar on top, page in the middle, paper hills at the bottom.
export default function Layout() {
  return (
    <StatsProvider>
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
