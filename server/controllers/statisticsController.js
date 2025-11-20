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
}

module.exports = StatisticsController;
