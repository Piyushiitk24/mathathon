const sqlite3 = require('sqlite3').verbose();
const { MongoClient } = require('mongodb');
const path = require('path');

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
    try {
      this.client = new MongoClient(process.env.MONGODB_URI);
      await this.client.connect();
      const dbName = process.env.MONGODB_DB_NAME || 'mathathon';
      this.db = this.client.db(dbName);
      console.log(`Connected to MongoDB db="${dbName}"`);
      
      // Create indexes for better performance
      await this.db.collection('modules').createIndex({ slug: 1 }, { unique: true });
      await this.db.collection('users').createIndex({ username: 1 }, { unique: true });
      await this.db.collection('questions').createIndex({ module_id: 1, type: 1 });
      
      return this.db;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
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
