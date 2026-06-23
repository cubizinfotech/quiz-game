import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const url = config.url || '';
  // Use admin_token when the API URL targets an admin route OR when the
  // request originates from an admin panel page (e.g. /ads called from /admin/ads)
  const isAdminContext =
    url.startsWith('/admin') ||
    window.location.pathname.startsWith('/admin');
  const token = isAdminContext
    ? localStorage.getItem('admin_token')
    : (localStorage.getItem('user_token') || sessionStorage.getItem('user_token'));
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      if (url.startsWith('/admin')) {
        localStorage.removeItem('admin_token');
        if (
          window.location.pathname.startsWith('/admin') &&
          window.location.pathname !== '/admin/login'
        ) {
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
