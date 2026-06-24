const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

const { globalRateLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const quizRoutes = require('./routes/quizRoutes');
const adRoutes = require('./routes/adRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const funFactRoutes = require('./routes/funFactRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const quickStartRoutes = require('./routes/quickStartRoutes');

const app = express();
app.set('trust proxy', 1);
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(globalRateLimiter);

app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/fun-facts', funFactRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/quick-start', quickStartRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve React static files
app.use(express.static(path.join(__dirname, '../dist')));

// Handle React routing (SPA)
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return next();
  }

  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.use(errorHandler);

module.exports = app;
