// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  // News
  news: '/api/news',
  
  // Life & Culture
  lifecultureBooks: '/api/lifeculture/books',
  lifecultureEvents: '/api/lifeculture/cultural-events',
  
  // Opinions
  opinions: '/api/opinions',
  
  // Videos
  videos: '/api/videos',
  
  // Podcasts
  podcasts: '/api/podcasts',
  
  // Home
  home: '/api/home',
  
  // Mobile App Endpoints
  appNews: '/app/fetch/news',
  appVideos: '/app/fetch/videos',
  appPodcasts: '/app/fetch/podcasts'
};

// Helper function to build full URL
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Export default configuration
export default {
  API_BASE_URL,
  API_ENDPOINTS,
  buildApiUrl
};
