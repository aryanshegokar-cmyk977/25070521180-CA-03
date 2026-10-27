import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import PaperHills from './art/PaperHills';
import AmbientLayer from './art/AmbientLayer';
import Quill from './quill/Quill';
import { StatsProvider } from '../context/StatsContext';
import { QuillProvider } from '../context/QuillContext';

// The frame around every reader page: floating leaves/stars behind, navbar on top,
// page in the middle, paper hills at the bottom, and Quill the owl in the corner.
export default function Layout() {
  const { pathname } = useLocation();
  // Each new page turns in like a book page. Moving between chapters of the same book
  // is left to the Reader's own page turn, so the book isn't reloaded.
  const pageKey = pathname.replace(/^(\/read\/[^/]+)\/.*$/, '$1');

  return (
    <StatsProvider>
      <QuillProvider>
        <AmbientLayer faint={pathname.startsWith('/read/')} />
        <Navbar />
        <main className="container">
          <div key={pageKey} className="route-turn">
            <Outlet />
          </div>
        </main>
        <footer className="footer">
          <PaperHills />
          <p>BookVerse · Classic books from Project Gutenberg</p>
        </footer>
        <Quill />
      </QuillProvider>
    </StatsProvider>
  );
}
