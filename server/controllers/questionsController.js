const Question = require('../models/questions');

const questionsController = {
  // GET /api/questions/:moduleId/:type
  async getByModuleAndType(req, res) {
    try {
      const { moduleId, type } = req.params;
      
      if (!['revision', 'mock'].includes(type)) {
        return res.status(400).json({ error: 'Invalid question type. Must be "revision" or "mock"' });
      }
      
      console.log(`🔍 Searching for questions with moduleId: ${moduleId}, type: ${type}`);
      const questions = await Question.findByModuleAndType(moduleId, type);
      console.log(`📚 Found ${questions.length} questions`);
      res.json(questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ error: 'Failed to fetch questions' });
    }
  },

  // GET /api/questions/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const question = await Question.findById(id);
      
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      
      res.json(question);
    } catch (error) {
      console.error('Error fetching question:', error);
      res.status(500).json({ error: 'Failed to fetch question' });
    }
  },

  // POST /api/questions (admin only)
  async create(req, res) {
    try {
      const {
        module_id,
        type,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        answer_text,
        difficulty
      } = req.body;

      // Validate required fields
      if (!module_id || !type || !question_text) {
        return res.status(400).json({ 
          error: 'Module ID, type, and question text are required' 
        });
      }

      if (!['revision', 'mock'].includes(type)) {
        return res.status(400).json({ 
          error: 'Type must be "revision" or "mock"' 
        });
      }

      // For mock questions, validate that we have options and correct answer
      if (type === 'mock') {
        if (!option_a || !option_b || !option_c || !option_d || !correct_option) {
          return res.status(400).json({ 
            error: 'Mock questions require all options (A-D) and correct option' 
          });
        }
        
        if (!['A', 'B', 'C', 'D'].includes(correct_option)) {
          return res.status(400).json({ 
            error: 'Correct option must be A, B, C, or D' 
          });
        }
      }

      const questionData = {
        module_id: module_id, // Keep as string/ObjectId, don't parse as int
        type,
        question_text,
        option_a: option_a || null,
        option_b: option_b || null,
        option_c: option_c || null,
        option_d: option_d || null,
        correct_option: correct_option || null,
        answer_text: answer_text || null,
        difficulty: difficulty || 'medium'
      };

      const question = await Question.create(questionData);
      res.status(201).json(question);
    } catch (error) {
      console.error('Error creating question:', error);
      res.status(500).json({ error: 'Failed to create question' });
    }
  }
};

module.exports = questionsController;
