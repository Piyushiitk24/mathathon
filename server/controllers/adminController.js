const Question = require('../models/questions');
const Module = require('../models/modules');
const Attempt = require('../models/attempts');

// Middleware to check admin authentication
const requireAdmin = (req, res, next) => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    return res.status(500).json({ error: 'Admin password not configured' });
  }

  // Check for admin password in header or body
  const providedPassword = req.headers['x-admin-password'] || req.body.admin_password;
  
  if (!providedPassword || providedPassword !== adminPassword) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }
  
  next();
};

const adminController = {
  // POST /api/admin/add-question
  async addQuestion(req, res) {
    try {
      const {
        module_name,
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
      if (!module_name || !type || !question_text) {
        return res.status(400).json({ 
          error: 'Module name, type, and question text are required' 
        });
      }

      if (!['revision', 'mock'].includes(type)) {
        return res.status(400).json({ 
          error: 'Type must be "revision" or "mock"' 
        });
      }

      // Find or create module
      const moduleSlug = module_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      let module = await Module.findBySlug(moduleSlug);
      
      if (!module) {
        module = await Module.create(module_name, moduleSlug);
      }

      // Ensure module.id is properly formatted for ObjectId conversion
      let moduleId = module.id;
      if (typeof moduleId === 'object' && moduleId._id) {
        moduleId = moduleId._id.toString(); // Extract ObjectId if it's wrapped
      } else if (typeof moduleId === 'object') {
        moduleId = moduleId.toString(); // Convert ObjectId to string
      }

      // Create question data with proper module_id
      const questionData = {
        module_id: moduleId, // This should be an ObjectId string
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

      console.log('Creating question with data:', {
        ...questionData,
        module_id: moduleId // Log the string representation
      });

      const question = await Question.create(questionData);
      
      res.status(201).json({ 
        ok: true, 
        question,
        module: {
          id: moduleId,
          name: module.name || module_name,
          slug: moduleSlug
        }
      });
    } catch (error) {
      console.error('Error adding question:', error);
      res.status(500).json({ 
        error: `Failed to add question: ${error.message}`,
        details: error.stack
      });
    }
  },

  // GET /api/admin/attempts
  async getAttempts(req, res) {
    try {
      const attempts = await Attempt.findAll();
      const modules = await Module.findAll();
      
      // Create a module lookup map
      const moduleMap = {};
      modules.forEach(module => {
        moduleMap[module.id] = module.name;
      });
      
      // Enhance attempts with module names
      const enhancedAttempts = attempts.map(attempt => ({
        ...attempt,
        module_name: moduleMap[attempt.module_id] || 'Unknown Module',
        details: typeof attempt.details === 'string' ? 
          JSON.parse(attempt.details) : attempt.details
      }));
      
      res.json(enhancedAttempts);
    } catch (error) {
      console.error('Error fetching admin attempts:', error);
      res.status(500).json({ error: 'Failed to fetch attempts' });
    }
  },

  // GET /api/admin/stats
  async getStats(req, res) {
    try {
      const modules = await Module.findAll();
      const attempts = await Attempt.findAll();
      const questionCount = await Question.count();
      
      // Calculate basic stats
      const stats = {
        total_modules: modules.length,
        total_questions: questionCount,
        total_attempts: attempts.length,
        unique_users: [...new Set(attempts.map(a => a.username))].length,
        mock_attempts: attempts.filter(a => a.type === 'mock').length,
        revision_attempts: attempts.filter(a => a.type === 'revision').length
      };
      
      // Module-wise stats
      const moduleStats = modules.map(module => {
        const moduleAttempts = attempts.filter(a => a.module_id === module.id);
        const mockAttempts = moduleAttempts.filter(a => a.type === 'mock');
        const avgScore = mockAttempts.length > 0 ?
          mockAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / mockAttempts.length : 0;
        
        return {
          module_name: module.name,
          attempts: moduleAttempts.length,
          mock_attempts: mockAttempts.length,
          revision_attempts: moduleAttempts.filter(a => a.type === 'revision').length,
          average_score: Math.round(avgScore * 100) / 100
        };
      });
      
      res.json({
        overview: stats,
        module_stats: moduleStats
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  },

  // POST /api/admin/import-csv (placeholder for future CSV upload)
  async importCsv(req, res) {
    try {
      // This could be implemented to handle file uploads
      // For now, we'll direct users to use the seed script
      res.json({ 
        message: 'CSV import via seed script is recommended. Run "node seed.js" in the server directory.' 
      });
    } catch (error) {
      console.error('Error importing CSV:', error);
      res.status(500).json({ error: 'Failed to import CSV' });
    }
  }
};

module.exports = { adminController, requireAdmin };
