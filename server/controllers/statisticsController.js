const Statistics = require('../models/Statistics');

class StatisticsController {
  // Get dashboard statistics
  static async getDashboardStats(req, res) {
    try {
      const stats = await Statistics.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }

  // Get chart data for line graph
  static async getChartData(req, res) {
    try {
      const chartData = await Statistics.getChartData();
      res.json(chartData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      res.status(500).json({ error: 'Failed to fetch chart data' });
    }
  }

  // Get recent activities
  static async getRecentActivities(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const activities = await Statistics.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      res.status(500).json({ error: 'Failed to fetch recent activities' });
    }
  }
}

module.exports = StatisticsController;
