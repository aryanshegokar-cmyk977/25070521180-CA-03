import axios from 'axios';

// One shared helper for talking to the server.
const api = axios.create({ baseURL: '/api' });

// Attach the login token to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the server says our login is no longer valid, log out and go to the right Login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginAttempt = error.config?.url?.includes('/login');
    if (error.response?.status === 401 && !isLoginAttempt && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      window.location.href = window.location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
    }
    return Promise.reject(error);
  }
);

// Turns any error into a friendly sentence to show on screen.
export function errorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.request && !error.response) return 'Cannot reach the server. Is it running?';
  return error.message || 'Something went wrong';
}

export default api;
