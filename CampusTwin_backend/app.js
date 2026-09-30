const express = require('express');
const cors = require('cors');
const path = require('path');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const classRoutes = require('./routes/classRoutes');
const eventRoutes = require('./routes/eventRoutes');
const clubRoutes = require('./routes/clubRoutes');
const productRoutes = require('./routes/productRoutes');
const lostFoundRoutes = require('./routes/lostFoundRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const studyGroupRoutes = require('./routes/studyGroupRoutes');
const skillRoutes = require('./routes/skillRoutes');
const confessionRoutes = require('./routes/confessionRoutes');
const placementRoutes = require('./routes/placementRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const chatRoutes = require('./routes/chatRoutes');
const campusRoutes = require('./routes/campusRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true); // Dev convenience
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date(),
    service: 'CampusTwin Backend API'
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/products', productRoutes);
app.use('/api/lostfound', lostFoundRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/study-groups', studyGroupRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/confessions', confessionRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/campus', campusRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/uploads', uploadRoutes);

// Compatibility alias routes
app.use('/api/teacher', attendanceRoutes);
app.use('/api/community', studyGroupRoutes);

// 404 & Centralized Error Middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
