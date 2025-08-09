const database = require('../db');

class Module {
  static async create(name, slug) {
    await database.connect(); // Ensure connection before accessing DB
    const db = database.getDb();
    const type = database.getType();

    if (type === 'mongodb') {
      try {
        const result = await db.collection('modules').insertOne({ name, slug });
        return { id: result.insertedId, name, slug };
      } catch (error) {
        if (error.code === 11000) { // Duplicate key error
          return await this.findBySlug(slug);
        }
        throw error;
      }
    } else {
      return new Promise((resolve, reject) => {
        db.run('INSERT OR IGNORE INTO modules (name, slug) VALUES (?, ?)', [name, slug], function(err) {
          if (err) {
            reject(err);
          } else {
            if (this.changes > 0) {
              resolve({ id: this.lastID, name, slug });
            } else {
              // Module already exists, fetch it
              Module.findBySlug(slug).then(resolve).catch(reject);
            }
          }
        });
      });
    }
  }

  static async findAll() {
    await database.connect(); // Ensure connection before accessing DB
    const db = database.getDb();
    const type = database.getType();

    if (type === 'mongodb') {
      const modules = await db.collection('modules').find({}).toArray();
      return modules.map(m => ({ id: m._id, name: m.name, slug: m.slug }));
    } else {
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM modules ORDER BY name', [], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    }
  }

  static async findBySlug(slug) {
    await database.connect(); // Ensure connection before accessing DB
    const db = database.getDb();
    const type = database.getType();

    if (type === 'mongodb') {
      const module = await db.collection('modules').findOne({ slug });
      return module ? { id: module._id, name: module.name, slug: module.slug } : null;
    } else {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM modules WHERE slug = ?', [slug], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        });
      });
    }
  }

  static async findById(id) {
    await database.connect(); // Ensure connection before accessing DB
    const db = database.getDb();
    const type = database.getType();

    if (type === 'mongodb') {
      const { ObjectId } = require('mongodb');
      const module = await db.collection('modules').findOne({ _id: new ObjectId(id) });
      return module ? { id: module._id, name: module.name, slug: module.slug } : null;
    } else {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM modules WHERE id = ?', [id], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        });
      });
    }
  }
}

module.exports = Module;
