import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  verify: () => api.get('/auth/verify'),
};

export const analyzeAPI = {
  analyzeText: (text) =>
    api.post('/analyze/text', { text }),
  getHistory: (limit = 10) =>
    api.get(`/analyze/history?limit=${limit}`),
  getTrend: (days = 30) =>
    api.get(`/analyze/trend?days=${days}`),
  getReport: (reportId) =>
    api.get(`/analyze/report/${reportId}`),
};

export const adminAPI = {
  getAnalytics: () =>
    api.get('/admin/analytics'),
  getAllUsers: () =>
    api.get('/admin/users'),
  getSystemHealth: () =>
    api.get('/admin/system-health'),
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const isAdmin = () => {
  const user = localStorage.getItem('user');
  if (!user) return false;
  try {
    return JSON.parse(user).role === 'admin';
  } catch {
    return false;
  }
};

export default api;
