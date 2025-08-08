const Module = require('../models/modules');

const modulesController = {
  // GET /api/modules
  async getAll(req, res) {
    try {
      const modules = await Module.findAll();
      res.json(modules);
    } catch (error) {
      console.error('Error fetching modules:', error);
      res.status(500).json({ error: 'Failed to fetch modules' });
    }
  },

  // GET /api/modules/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const module = await Module.findById(id);
      
      if (!module) {
        return res.status(404).json({ error: 'Module not found' });
      }
      
      res.json(module);
    } catch (error) {
      console.error('Error fetching module:', error);
      res.status(500).json({ error: 'Failed to fetch module' });
    }
  },

  // POST /api/modules (admin only)
  async create(req, res) {
    try {
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Module name is required' });
      }
      
      // Create slug from name
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      const module = await Module.create(name, slug);
      res.status(201).json(module);
    } catch (error) {
      console.error('Error creating module:', error);
      res.status(500).json({ error: 'Failed to create module' });
    }
  }
};

module.exports = modulesController;
