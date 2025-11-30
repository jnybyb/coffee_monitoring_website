const { getPromisePool } = require('../config/database');

class Seedling {
  static async findAll() {
    const [rows] = await getPromisePool().query('SELECT * FROM coffee_seedlings ORDER BY date_planting_start DESC, seedling_id DESC');
    return rows.map(r => ({
      id: r.seedling_id,
      beneficiaryId: r.beneficiary_id,
      received: r.received_seedling || 0,
      dateReceived: r.date_received,
      planted: r.planted_seedling || 0,
      plotId: r.plot_id || null,
      dateOfPlantingStart: r.date_planting_start,
      dateOfPlantingEnd: r.date_planting_end || null
    }));
  }

  static async findById(id) {
    const [rows] = await getPromisePool().query('SELECT * FROM coffee_seedlings WHERE seedling_id = ?', [id]);
    if (!rows.length) return null;
    
    const r = rows[0];
    return {
      id: r.seedling_id,
      beneficiaryId: r.beneficiary_id,
      received: r.received_seedling || 0,
      dateReceived: r.date_received,
      planted: r.planted_seedling || 0,
      plotId: r.plot_id || null,
      dateOfPlantingStart: r.date_planting_start,
      dateOfPlantingEnd: r.date_planting_end || null
    };
  }

  static async create(seedlingData) {
    const dateStart = seedlingData.dateOfPlantingStart || seedlingData.dateOfPlanting || null;
    const dateEnd = seedlingData.dateOfPlantingEnd || null;
    
    // Ensure proper date formatting for dateReceived
    let dateReceived = new Date().toISOString().split('T')[0]; // Default to today
    if (seedlingData.dateReceived && seedlingData.dateReceived.trim() !== '') {
      try {
        // Convert any date format to YYYY-MM-DD
        const date = new Date(seedlingData.dateReceived);
        if (!isNaN(date.getTime())) {
          dateReceived = date.toISOString().split('T')[0];
        }
      } catch (error) {
        console.error('Error parsing dateReceived:', error);
      }
    }
    
    // Validate and convert numeric fields with proper error handling
    const received = parseInt(seedlingData.received);
    const planted = parseInt(seedlingData.planted);
    
    // Check for invalid numeric values
    if (isNaN(received) || received <= 0) {
      throw new Error('Received seedlings must be a valid positive number');
    }
    if (isNaN(planted) || planted <= 0) {
      throw new Error('Planted seedlings must be a valid positive number');
    }
    
    // Validate that planted doesn't exceed received
    if (planted > received) {
      throw new Error('Planted seedlings cannot exceed received seedlings');
    }
    
    const sql = `INSERT INTO coffee_seedlings 
      (beneficiary_id, received_seedling, date_received, planted_seedling, plot_id, date_planting_start, date_planting_end)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      seedlingData.beneficiaryId,
      received,
      dateReceived,
      planted,
      seedlingData.plotId || null,
      dateStart,
      dateEnd
    ];
    
    const [result] = await getPromisePool().query(sql, params);
    return result.insertId;
  }

  static async update(id, seedlingData) {
    const dateStart = seedlingData.dateOfPlantingStart || seedlingData.dateOfPlanting || null;
    const dateEnd = seedlingData.dateOfPlantingEnd || null;
    
    // Ensure proper date formatting for dateReceived
    let dateReceived = new Date().toISOString().split('T')[0]; // Default to today
    if (seedlingData.dateReceived && seedlingData.dateReceived.trim() !== '') {
      try {
        // Convert any date format to YYYY-MM-DD
        const date = new Date(seedlingData.dateReceived);
        if (!isNaN(date.getTime())) {
          dateReceived = date.toISOString().split('T')[0];
        }
      } catch (error) {
        console.error('Error parsing dateReceived:', error);
      }
    }
    
    // Validate and convert numeric fields with proper error handling
    const received = parseInt(seedlingData.received);
    const planted = parseInt(seedlingData.planted);
    
    // Check for invalid numeric values
    if (isNaN(received) || received <= 0) {
      throw new Error('Received seedlings must be a valid positive number');
    }
    if (isNaN(planted) || planted <= 0) {
      throw new Error('Planted seedlings must be a valid positive number');
    }
    
    // Validate that planted doesn't exceed received
    if (planted > received) {
      throw new Error('Planted seedlings cannot exceed received seedlings');
    }
    
    const sql = `UPDATE coffee_seedlings SET 
      beneficiary_id = ?, received_seedling = ?, date_received = ?, planted_seedling = ?, plot_id = ?, date_planting_start = ?, date_planting_end = ?
      WHERE seedling_id = ?`;
    const params = [
      seedlingData.beneficiaryId,
      received,
      dateReceived,
      planted,
      seedlingData.plotId || null,
      dateStart,
      dateEnd,
      id
    ];
    
    const [result] = await getPromisePool().query(sql, params);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await getPromisePool().query('DELETE FROM coffee_seedlings WHERE seedling_id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Seedling;
