const express = require('express');
const router = express.Router();
const { adminController, requireAdmin } = require('../controllers/adminController');

// All admin routes require authentication
router.use(requireAdmin);

// POST /api/admin/add-question
router.post('/add-question', adminController.addQuestion);

// GET /api/admin/attempts
router.get('/attempts', adminController.getAttempts);

// GET /api/admin/stats
router.get('/stats', adminController.getStats);

// POST /api/admin/import-csv
router.post('/import-csv', adminController.importCsv);

module.exports = router;
