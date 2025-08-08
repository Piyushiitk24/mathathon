const express = require('express');
const router = express.Router();
const modulesController = require('../controllers/modulesController');

// GET /api/modules
router.get('/', modulesController.getAll);

// GET /api/modules/:id
router.get('/:id', modulesController.getById);

// POST /api/modules (admin only - will be protected in main routes)
router.post('/', modulesController.create);

module.exports = router;
