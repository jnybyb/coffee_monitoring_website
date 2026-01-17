const { getPromisePool } = require('../config/database');

class Statistics {
  static async getDashboardStats() {
    try {
      // Get total beneficiaries count
      const beneficiariesResult = await getPromisePool().query('SELECT COUNT(*) as total FROM beneficiaries');
      const totalBeneficiaries = beneficiariesResult[0][0].total;

      // Get total seeds distributed (sum of received seeds from seedlings table)
      const seedsResult = await getPromisePool().query('SELECT SUM(received_seedling) as total FROM coffee_seedlings WHERE received_seedling IS NOT NULL');
      const totalSeedsDistributed = seedsResult[0][0].total || 0;

      // Get alive and dead crops count
      const cropsResult = await getPromisePool().query(`
        SELECT 
          SUM(alive_crops) as totalAlive,
          SUM(dead_crops) as totalDead
        FROM crop_survey_status 
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

  static async getChartData(beneficiaryId = null) {
    try {
      // Get monthly data for the last 12 months
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      const startDate = twelveMonthsAgo.toISOString().split('T')[0];

      // Build beneficiary filter condition
      const beneficiaryFilter = beneficiaryId 
        ? `AND beneficiary_id = (SELECT beneficiary_id FROM beneficiaries WHERE id = ?)`
        : '';
      const beneficiaryParams = beneficiaryId ? [beneficiaryId] : [];

      // Get monthly beneficiaries count (only if filtering by beneficiary, otherwise show 1 if exists)
      let beneficiariesQuery;
      if (beneficiaryId) {
        beneficiariesQuery = `
          SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            1 as count
          FROM beneficiaries 
          WHERE created_at >= ? AND id = ?
          GROUP BY DATE_FORMAT(created_at, '%Y-%m')
          ORDER BY month
        `;
      } else {
        beneficiariesQuery = `
          SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            COUNT(*) as count
          FROM beneficiaries 
          WHERE created_at >= ?
          GROUP BY DATE_FORMAT(created_at, '%Y-%m')
          ORDER BY month
        `;
      }
      const beneficiariesParams = beneficiaryId 
        ? [startDate, beneficiaryId]
        : [startDate];
      const beneficiariesResult = await getPromisePool().query(beneficiariesQuery, beneficiariesParams);

      // Get monthly seedlings distributed
      const seedlingsQuery = `
        SELECT 
          DATE_FORMAT(date_received, '%Y-%m') as month,
          SUM(received_seedling) as count
        FROM coffee_seedlings 
        WHERE date_received >= ? ${beneficiaryFilter}
        GROUP BY DATE_FORMAT(date_received, '%Y-%m')
        ORDER BY month
      `;
      const seedlingsParams = beneficiaryId 
        ? [startDate, ...beneficiaryParams]
        : [startDate];
      const seedlingsResult = await getPromisePool().query(seedlingsQuery, seedlingsParams);

      // Get monthly crop status data (filter directly by beneficiary using beneficiary_id)
      let cropsQuery;
      let cropsParams;
      if (beneficiaryId) {
        cropsQuery = `
          SELECT 
            DATE_FORMAT(css.survey_date, '%Y-%m') as month,
            SUM(css.alive_crops) as alive_count,
            SUM(css.dead_crops) as dead_count
          FROM crop_survey_status css
          WHERE css.survey_date >= ?
            AND css.beneficiary_id = (SELECT beneficiary_id FROM beneficiaries WHERE id = ?)
          GROUP BY DATE_FORMAT(css.survey_date, '%Y-%m')
          ORDER BY month
        `;
        cropsParams = [startDate, beneficiaryId];
      } else {
        cropsQuery = `
          SELECT 
            DATE_FORMAT(survey_date, '%Y-%m') as month,
            SUM(alive_crops) as alive_count,
            SUM(dead_crops) as dead_count
          FROM crop_survey_status 
          WHERE survey_date >= ?
          GROUP BY DATE_FORMAT(survey_date, '%Y-%m')
          ORDER BY month
        `;
        cropsParams = [startDate];
      }
      const cropsResult = await getPromisePool().query(cropsQuery, cropsParams);

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

  static async getRecentActivities(limit = 10) {
    try {
      const activities = [];

      // Get recent beneficiaries
      const beneficiariesResult = await getPromisePool().query(`
        SELECT 
          'beneficiary' as type,
          CONCAT('New beneficiary ', first_name, ' ', last_name, ' added.') as action,
          created_at as timestamp
        FROM beneficiaries 
        ORDER BY created_at DESC
        LIMIT ?
      `, [limit]);

      // Get recent seedling distributions
      const seedlingsResult = await getPromisePool().query(`
        SELECT 
          'seedling' as type,
          CONCAT('Seedling distribution: ', received_seedling, ' received, ', planted_seedling, ' planted for beneficiary ', cs.beneficiary_id) as action,
          cs.date_received as timestamp
        FROM coffee_seedlings cs
        ORDER BY cs.date_received DESC, cs.seedling_id DESC
        LIMIT ?
      `, [limit]);

      // Get recent crop status updates
      const cropStatusResult = await getPromisePool().query(`
        SELECT 
          'crop' as type,
          CONCAT('Crop survey: ', alive_crops, ' alive, ', dead_crops, ' dead - surveyed by ', surveyer) as action,
          survey_date as timestamp
        FROM crop_survey_status
        ORDER BY survey_date DESC, created_at DESC
        LIMIT ?
      `, [limit]);

      // Get recent farm plots
      const farmPlotsResult = await getPromisePool().query(`
        SELECT 
          'plot' as type,
          CONCAT('Farm plot ', plot_id, ' added for beneficiary ', beneficiary_id) as action,
          plot_id as timestamp_fallback
        FROM farm_plots
        ORDER BY plot_id DESC
        LIMIT ?
      `, [limit]);

      // Combine all activities
      activities.push(...beneficiariesResult[0]);
      activities.push(...seedlingsResult[0]);
      activities.push(...cropStatusResult[0]);
      activities.push(...farmPlotsResult[0]);

      // Sort by timestamp (most recent first)
      activities.sort((a, b) => {
        const dateA = new Date(a.timestamp || 0);
        const dateB = new Date(b.timestamp || 0);
        return dateB - dateA;
      });

      // Return only the requested limit
      return activities.slice(0, limit).map((activity, index) => ({
        id: index + 1,
        type: activity.type,
        action: activity.action,
        timestamp: activity.timestamp,
        user: 'Admin' // Default user, can be enhanced with actual user tracking
      }));
    } catch (error) {
      throw new Error('Failed to fetch recent activities: ' + error.message);
    }
  }
}

module.exports = Statistics;
