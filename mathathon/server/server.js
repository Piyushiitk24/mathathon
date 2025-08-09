const express = require('express');
const session = require('express-session');
const cors = require('cors');
const MongoStore = require('connect-mongo'); // NEW
require('dotenv').config();

const database = require('./db');
// Routes
const authRoutes = require('./routes/auth');
const modulesRoutes = require('./routes/modules');
const questionsRoutes = require('./routes/questions');
const attemptsRoutes = require('./routes/attempts');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true })); // allow same-origin (Vercel) + local
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions (store in Mongo when available)
const sessionOptions = {
  name: 'sid',
  secret: process.env.SESSION_SECRET || 'mathathon-default-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24
  }
};
if (process.env.MONGODB_URI && process.env.MONGODB_URI.trim()) {
  sessionOptions.store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME || 'mathathon'
  });
}
app.use(session(sessionOptions));

// Logging (optional)
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health and routes
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), database: database.getType() });
});
app.use('/api/auth', authRoutes);
app.use('/api/modules', modulesRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/attempts', attemptsRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => res.status(404).json({ error: 'Endpoint not found' }));

// Start database and (only locally) the HTTP listener
async function startServer() {
  try {
    await database.connect();
    console.log(`✅ Database (${database.getType()}) connected successfully`);
    if (!process.env.VERCEL) {
      app.listen(PORT, () => console.log(`🚀 Server http://localhost:${PORT}`));
    }
  } catch (err) {
    console.error('💥 Failed to start server:', err.message);
    if (!process.env.VERCEL) process.exit(1);
  }
}
startServer();

// Export the Express app for Vercel Serverless
module.exports = app;
