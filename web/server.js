const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
require('dotenv').config();
const config = require('./config/config');

const app = express();
app.set('trust proxy', 1); // Tip: needed if behind reverse proxy / load balancer

// Mongoose global settings to improve DX and fail fast when DB is down
mongoose.set('strictQuery', true);
// Disable buffering so route handlers fail immediately instead of timing out after 10s
mongoose.set('bufferCommands', false);

// Lightweight request id (improves log traceability without external deps)
app.use((req, res, next) => {
  req.id = Date.now().toString(36) + Math.random().toString(36).slice(2,8);
  res.setHeader('X-Request-Id', req.id);
  next();
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "http:", "https:", "data:", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'", "http:", "https:"],
      scriptSrc: ["'self'", "http:", "https:"],
      imgSrc: ["'self'", "http:", "https:", "data:"],
      mediaSrc: ["'self'", "http:", "https:", "data:"],
      connectSrc: ["'self'", "http:", "https:"],
      fontSrc: ["'self'", "http:", "https:", "data:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      // Remove upgradeInsecureRequests since you want to allow HTTP
    },
  },
}));

app.use(compression());
// Structured logging with request id
app.use(morgan(':method :url :status :res[content-length] - :response-time ms reqId=:req[id]', {
  stream: { write: msg => process.stdout.write(msg) }
}));

if (config.rateLimit.enabled) {
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => (
      req.path.startsWith('/uploads/') ||
      req.path.startsWith('/test-images/') ||
      (req.path.includes('.') && !req.path.startsWith('/api/'))
    )
  });
  app.use(limiter);
}

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://5whmedia.com',
      'http://5whmedia.com',
      'http://5whmedia.com',
      'http://www.5whmedia.com',
      'https://www.5whmedia.com',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://localhost:8081',    // React Native Metro bundler
      'http://127.0.0.1:8081',
      'http://localhost:19000',   // Expo Go
      'http://localhost:19006',   // Expo web
      'http://10.0.2.2:8081',     // Android emulator
      'http://192.168.29.147:8081', // Physical device on same network
    ];
    
  if (config.isProd) {
      // Add your production domain here
      allowedOrigins.push('your-domain.com', 'www.your-domain.com');
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS: Allowing origin:', origin); // Debug logging
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Additional CORS headers for React Native compatibility
app.use((req, res, next) => {
  // Ensure React Native requests are handled properly
  if (req.headers.origin === 'http://localhost:8081' || 
      req.headers.origin === 'http://127.0.0.1:8081') {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

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

// MongoDB connection with fail-fast options and retry
const connectWithRetry = async (attempt = 1) => {
  const maxAttempts = 10;
  const delayMs = 3000;
  try {
    console.log(`Connecting to MongoDB (attempt ${attempt}) ...`);
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000, // fail fast if server selection fails
      socketTimeoutMS: 20000, // allow in-flight operations some time
      connectTimeoutMS: 10000,
      family: 4,
    });
    console.log('Connected to MongoDB');

    // Start enhanced news scheduler (RSS + Web Scraping) after successful database connection
    const { startNewsScheduler } = require('./services/rssService');
    startNewsScheduler();
    // Start content publish scheduler (scheduled -> published)
    const { startScheduler } = require('./services/schedulerService');
    startScheduler();

    // Start the HTTP server only after successful DB connection
    startHttpServer();
  } catch (err) {
    console.log('MongoDB connection error:', err.message);
    if (attempt < maxAttempts) {
      console.log(`Retrying MongoDB connection in ${Math.round(delayMs/1000)}s ...`);
      setTimeout(() => connectWithRetry(attempt + 1), delayMs);
    } else {
      console.error('Exceeded maximum MongoDB connection attempts. Exiting.');
      process.exit(1);
    }
  }
};

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err.message);
});
mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose disconnected');
});
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected');
});

// Health / readiness probe (Tip: used by container orchestrators & uptime monitors)
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now(), env: config.env });
});

// DB health endpoint for quick diagnostics
app.get('/health/db', (req, res) => {
  const state = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    mongodbUri: config.mongodbUri,
    readyState: state,
    stateText: states[state] || 'unknown'
  });
});

// Routes

// Existing API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/news', require('./routes/news'));
app.use('/api/podcasts', require('./routes/podcasts'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/opinions', require('./routes/opinions')); // Opinion routes
app.use('/api/lifeculture', require('./routes/lifeculture.clean')); // Life & Culture routes
app.use('/api/blogs', require('./routes/blogs')); // Unified blog posts (tabs)
app.use('/api/home', require('./routes/home')); // Aggregated homepage content
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/fetch', require('./routes/newsFetch')); // New news fetching routes
app.use('/api/advertisers', require('./routes/advertisers'));
app.use('/api/live', require('./routes/live')); // Live streams routes
app.use('/api/newsletter', require('./routes/newsletter')); // Newsletter subscription routes
app.use('/api/app', require('./routes/appFetch')); // App-specific routes (radio, etc.)

console.log('📱 Loading push notifications routes...');
app.use('/api/notifications', require('./routes/notifications')); // Push notifications routes
console.log('✅ Push notifications routes loaded successfully');

// 5WH Media App Fetch API (for mobile app)
app.use('/app/fetch', require('./routes/appFetch'));

// Serve React app in production and development
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  // Handle React routing - must be last route
  app.get(/^(?!\/api|\/app).*$/, (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client/build/index.html'));
  });
} else {
  // Development mode - serve React build if available
  const buildPath = path.join(__dirname, 'client/build');
  const indexPath = path.join(buildPath, 'index.html');
  
  if (require('fs').existsSync(indexPath)) {
    app.use(express.static(buildPath));
    
    // Handle React routing for development - excluding API routes
    app.get(/^(?!\/api|\/app).*$/, (req, res) => {
      res.sendFile(path.resolve(buildPath, 'index.html'));
    });
  } else {
    // If no build exists, show API information page
    app.get('/', (req, res) => {
      res.json({
        message: '5WH Media API Server',
        version: '1.0.0',
        status: 'running',
        endpoints: {
          news: '/api/news',
          opinions: '/api/opinions',
          lifeculture: {
            books: '/api/lifeculture/books',
            events: '/api/lifeculture/cultural-events'
          },
          videos: '/api/videos',
          podcasts: '/api/podcasts',
          mobile: {
            news: '/app/fetch/news',
            videos: '/app/fetch/videos',
            podcasts: '/app/fetch/podcasts'
          }
        }
      });
    });
  }
}

// Centralized error handler with trace id (after all routes & middlewares)
app.use((err, req, res, next) => {
  console.error(`[ERROR][reqId=${req.id}]`, err.stack || err);
  res.status(err.status || 500).json({
    message: err.publicMessage || 'Something went wrong',
    requestId: req.id,
    ...(config.env === 'development' ? { detail: err.message } : {})
  });
});

const startHttpServer = () => {
  const PORT = config.port;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Mobile API available at: http://localhost:${PORT}/app/fetch/news`);
    console.log(`Web API available at: http://localhost:${PORT}/api/news`);
  });
};

// Kick off DB connection (and then boot the server on success)
connectWithRetry();