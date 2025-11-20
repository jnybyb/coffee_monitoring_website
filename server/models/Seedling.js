const { getPromisePool } = require('../config/database');

class Seedling {
  static async findAll() {
    const [rows] = await getPromisePool().query('SELECT * FROM seedling_records ORDER BY date_of_planting DESC, created_at DESC');
    return rows.map(r => ({
      id: r.id,
      beneficiaryId: r.beneficiary_id,
      received: r.received || 0,
      dateReceived: r.date_received,
      planted: r.planted || 0,
      hectares: r.hectares ? parseFloat(r.hectares) : 0,
      plot: r.plot,
      dateOfPlantingStart: r.date_of_planting,
      dateOfPlantingEnd: r.date_of_planting_end || null,
      gps: r.gps,
      createdAt: r.created_at
    }));
  }

  static async findById(id) {
    const [rows] = await getPromisePool().query('SELECT * FROM seedling_records WHERE id = ?', [id]);
    if (!rows.length) return null;
    
    const r = rows[0];
    return {
      id: r.id,
      beneficiaryId: r.beneficiary_id,
      received: r.received || 0,
      dateReceived: r.date_received,
      planted: r.planted || 0,
      hectares: r.hectares ? parseFloat(r.hectares) : 0,
      plot: r.plot,
      dateOfPlantingStart: r.date_of_planting,
      dateOfPlantingEnd: r.date_of_planting_end || null,
      gps: r.gps,
      createdAt: r.created_at
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
    const hectares = parseFloat(seedlingData.hectares);
    
    // Check for invalid numeric values
    if (isNaN(received) || received <= 0) {
      throw new Error('Received seedlings must be a valid positive number');
    }
    if (isNaN(planted) || planted <= 0) {
      throw new Error('Planted seedlings must be a valid positive number');
    }
    if (isNaN(hectares) || hectares <= 0) {
      throw new Error('Hectares must be a valid positive number');
    }
    
    // Validate that planted doesn't exceed received
    if (planted > received) {
      throw new Error('Planted seedlings cannot exceed received seedlings');
    }
    
    const sql = `INSERT INTO seedling_records 
      (beneficiary_id, received, date_received, planted, hectares, plot, date_of_planting, date_of_planting_end, gps)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      seedlingData.beneficiaryId,
      received,
      dateReceived,
      planted,
      hectares,
      seedlingData.plot || null,
      dateStart,
      dateEnd,
      seedlingData.gps || null
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
    const hectares = parseFloat(seedlingData.hectares);
    
    // Check for invalid numeric values
    if (isNaN(received) || received <= 0) {
      throw new Error('Received seedlings must be a valid positive number');
    }
    if (isNaN(planted) || planted <= 0) {
      throw new Error('Planted seedlings must be a valid positive number');
    }
    if (isNaN(hectares) || hectares <= 0) {
      throw new Error('Hectares must be a valid positive number');
    }
    
    // Validate that planted doesn't exceed received
    if (planted > received) {
      throw new Error('Planted seedlings cannot exceed received seedlings');
    }
    
    const sql = `UPDATE seedling_records SET 
      beneficiary_id = ?, received = ?, date_received = ?, planted = ?, hectares = ?, plot = ?, date_of_planting = ?, date_of_planting_end = ?, gps = ?
      WHERE id = ?`;
    const params = [
      seedlingData.beneficiaryId,
      received,
      dateReceived,
      planted,
      hectares,
      seedlingData.plot || null,
      dateStart,
      dateEnd,
      seedlingData.gps || null,
      id
    ];
    
    const [result] = await getPromisePool().query(sql, params);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await getPromisePool().query('DELETE FROM seedling_records WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Seedling;
