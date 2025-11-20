const { getPromisePool } = require('../config/database');

/**
 * Generate beneficiary ID with format BEN-XXX (e.g., BEN-001, BEN-002, etc.)
 * @returns {Promise<string>} Generated beneficiary ID
 */
const generateBenID = async () => {
  try {
    // Get the highest beneficiary ID number
    const [rows] = await getPromisePool().query(
      `SELECT beneficiary_id FROM beneficiaries 
       WHERE beneficiary_id LIKE 'BEN-%' 
       ORDER BY CAST(SUBSTRING(beneficiary_id, 5) AS UNSIGNED) DESC 
       LIMIT 1`
    );
    
    let nextNumber = 1;
    
    if (rows.length > 0 && rows[0].beneficiary_id) {
      const lastId = rows[0].beneficiary_id;
      // Extract the number part (after 'BEN-')
      const numberPart = lastId.substring(4);
      const lastNumber = parseInt(numberPart, 10);
      
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
    
    // Format with leading zeros to ensure 3 digits (e.g., 001, 002, ..., 999)
    const formattedNumber = nextNumber.toString().padStart(3, '0');
    
    // Return BEN-XXX format
    return `BEN-${formattedNumber}`;
  } catch (error) {
    console.error('Error generating beneficiary ID:', error);
    throw new Error('Failed to generate beneficiary ID: ' + error.message);
  }
};

module.exports = {
  generateBenID
};
