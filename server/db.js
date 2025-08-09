const { MongoClient } = require('mongodb');

// These variables will hold the single, shared connection promise and database instance.
let connectionPromise = null;
let dbInstance = null;

// This is the new connect function.
const connect = () => {
  // If a connection promise already exists, return it to avoid creating multiple connections.
  if (connectionPromise) {
    return connectionPromise;
  }

  // Otherwise, create a new connection promise.
  connectionPromise = new Promise((resolve, reject) => {
    const mongoUri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || 'mathathon';

    if (!mongoUri) {
      console.error('💥 MONGODB_URI is not defined in environment variables');
      return reject(new Error('MONGODB_URI is not defined'));
    }

    const client = new MongoClient(mongoUri);

    client.connect()
      .then(connectedClient => {
        console.log(`✅ Database connected successfully to "${dbName}"`);
        dbInstance = connectedClient.db(dbName); // Store the database instance
        resolve(dbInstance);
      })
      .catch(err => {
        console.error('💥 Failed to connect to database:', err);
        connectionPromise = null; // Reset promise on failure to allow retry
        reject(err);
      });
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

// Export the functions for use in other parts of the app.
module.exports = {
  connect,
  getDb,
  getType,
};
