import axios from 'axios';

// In production on Vercel, the API is served from the same domain (/api).
// In local dev, Vite's proxy handles /api → localhost:5000.
// If you ever deploy the API on a separate domain, set VITE_API_URL in .env.
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    // If 401/403, optionally clear stale tokens
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
