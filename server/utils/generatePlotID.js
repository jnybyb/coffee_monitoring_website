const { getPromisePool } = require('../config/database');

/**
 * Generate plot ID with format BXXX-PLYY (e.g., B001-PL01, B002-PL02, B001-PL02)
 * Where BXXX is the beneficiary ID number and PLYY is the plot number for that beneficiary
 * @param {string} beneficiaryId - The beneficiary ID (e.g., BEN-001)
 * @returns {Promise<string>} Generated plot ID
 */
const generatePlotID = async (beneficiaryId) => {
  try {
    // Extract the number part from beneficiary ID (e.g., 'BEN-001' -> '001')
    const beneficiaryNumber = beneficiaryId.substring(4);
    
    // Get the highest plot number for this beneficiary by checking plot_id
    const [rows] = await getPromisePool().query(
      `SELECT plot_id FROM farm_plots 
       WHERE beneficiary_id = ? 
       AND plot_id LIKE ?
       ORDER BY CAST(SUBSTRING(plot_id, LOCATE('-PL', plot_id) + 3) AS UNSIGNED) DESC 
       LIMIT 1`,
      [beneficiaryId, `B${beneficiaryNumber}-PL%`]
    );
    
    let nextPlotNumber = 1;
    
    if (rows.length > 0 && rows[0].plot_id) {
      const lastPlotId = rows[0].plot_id;
      // Find the position of '-PL' and extract the number after it
      const plPosition = lastPlotId.indexOf('-PL');
      if (plPosition !== -1) {
        const plotNumberPart = lastPlotId.substring(plPosition + 3); // +3 to skip '-PL'
        const lastNumber = parseInt(plotNumberPart, 10);
        
        if (!isNaN(lastNumber)) {
          nextPlotNumber = lastNumber + 1;
        }
      }
    }
    
    // Format with leading zeros to ensure 2 digits (e.g., 01, 02, ..., 99)
    let formattedPlotNumber = nextPlotNumber.toString().padStart(2, '0');
    let plotId = `B${beneficiaryNumber}-PL${formattedPlotNumber}`;
    
    // Check if this plot ID already exists, and if so, increment until we find a unique one
    let idExists = true;
    let attempts = 0;
    while (idExists && attempts < 100) { // Prevent infinite loop
      const [existingRows] = await getPromisePool().query(
        'SELECT plot_id FROM farm_plots WHERE plot_id = ?',
        [plotId]
      );
      
      if (existingRows.length === 0) {
        idExists = false; // ID is unique
      } else {
        // ID exists, increment and try again
        nextPlotNumber++;
        formattedPlotNumber = nextPlotNumber.toString().padStart(2, '0');
        plotId = `B${beneficiaryNumber}-PL${formattedPlotNumber}`;
        attempts++;
      }
    }
    
    // If we've tried 100 times and still have conflicts, throw an error
    if (idExists) {
      throw new Error('Unable to generate unique plot ID after 100 attempts');
    }
    
    // Return BXXX-PLYY format
    return plotId;
  } catch (error) {
    console.error('Error generating plot ID:', error);
    throw new Error('Failed to generate plot ID: ' + error.message);
  }
};

module.exports = {
  generatePlotID
};