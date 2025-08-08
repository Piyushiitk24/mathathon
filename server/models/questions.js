const database = require('../db');

class Question {
  static async create(questionData) {
    const db = database.getDb();
    const type = database.getType();

    const {
      module_id,
      type: questionType,
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
      answer_text,
      difficulty
    } = questionData;

    if (type === 'mongodb') {
      const result = await db.collection('questions').insertOne({
        module_id,
        type: questionType,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        answer_text,
        difficulty
      });
      return { id: result.insertedId, ...questionData };
    } else {
      return new Promise((resolve, reject) => {
        const sql = `INSERT INTO questions 
          (module_id, type, question_text, option_a, option_b, option_c, option_d, correct_option, answer_text, difficulty)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.run(sql, [
          module_id, questionType, question_text, option_a, option_b, option_c, option_d, correct_option, answer_text, difficulty
        ], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...questionData });
          }
        });
      });
    }
  }

  static async findByModuleAndType(moduleId, questionType) {
    const db = database.getDb();
    const type = database.getType();

    if (type === 'mongodb') {
      const questions = await db.collection('questions').find({
        module_id: moduleId,
        type: questionType
      }).toArray();
      
      return questions.map(q => ({
        id: q._id,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option,
        answer_text: q.answer_text,
        difficulty: q.difficulty
      }));
    } else {
      return new Promise((resolve, reject) => {
        const sql = `SELECT id, question_text, option_a, option_b, option_c, option_d, correct_option, answer_text, difficulty
                     FROM questions WHERE module_id = ? AND type = ?`;
        
        db.all(sql, [moduleId, questionType], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    }
  }

  static async findById(id) {
    const db = database.getDb();
    const type = database.getType();

    if (type === 'mongodb') {
      const { ObjectId } = require('mongodb');
      const question = await db.collection('questions').findOne({ _id: new ObjectId(id) });
      return question ? {
        id: question._id,
        module_id: question.module_id,
        type: question.type,
        question_text: question.question_text,
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d,
        correct_option: question.correct_option,
        answer_text: question.answer_text,
        difficulty: question.difficulty
      } : null;
    } else {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM questions WHERE id = ?', [id], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        });
      });
    }
  }

  static async count() {
    const db = database.getDb();
    const type = database.getType();

    if (type === 'mongodb') {
      return await db.collection('questions').countDocuments();
    } else {
      return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM questions', [], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row.count);
          }
        });
      });
    }
  }
}

module.exports = Question;
