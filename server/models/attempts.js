const database = require('../db');

class Attempt {
  static async create(attemptData) {
    const db = database.getDb();
    const type = database.getType();

    const {
      username,
      datetime_iso,
      module_id,
      type: attemptType,
      score,
      time_taken_seconds,
      details
    } = attemptData;

    const detailsString = typeof details === 'string' ? details : JSON.stringify(details);

    if (type === 'mongodb') {
      const result = await db.collection('attempts').insertOne({
        username,
        datetime_iso,
        module_id,
        type: attemptType,
        score,
        time_taken_seconds,
        details: detailsString
      });
      return { id: result.insertedId, ...attemptData };
    } else {
      return new Promise((resolve, reject) => {
        const sql = `INSERT INTO attempts 
          (username, datetime_iso, module_id, type, score, time_taken_seconds, details)
          VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
        db.run(sql, [
          username, datetime_iso, module_id, attemptType, score, time_taken_seconds, detailsString
        ], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...attemptData });
          }
        });
      });
    }
  }

  static async findAll() {
    const db = database.getDb();
    const type = database.getType();

    if (type === 'mongodb') {
      const attempts = await db.collection('attempts').find({}).sort({ datetime_iso: -1 }).toArray();
      return attempts.map(a => ({
        id: a._id,
        username: a.username,
        datetime_iso: a.datetime_iso,
        module_id: a.module_id,
        type: a.type,
        score: a.score,
        time_taken_seconds: a.time_taken_seconds,
        details: a.details
      }));
    } else {
      return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM attempts ORDER BY datetime_iso DESC`;
        
        db.all(sql, [], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    }
  }

  static async findByUser(username) {
    const db = database.getDb();
    const type = database.getType();

    if (type === 'mongodb') {
      const attempts = await db.collection('attempts').find({ username }).sort({ datetime_iso: -1 }).toArray();
      return attempts.map(a => ({
        id: a._id,
        username: a.username,
        datetime_iso: a.datetime_iso,
        module_id: a.module_id,
        type: a.type,
        score: a.score,
        time_taken_seconds: a.time_taken_seconds,
        details: a.details
      }));
    } else {
      return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM attempts WHERE username = ? ORDER BY datetime_iso DESC`;
        
        db.all(sql, [username], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    }
  }

  static async findByModule(moduleId) {
    const db = database.getDb();
    const type = database.getType();

    if (type === 'mongodb') {
      const attempts = await db.collection('attempts').find({ module_id: moduleId }).sort({ datetime_iso: -1 }).toArray();
      return attempts.map(a => ({
        id: a._id,
        username: a.username,
        datetime_iso: a.datetime_iso,
        module_id: a.module_id,
        type: a.type,
        score: a.score,
        time_taken_seconds: a.time_taken_seconds,
        details: a.details
      }));
    } else {
      return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM attempts WHERE module_id = ? ORDER BY datetime_iso DESC`;
        
        db.all(sql, [moduleId], (err, rows) => {
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

module.exports = Attempt;
