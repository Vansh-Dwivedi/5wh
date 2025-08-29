import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const MEDIA_BASE_URL = process.env.REACT_APP_MEDIA_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (formData) => api.put('/auth/profile', formData),
  changePassword: (passwords) => api.put('/auth/change-password', passwords),
};

// News API
export const newsAPI = {
  getAll: (params) => api.get('/news', { params }),
  getById: (id) => api.get(`/news/admin/${id}`),
  getBySlug: (slug) => api.get(`/news/${slug}`),
  getAdmin: (params) => api.get('/news/admin', { params }),
  create: (formData) => {
    const config = {};
    if (formData instanceof FormData) {
      config.headers = {
        'Content-Type': undefined, // Let browser set multipart/form-data with boundary
      };
    }
    return api.post('/news', formData, config);
  },
  update: (id, formData) => {
    const config = {};
    if (formData instanceof FormData) {
      config.headers = {
        'Content-Type': undefined,
      };
    }
    return api.put(`/news/${id}`, formData, config);
  },
  delete: (id) => api.delete(`/news/${id}`),
};

// Podcasts API
export const podcastsAPI = {
  getAll: (params) => api.get('/podcasts', { params }),
  getBySlug: (slug) => api.get(`/podcasts/${slug}`),
  getAdmin: (params) => api.get('/podcasts/admin', { params }),
  create: (formData) => {
    // For FormData uploads, let the browser set the Content-Type with boundary
    const config = {};
    if (formData instanceof FormData) {
      config.headers = {
        'Content-Type': undefined, // Let browser set multipart/form-data with boundary
      };
    }
    return api.post('/podcasts', formData, config);
  },
  update: (id, formData) => {
    const config = {};
    if (formData instanceof FormData) {
      config.headers = {
        'Content-Type': undefined,
      };
    }
    return api.put(`/podcasts/${id}`, formData, config);
  },
  delete: (id) => api.delete(`/podcasts/${id}`),
};

// Videos API
export const videosAPI = {
  getAll: (params) => api.get('/videos', { params }),
  getById: (id) => api.get(`/videos/admin/${id}`),
  getBySlug: (slug) => api.get(`/videos/${slug}`),
  getAdmin: (params) => api.get('/videos/admin', { params }),
  create: (formData, config = {}) => {
    const requestConfig = { ...config };
    if (formData instanceof FormData) {
      requestConfig.headers = {
        'Content-Type': undefined,
        ...requestConfig.headers
      };
    }
    return api.post('/videos', formData, requestConfig);
  },
  update: (id, formData, config = {}) => {
    const requestConfig = { ...config };
    if (formData instanceof FormData) {
      requestConfig.headers = {
        'Content-Type': undefined,
        ...requestConfig.headers
      };
    }
    return api.put(`/videos/${id}`, formData, requestConfig);
  },
  delete: (id) => api.delete(`/videos/${id}`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getNews: (params) => api.get('/news/admin', { params }),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  updateUserStatus: (id, isActive) => api.put(`/admin/users/${id}/status`, { isActive }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  fetchNews: () => api.post('/admin/news/fetch'),
};

export default api;
