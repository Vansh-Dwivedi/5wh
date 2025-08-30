const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      mediaSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
}));
app.use(compression());
app.use(morgan('combined'));

// Rate limiting (only apply to API routes, not static files)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  skip: (req) => {
    // Skip rate limiting for all static files (uploads, public assets)
    return req.path.startsWith('/uploads/') || 
           req.path.startsWith('/test-images/') ||
           req.path.includes('.') && !req.path.startsWith('/api/');
  }
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001'
    ];
    
    if (process.env.NODE_ENV === 'production') {
      // Add your production domain here
      allowedOrigins.push('your-domain.com', 'www.your-domain.com');
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files with proper MIME types for audio
app.use('/uploads', (req, res, next) => {
  // Set proper MIME types for audio files
  const ext = req.path.toLowerCase().split('.').pop();
  if (ext === 'mp3') {
    res.set('Content-Type', 'audio/mpeg');
  } else if (ext === 'wav') {
    res.set('Content-Type', 'audio/wav');
  } else if (ext === 'ogg') {
    res.set('Content-Type', 'audio/ogg');
  } else if (ext === 'm4a') {
    res.set('Content-Type', 'audio/mp4');
  }
  
  // Prevent download, force inline playback
  res.set('Content-Disposition', 'inline');
  
  // Add CORS headers for audio files
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Range');
  res.set('Accept-Ranges', 'bytes');
  
  next();
}, express.static(path.join(__dirname, 'uploads')));

app.use('/test-images', express.static(path.join(__dirname, 'test-images')));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/5wh-news')
.then(() => {
  console.log('Connected to MongoDB');
  
  // Start enhanced news scheduler (RSS + Web Scraping) after successful database connection
  const { startNewsScheduler } = require('./services/rssService');
  startNewsScheduler();
})
.catch((err) => {
  console.log('MongoDB connection error:', err.message);
  console.log('Note: Please ensure MongoDB is running on your system');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/news', require('./routes/news'));
app.use('/api/podcasts', require('./routes/podcasts'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/fetch', require('./routes/newsFetch')); // New news fetching routes
app.use('/api/advertisers', require('./routes/advertisers'));
app.use('/api/live', require('./routes/live')); // Live streams routes

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});