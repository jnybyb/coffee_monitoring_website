const { getPromisePool } = require('../config/database');

class Statistics {
  static async getDashboardStats() {
    try {
      // Get total beneficiaries count
      const beneficiariesResult = await getPromisePool().query('SELECT COUNT(*) as total FROM beneficiaries');
      const totalBeneficiaries = beneficiariesResult[0][0].total;

      // Get total seeds distributed (sum of received seeds from seedlings table)
      const seedsResult = await getPromisePool().query('SELECT SUM(received) as total FROM seedling_records WHERE received IS NOT NULL');
      const totalSeedsDistributed = seedsResult[0][0].total || 0;

      // Get alive and dead crops count
      const cropsResult = await getPromisePool().query(`
        SELECT 
          SUM(alive_crops) as totalAlive,
          SUM(dead_crops) as totalDead
        FROM crop_status 
        WHERE alive_crops IS NOT NULL OR dead_crops IS NOT NULL
      `);
      
      const totalAlive = cropsResult[0][0].totalAlive || 0;
      const totalDead = cropsResult[0][0].totalDead || 0;

      return {
        totalBeneficiaries,
        totalSeedsDistributed,
        totalAlive,
        totalDead
      };
    } catch (error) {
      throw new Error('Failed to fetch statistics: ' + error.message);
    }
  }

  static async getChartData() {
    try {
      // Get monthly data for the last 12 months
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      const startDate = twelveMonthsAgo.toISOString().split('T')[0];

      // Get monthly beneficiaries count
      const beneficiariesResult = await getPromisePool().query(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as count
        FROM beneficiaries 
        WHERE created_at >= ?
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month
      `, [startDate]);

      // Get monthly seedlings distributed
      const seedlingsResult = await getPromisePool().query(`
        SELECT 
          DATE_FORMAT(date_received, '%Y-%m') as month,
          SUM(received) as count
        FROM seedling_records 
        WHERE date_received >= ?
        GROUP BY DATE_FORMAT(date_received, '%Y-%m')
        ORDER BY month
      `, [startDate]);

      // Get monthly crop status data
      const cropsResult = await getPromisePool().query(`
        SELECT 
          DATE_FORMAT(survey_date, '%Y-%m') as month,
          SUM(alive_crops) as alive_count,
          SUM(dead_crops) as dead_count
        FROM crop_status 
        WHERE survey_date >= ?
        GROUP BY DATE_FORMAT(survey_date, '%Y-%m')
        ORDER BY month
      `, [startDate]);

      // Create a map of all months in the last 12 months
      const monthMap = new Map();
      const currentDate = new Date();
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().substring(0, 7); // YYYY-MM format
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        monthMap.set(monthKey, {
          month: monthName,
          beneficiaries: 0,
          seedlings: 0,
          aliveCrops: 0,
          deadCrops: 0
        });
      }

      // Fill in beneficiaries data
      beneficiariesResult[0].forEach(row => {
        if (monthMap.has(row.month)) {
          monthMap.get(row.month).beneficiaries = row.count;
        }
      });

      // Fill in seedlings data
      seedlingsResult[0].forEach(row => {
        if (monthMap.has(row.month)) {
          monthMap.get(row.month).seedlings = row.count || 0;
        }
      });

      // Fill in crop status data
      cropsResult[0].forEach(row => {
        if (monthMap.has(row.month)) {
          monthMap.get(row.month).aliveCrops = row.alive_count || 0;
          monthMap.get(row.month).deadCrops = row.dead_count || 0;
        }
      });

      // Convert map to array
      return Array.from(monthMap.values());
    } catch (error) {
      throw new Error('Failed to fetch chart data: ' + error.message);
    }
  }
}

module.exports = Statistics;
