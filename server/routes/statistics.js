const express = require('express');
const StatisticsController = require('../controllers/statisticsController');

const router = express.Router();

// Get dashboard statistics
router.get('/', StatisticsController.getDashboardStats);

// Get chart data for line graph
router.get('/chart-data', StatisticsController.getChartData);

// Get recent activities
router.get('/recent-activities', StatisticsController.getRecentActivities);

module.exports = router;
