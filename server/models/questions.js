const database = require('../db');

class Question {
  static async create(questionData) {
    await database.connect(); // Ensure connection before accessing DB
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
      const { ObjectId } = require('mongodb');
      
      // Ensure module_id is properly converted to ObjectId
      let moduleObjectId;
      try {
        if (typeof module_id === 'string' && ObjectId.isValid(module_id)) {
          moduleObjectId = new ObjectId(module_id);
        } else if (module_id instanceof ObjectId) {
          moduleObjectId = module_id;
        } else {
          throw new Error('Invalid module_id format');
        }
      } catch (error) {
        console.error('ObjectId conversion error:', error);
        throw new Error(`Invalid module_id: ${module_id}`);
      }

      // Create clean document with proper field validation
      const documentToInsert = {
        module_id: moduleObjectId,
        type: questionType,
        question_text: question_text,
        difficulty: difficulty || 'medium'
      };

      // Only add option fields for mock questions
      if (questionType === 'mock') {
        documentToInsert.option_a = option_a || null;
        documentToInsert.option_b = option_b || null;
        documentToInsert.option_c = option_c || null;
        documentToInsert.option_d = option_d || null;
        documentToInsert.correct_option = correct_option || null;
      } else {
        // For revision questions, ensure these fields are null
        documentToInsert.option_a = null;
        documentToInsert.option_b = null;
        documentToInsert.option_c = null;
        documentToInsert.option_d = null;
        documentToInsert.correct_option = null;
      }

      // Always include answer_text
      documentToInsert.answer_text = answer_text || null;

      try {
        console.log('Attempting to insert document:', JSON.stringify(documentToInsert, null, 2));
        const result = await db.collection('questions').insertOne(documentToInsert);
        console.log('Insert successful, result:', result);
        return { id: result.insertedId, ...questionData };
      } catch (mongoError) {
        console.error('MongoDB Insert Error Details:', {
          message: mongoError.message,
          code: mongoError.code,
          codeName: mongoError.codeName,
          writeErrors: mongoError.writeErrors,
          document: documentToInsert
        });
        throw new Error(`Database insert failed: ${mongoError.message}`);
      }
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
    await database.connect(); // Ensure connection before accessing DB
    const db = database.getDb();
    const type = database.getType();

    if (type === 'mongodb') {
      const { ObjectId } = require('mongodb');
      
      // Convert moduleId to ObjectId if it's a valid ObjectId string
      let searchModuleId = moduleId;
      if (typeof moduleId === 'string' && ObjectId.isValid(moduleId)) {
        searchModuleId = new ObjectId(moduleId);
      }
      
      console.log(`🔍 MongoDB search: module_id=${searchModuleId}, type=${questionType}`);
      
      const questions = await db.collection('questions').find({
        module_id: searchModuleId,
        type: questionType
      }).toArray();
      
      console.log(`📚 MongoDB found ${questions.length} questions`);
      
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
    await database.connect(); // Ensure connection before accessing DB
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
    await database.connect(); // Ensure connection before accessing DB
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
