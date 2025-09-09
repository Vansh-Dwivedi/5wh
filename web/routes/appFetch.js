const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { getNews, getLiveStreams, getRadio, getPodcasts, getVideos } = require('../controllers/appFetchController');
const { validateToken, logRequest, cacheMiddleware } = require('../middleware/appFetchMiddleware');

const router = express.Router();

// Add cache control headers to prevent caching issues
router.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });
  next();
});

// CORS config for React Native and mobile devices
router.use(cors({
  origin: [
    /^exp:\/\//,
    'http://localhost',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:8081',
    'http://127.0.0.1:8081',
    'http://localhost:19000',
    'http://localhost:19006',
    'http://10.0.2.2:5000',      // Android emulator accessing host
    'http://192.168.29.147:5000', // Physical device on same network
    'https://5whmedia.com',
    /^https:\/\/.*/,
    /^http:\/\/localhost:\d+$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting per IP/token
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP/token to 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ error: 'Too many requests', code: 429 })
});
router.use(limiter);

// Log all requests
router.use(logRequest);

// Auth middleware
router.use(validateToken);

// News endpoint with pagination, filtering, search, cache
router.get('/news', cacheMiddleware, getNews);

// Live streams endpoint (real-time)
router.get('/liveStreams', cacheMiddleware, getLiveStreams);

// Radio endpoint
router.get('/radio', cacheMiddleware, getRadio);

// Podcasts endpoint with pagination
router.get('/podcasts', cacheMiddleware, getPodcasts);

// Videos endpoint with pagination
router.get('/videos', cacheMiddleware, getVideos);

module.exports = router;
