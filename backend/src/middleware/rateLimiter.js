const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 0 : 1000,        // 0 = unlimited in development
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,            // skip entirely in development
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 0 : 10,         // 0 = unlimited in development
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,            // skip entirely in development
  message: { success: false, message: 'Too many login attempts, please try again in 15 minutes.' },
});

module.exports = { globalRateLimiter, authRateLimiter };
