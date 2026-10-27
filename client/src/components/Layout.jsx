import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

// The frame around every logged-in page: navbar on top, page below.
export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Outlet />
      </main>
      <footer className="footer">BookVerse · Classic books from Project Gutenberg</footer>
    </>
  );
}
