const express = require('express');
const session = require('express-session');
const cors = require('cors');
const MongoStore = require('connect-mongo'); // added
require('dotenv').config();

const database = require('./db');

// Import routes
const authRoutes = require('./routes/auth');
const modulesRoutes = require('./routes/modules');
const questionsRoutes = require('./routes/questions');
const attemptsRoutes = require('./routes/attempts');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  // Reflect origin to support same-origin on Vercel and local dev
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration (Mongo store in production when available)
const sessionOptions = {
  name: 'sid',
  secret: process.env.SESSION_SECRET || 'mathathon-default-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

if (process.env.MONGODB_URI && process.env.MONGODB_URI.trim()) {
  sessionOptions.store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME || 'mathathon',
    stringify: false
  });
}

app.use(session(sessionOptions));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: database.getType()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/modules', modulesRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/attempts', attemptsRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Mathathon API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      modules: '/api/modules',
      questions: '/api/questions',
      attempts: '/api/attempts',
      admin: '/api/admin'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server (only listen when not running on Vercel)
async function startServer() {
  try {
    // Connect to database
    await database.connect();
    console.log(`✅ Database (${database.getType()}) connected successfully`);
    
    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`🚀 Mathathon server running on port ${PORT}`);
        console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
        console.log(`🏥 Health check: http://localhost:${PORT}/health`);
        console.log(`📊 Database type: ${database.getType()}`);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Running in development mode');
        }
      });
    }
    
  } catch (error) {
    console.error('💥 Failed to start server:', error.message);
    if (!process.env.VERCEL) process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Gracefully shutting down server...');
  try {
    await database.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  try {
    await database.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    process.exit(1);
  }
});

// Export the app for Vercel serverless
module.exports = app;
