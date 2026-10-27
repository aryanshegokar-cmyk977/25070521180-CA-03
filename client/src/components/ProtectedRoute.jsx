import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

// The login guard: nobody sees the app until they log in.
// role="user"  -> the reader area (Store, Library...). Admins are sent to their dashboard.
// role="admin" -> the admin area. Readers are sent back to the Store.
export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader text="Checking your login..." />;
  if (!user) {
    const loginPage = role === 'admin' ? '/admin/login' : '/login';
    return <Navigate to={loginPage} replace state={{ from: location }} />;
  }
  if (user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  return <Outlet />;
}
