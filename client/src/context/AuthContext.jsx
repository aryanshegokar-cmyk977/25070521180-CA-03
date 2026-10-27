import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api';

// Shares "who is logged in" with every page.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ownedCount, setOwnedCount] = useState(0);
  const [loading, setLoading] = useState(true); // true while we check a saved login

  // Ask the server who we are (used on page load and after changes).
  const refreshUser = useCallback(async () => {
    const { data } = await api.get('/auth/me');
    setUser(data.user);
    setOwnedCount(data.ownedCount);
    return data.user;
  }, []);

  // On first load: if a token was saved, check it is still valid.
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setLoading(false);
      return;
    }
    refreshUser()
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, [refreshUser]);

  async function saveLogin(request) {
    const { data } = await request;
    localStorage.setItem('token', data.token);
    setUser(data.user);
    refreshUser().catch(() => {});
    return data.user;
  }

  const login = (email, password) => saveLogin(api.post('/auth/login', { email, password }));
  const adminLogin = (email, password) => saveLogin(api.post('/auth/admin/login', { email, password }));
  const register = (name, email, password) => saveLogin(api.post('/auth/register', { name, email, password }));

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    setOwnedCount(0);
  }

  const value = { user, ownedCount, loading, login, adminLogin, register, logout, refreshUser, setUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
