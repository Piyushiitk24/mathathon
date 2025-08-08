const Attempt = require('../models/attempts');
const Module = require('../models/modules');

const attemptsController = {
  // POST /api/attempts
  async create(req, res) {
    try {
      const {
        username,
        module_id,
        type,
        datetime_iso,
        score,
        time_taken_seconds,
        details
      } = req.body;

      // Validate required fields
      if (!username || !module_id || !type || !datetime_iso) {
        return res.status(400).json({ 
          error: 'Username, module_id, type, and datetime_iso are required' 
        });
      }

      if (!['revision', 'mock'].includes(type)) {
        return res.status(400).json({ 
          error: 'Type must be "revision" or "mock"' 
        });
      }

      // Validate datetime format (should be ISO 8601)
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      if (!dateRegex.test(datetime_iso)) {
        return res.status(400).json({ 
          error: 'datetime_iso must be in ISO 8601 format' 
        });
      }

      // For mock attempts, score and time are required
      if (type === 'mock' && (score === undefined || time_taken_seconds === undefined)) {
        return res.status(400).json({ 
          error: 'Mock attempts require score and time_taken_seconds' 
        });
      }

      const attemptData = {
        username,
        datetime_iso,
        module_id: parseInt(module_id),
        type,
        score: score || null,
        time_taken_seconds: time_taken_seconds || null,
        details: details || {}
      };

      const attempt = await Attempt.create(attemptData);
      res.status(201).json({ ok: true, attemptId: attempt.id });
    } catch (error) {
      console.error('Error creating attempt:', error);
      res.status(500).json({ error: 'Failed to create attempt' });
    }
  },

  // GET /api/attempts
  async getAll(req, res) {
    try {
      const attempts = await Attempt.findAll();
      res.json(attempts);
    } catch (error) {
      console.error('Error fetching attempts:', error);
      res.status(500).json({ error: 'Failed to fetch attempts' });
    }
  },

  // GET /api/attempts/user/:username
  async getByUser(req, res) {
    try {
      const { username } = req.params;
      const attempts = await Attempt.findByUser(username);
      res.json(attempts);
    } catch (error) {
      console.error('Error fetching user attempts:', error);
      res.status(500).json({ error: 'Failed to fetch user attempts' });
    }
  },

  // GET /api/attempts/module/:moduleId
  async getByModule(req, res) {
    try {
      const { moduleId } = req.params;
      const attempts = await Attempt.findByModule(parseInt(moduleId));
      res.json(attempts);
    } catch (error) {
      console.error('Error fetching module attempts:', error);
      res.status(500).json({ error: 'Failed to fetch module attempts' });
    }
  }
};

module.exports = attemptsController;
