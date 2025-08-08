const database = require('../db');

class User {
  static async create(username) {
    const db = database.getDb();
    const type = database.getType();

    if (type === 'mongodb') {
      try {
        const result = await db.collection('users').insertOne({ username });
        return { id: result.insertedId, username };
      } catch (error) {
        if (error.code === 11000) { // Duplicate key error
          return await this.findByUsername(username);
        }
        throw error;
      }
    } else {
      return new Promise((resolve, reject) => {
        db.run('INSERT OR IGNORE INTO users (username) VALUES (?)', [username], function(err) {
          if (err) {
            reject(err);
          } else {
            if (this.changes > 0) {
              resolve({ id: this.lastID, username });
            } else {
              // User already exists, fetch it
              User.findByUsername(username).then(resolve).catch(reject);
            }
          }
        });
      });
    }
  }

  static async findByUsername(username) {
    const db = database.getDb();
    const type = database.getType();

    if (type === 'mongodb') {
      const user = await db.collection('users').findOne({ username });
      return user ? { id: user._id, username: user.username } : null;
    } else {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        });
      });
    }
  }

  static async findAll() {
    const db = database.getDb();
    const type = database.getType();

    if (type === 'mongodb') {
      const users = await db.collection('users').find({}).toArray();
      return users.map(u => ({ id: u._id, username: u.username }));
    } else {
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM users ORDER BY username', [], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    }
  }
}

module.exports = User;
