const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');
const personRoutes = require('./routes/personRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Increased limit for base64 images
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Database connection and sync
const initDatabase = async () => {
  try {
    await testConnection();
    // Sync database (create tables if they don't exist)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database synchronized');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
};

initDatabase();

// Routes
app.use('/api/persons', personRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: 'healthy', 
      timestamp: new Date(),
      database: 'connected'
    });
  } catch (error) {
    res.json({ 
      status: 'unhealthy', 
      timestamp: new Date(),
      database: 'disconnected'
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: '🌳 3D Family Tree API',
    version: '1.0.0',
    endpoints: {
      persons: '/api/persons',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
});
