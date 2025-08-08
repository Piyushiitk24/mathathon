const express = require('express');
const router = express.Router();
const questionsController = require('../controllers/questionsController');

// GET /api/questions/:moduleId/:type
router.get('/:moduleId/:type', questionsController.getByModuleAndType);

// GET /api/questions/:id
router.get('/:id', questionsController.getById);

// POST /api/questions (admin only - will be protected in main routes)
router.post('/', questionsController.create);

module.exports = router;
