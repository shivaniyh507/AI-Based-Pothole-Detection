const express = require('express');
const router = express.Router();
const { getStats, getAnalytics } = require('../controllers/dashboardController');

// Aggregated statistics for dashboard
router.get('/stats', getStats);

// Detection summaries & repair analytics
router.get('/analytics', getAnalytics);

module.exports = router;
