const path = require('path');
const express = require('express');
const cors = require('cors');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { initializeDatabase } = require('./config/database');
const apiRouter = require('./routes');

const app = express();

// Middleware
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigin = process.env.CORS_ORIGIN || '*';
    
    // If wildcard, allow all origins
    if (allowedOrigin === '*') {
      return callback(null, true);
    }
    
    // Remove trailing slash from configured origin for comparison
    const normalizedAllowedOrigin = allowedOrigin.replace(/\/$/, '');
    // Remove trailing slash from request origin for comparison
    const normalizedOrigin = origin ? origin.replace(/\/$/, '') : '';
    
    // Check if origins match (both normalized)
    if (normalizedOrigin === normalizedAllowedOrigin) {
      // Return the exact origin from the request (without trailing slash)
      callback(null, normalizedOrigin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded images
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount API routes
app.use('/api', apiRouter);

// Start server after initializing DB
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize application:', error.message);
    process.exit(1);
  }
})();
