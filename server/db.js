const sqlite3 = require('sqlite3').verbose();
const { MongoClient } = require('mongodb');
const path = require('path');

// These variables will hold the single, shared connection promise and database instance.
let connectionPromise = null;
let dbInstance = null;

class Database {
  constructor() {
    this.type = process.env.MONGODB_URI && process.env.MONGODB_URI.trim() ? 'mongodb' : 'sqlite';
    this.db = null;
    this.client = null;
  }

  async connect() {
    if (this.type === 'mongodb') {
      return this.connectMongo();
    } else {
      return this.connectSQLite();
    }
  }

  async connectMongo() {
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
  }

  async connectSQLite() {
    return new Promise((resolve, reject) => {
      const dbPath = path.join(__dirname, 'mathathon.db');
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('SQLite connection error:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.initSQLiteTables().then(() => resolve(this.db)).catch(reject);
        }
      });
    });
  }

  async initSQLiteTables() {
    return new Promise((resolve, reject) => {
      const tables = [
        `CREATE TABLE IF NOT EXISTS modules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          slug TEXT UNIQUE NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS questions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          module_id INTEGER NOT NULL,
          type TEXT NOT NULL,
          question_text TEXT NOT NULL,
          option_a TEXT,
          option_b TEXT,
          option_c TEXT,
          option_d TEXT,
          correct_option TEXT,
          answer_text TEXT,
          difficulty TEXT,
          FOREIGN KEY (module_id) REFERENCES modules (id)
        )`,
        `CREATE TABLE IF NOT EXISTS attempts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          datetime_iso TEXT NOT NULL,
          module_id INTEGER NOT NULL,
          type TEXT NOT NULL,
          score INTEGER,
          time_taken_seconds INTEGER,
          details TEXT
        )`
      ];

      let completed = 0;
      tables.forEach((sql) => {
        this.db.run(sql, (err) => {
          if (err) {
            console.error('Error creating table:', err);
            reject(err);
          } else {
            completed++;
            if (completed === tables.length) {
              console.log('SQLite tables initialized');
              resolve();
            }
          }
        });
      });
    });
  }

  getDb() {
    if (this.type === 'mongodb') {
      if (!dbInstance) {
        throw new Error('Database not connected. Call connect() and wait for it to resolve first.');
      }
      return dbInstance;
    }
    return this.db;
  }

  getType() {
    return this.type;
  }

  async close() {
    if (this.type === 'mongodb' && this.client) {
      await this.client.close();
    } else if (this.type === 'sqlite' && this.db) {
      this.db.close();
    }
  }
}

module.exports = new Database();
