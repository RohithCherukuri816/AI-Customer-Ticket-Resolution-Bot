const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, authorize('agent', 'admin'), getDashboardStats);

module.exports = router;
