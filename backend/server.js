// Load environment variables first
require('dotenv').config();

// Core dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Database configuration
const connectDB = require('./config/database');

// Route imports
const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/business');
const staffRoutes = require('./routes/staff');
const scheduleRoutes = require('./routes/schedule');

// Middleware imports
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Initialize Express app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API versioning
const API_VERSION = process.env.API_VERSION || 'v1';

// Mount routes
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/business`, businessRoutes);
app.use(`/api/${API_VERSION}/staff`, staffRoutes);
app.use(`/api/${API_VERSION}/schedule`, scheduleRoutes);

if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../frontend/build');
  app.use(express.static(frontendBuildPath));

  // ✅ Either of these works — pick ONE:
  
  // Option 1: Regex route (preferred)
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });

  // Option 2: Catch-all middleware
  // app.use((req, res) => {
  //   res.sendFile(path.join(frontendBuildPath, 'index.html'));
  // });
}

// 404 middleware (must come after all route handlers)
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/api/health`);
});

module.exports = app;
