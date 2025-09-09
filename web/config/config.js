// Centralized configuration with sane defaults and environment variable parsing
// Tip: Keep all runtime configuration in one place for clarity & testability.
require('dotenv').config();

const toBool = (v, def=false) => {
  if (v === undefined) return def;
  return ['1','true','yes','on'].includes(String(v).toLowerCase());
};

const toInt = (v, def) => {
  const n = parseInt(v, 10);
  return isNaN(n) ? def : n;
};

const list = (v, def=[]) => {
  if (!v) return def;
  return v.split(/[,;\s]+/).filter(Boolean);
};

const config = {
  env: process.env.NODE_ENV || 'development',
  isProd: (process.env.NODE_ENV || 'development') === 'production',
  port: toInt(process.env.PORT, 5000),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/5wh-news',
  cors: {
    allowedOrigins: list(process.env.CORS_ORIGINS, [
      'http://localhost:3000','http://127.0.0.1:3000','http://localhost:3001','http://127.0.0.1:3001'
    ])
  },
  rateLimit: {
    enabled: toBool(process.env.ENABLE_RATE_LIMIT, false),
    windowMs: toInt(process.env.RATE_LIMIT_WINDOW_MS, 15*60*1000),
    max: toInt(process.env.RATE_LIMIT_MAX, 1000)
  },
  scheduler: {
    intervalMs: toInt(process.env.SCHEDULER_INTERVAL_MS, 60*1000)
  }
};

module.exports = config;
