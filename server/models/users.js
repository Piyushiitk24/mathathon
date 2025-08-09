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
};

module.exports = User;
