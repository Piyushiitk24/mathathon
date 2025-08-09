const { connect, getDb } = require('../db');

const User = {
  async create(username) {
    // First, ensure the database is connected by calling connect()
    await connect(); 
    // Now, it's safe to get the database instance.
    const db = getDb();
    const usersCollection = db.collection('users');
    
    // Find user or create if they don't exist
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return existingUser;
    }
    
    const newUser = { username, createdAt: new Date() };
    await usersCollection.insertOne(newUser);
    return newUser;
  },

  static async findByUsername(username) {
    const db = getDb();
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
  },

  static async findAll() {
    const db = getDb();
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
};

module.exports = User;
