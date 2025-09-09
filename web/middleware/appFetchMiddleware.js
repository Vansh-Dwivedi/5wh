const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Redis disabled - using in-memory caching fallback
let redisAvailable = false;

// Token validation middleware
async function validateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header', code: 401 });
  }
  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer' || !token) {
    return res.status(403).json({ error: 'Malformed Authorization header', code: 403 });
  }
  if (token !== 'APPFETCHCOMMAND!@!@!') {
    return res.status(401).json({ error: 'Invalid token', code: 401 });
  }
  // TODO: Check token in DB for is_active, expiry, etc.
  next();
}

// Request logging middleware
function logRequest(req, res, next) {
  const log = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} IP:${req.ip}`;
  fs.appendFile(path.join(__dirname, '../logs/api.log'), log + '\n', () => {});
  next();
}

// Cache middleware - disabled (no Redis setup required)
async function cacheMiddleware(req, res, next) {
  // Skip caching entirely
  next();
}

module.exports = { validateToken, logRequest, cacheMiddleware };
