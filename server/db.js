const { MongoClient } = require('mongodb');

// These variables will hold the single, shared connection promise and database instance.
let connectionPromise = null;
let dbInstance = null;
let client = null;

// This is the new connect function with improved error handling and retries.
const connect = () => {
  // If a connection promise already exists, return it to avoid creating multiple connections.
  if (connectionPromise) {
    return connectionPromise;
  }

  // Otherwise, create a new connection promise.
  connectionPromise = new Promise(async (resolve, reject) => {
    const mongoUri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || 'mathathon';

    if (!mongoUri) {
      console.error('💥 MONGODB_URI is not defined in environment variables');
      return reject(new Error('MONGODB_URI is not defined'));
    }

    // Create client with optimized settings for serverless
    client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 10000, // Reduced from 30s to 10s
      connectTimeoutMS: 10000,
      maxPoolSize: 1, // Limit connection pool for serverless
      retryWrites: true,
      retryReads: true,
    });

    try {
      console.log('🔌 Attempting to connect to MongoDB...');
      await client.connect();
      
      // Test the connection
      await client.db('admin').command({ ping: 1 });
      
      console.log(`✅ Database connected successfully to "${dbName}"`);
      dbInstance = client.db(dbName);
      resolve(dbInstance);
    } catch (err) {
      console.error('💥 Failed to connect to database:', err.message);
      connectionPromise = null; // Reset promise on failure to allow retry
      
      // Close client if connection failed
      if (client) {
        try {
          await client.close();
        } catch (closeError) {
          console.error('Error closing failed connection:', closeError.message);
        }
      }
      
      reject(err);
    }
  });

  return connectionPromise;
};

// This function safely returns the database instance ONLY after it's connected.
const getDb = () => {
  if (!dbInstance) {
    throw new Error('Database not connected. Call connect() and wait for it to resolve first.');
  }
  return dbInstance;
};

const getType = () => 'mongodb';

// Graceful shutdown function
const close = async () => {
  if (client) {
    await client.close();
    client = null;
    dbInstance = null;
    connectionPromise = null;
  }
};

// Export the functions for use in other parts of the app.
module.exports = {
  connect,
  getDb,
  getType,
  close,
};
