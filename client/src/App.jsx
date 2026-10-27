import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import AdminLayout from './components/admin/AdminLayout';
import AdminBooks from './components/admin/AdminBooks';
import AdminVouchers from './components/admin/AdminVouchers';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import StorePage from './pages/StorePage';
import BookDetailsPage from './pages/BookDetailsPage';
import ReaderPage from './pages/ReaderPage';
import LibraryPage from './pages/LibraryPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      {/* Two separate login pages: readers and admins */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Reader area: needs a reader login */}
      <Route element={<ProtectedRoute role="user" />}>
        <Route element={<Layout />}>
          <Route path="/" element={<StorePage />} />
          <Route path="/books/:id" element={<BookDetailsPage />} />
          <Route path="/read/:id/:chapter" element={<ReaderPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>

      {/* Admin area: needs an admin login. Admins only manage, they don't shop. */}
      <Route path="/admin" element={<ProtectedRoute role="admin" />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="books" element={<AdminBooks />} />
          <Route path="vouchers" element={<AdminVouchers />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
