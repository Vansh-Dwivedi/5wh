import axios from 'axios';

// Utility to filter out RSS feed source names
export const filterSourceName = (source) => {
  if (!source) return '';
  
  // List of RSS feed sources to filter out
  const rssSourcesFilter = [
    'Google News',
    'Jagbani',
    'BBC News',
    'CNN',
    'Reuters',
    'AP News',
    'Times of India',
    'Hindustan Times',
    'Indian Express',
    'NDTV',
    'Zee News',
    'Aaj Tak',
    'ABP News',
    'News18',
    'India Today',
    'The Hindu',
    'Economic Times',
    'Business Standard',
    'Mint',
    'Dainik Bhaskar',
    'Dainik Jagran',
    'Navbharat Times'
  ];
  
  // Check if the source should be filtered
  const shouldFilter = rssSourcesFilter.some(filterSource => 
    source.toLowerCase().includes(filterSource.toLowerCase()) ||
    filterSource.toLowerCase().includes(source.toLowerCase())
  );
  
  // Return empty string if should be filtered, otherwise return original source
  return shouldFilter ? '' : source;
};

// Function to clean article data by filtering source
export const cleanArticleSource = (article) => {
  if (!article) return article;
  
  return {
    ...article,
    source: filterSourceName(article.source)
  };
};

// Function to clean array of articles
export const cleanArticlesSources = (articles) => {
  if (!Array.isArray(articles)) return articles;
  
  return articles.map(cleanArticleSource);
};

// React component for displaying filtered sources
export const SourceDisplay = ({ source, variant = "caption", color = "text.secondary", prefix = "", children, ...props }) => {
  // Apply source filtering
  const filteredSource = filterSourceName(source);
  
  // Don't render anything if source is filtered out
  if (!filteredSource || filteredSource.trim() === '') {
    return null;
  }
  
  // Return the children with the filtered source, or just text
  if (children) {
    return children(filteredSource);
  }
  
  return filteredSource;
};

const API_BASE_URL = 'https://5whmedia.com:5000/api';
export const MEDIA_BASE_URL = process.env.REACT_APP_MEDIA_URL || 'https://5whmedia.com:5000';

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
      window.location.href = '/login';
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
  getById: (id) => api.get(`/podcasts/admin/${id}`),
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

// Opinions API (new unified client)
export const opinionsAPI = {
  getAdmin: (params) => api.get('/opinions/admin', { params }),
  getById: (id) => api.get(`/opinions/admin/${id}`),
  create: (formData) => {
    const cfg = formData instanceof FormData ? { headers: { 'Content-Type': undefined } } : {};
    return api.post('/opinions', formData, cfg);
  },
  update: (id, formData) => {
    const cfg = formData instanceof FormData ? { headers: { 'Content-Type': undefined } } : {};
    return api.put(`/opinions/${id}`, formData, cfg);
  },
  toggleFeatured: (id) => api.put(`/opinions/${id}/toggle-featured`),
  updateStatus: (id, status) => api.put(`/opinions/${id}/status`, { status }),
  delete: (id) => api.delete(`/opinions/${id}`)
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
  getUpcomingScheduled: (limit=5) => api.get('/admin/scheduled-upcoming', { params: { limit } }),
  getNews: (params) => api.get('/news/admin', { params }),
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  updateUserStatus: (id, isActive) => api.put(`/admin/users/${id}/status`, { isActive }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  fetchNews: () => api.post('/admin/news/fetch'),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
};

// Home aggregated API
export const homeAPI = {
  get: () => api.get('/home')
};

// Advertisers API (new abstraction replacing raw fetches)
export const advertisersAPI = {
  getAdmin: () => api.get('/advertisers/admin'),
  create: (formData) => {
    const cfg = formData instanceof FormData ? { headers: { 'Content-Type': undefined } } : {};
    return api.post('/advertisers', formData, cfg);
  },
  update: (id, formData) => {
    const cfg = formData instanceof FormData ? { headers: { 'Content-Type': undefined } } : {};
    return api.put(`/advertisers/${id}`, formData, cfg);
  },
  delete: (id) => api.delete(`/advertisers/${id}`),
  toggleActive: (id, isActive) => api.put(`/advertisers/${id}`, { isActive })
};

export default api;
