const express = require('express');
const router = express.Router();
const attemptsController = require('../controllers/attemptsController');

// POST /api/attempts
router.post('/', attemptsController.create);

// GET /api/attempts
router.get('/', attemptsController.getAll);

// GET /api/attempts/user/:username
router.get('/user/:username', attemptsController.getByUser);

// GET /api/attempts/module/:moduleId
router.get('/module/:moduleId', attemptsController.getByModule);

module.exports = router;
