const { getPromisePool } = require('../config/database');

/**
 * Generate beneficiary ID with format BEN-XXX (e.g., BEN-001, BEN-002, etc.)
 * Checks for missing IDs in the sequence and assigns the first available gap.
 * If no gaps exist, generates the next sequential ID.
 * @returns {Promise<string>} Generated beneficiary ID
 */
const generateBenID = async () => {
  try {
    // Get all existing beneficiary IDs in ascending order
    const [rows] = await getPromisePool().query(
      `SELECT beneficiary_id FROM beneficiaries 
       WHERE beneficiary_id LIKE 'BEN-%' 
       ORDER BY CAST(SUBSTRING(beneficiary_id, 5) AS UNSIGNED) ASC`
    );
    
    // If no beneficiaries exist, start with BEN-001
    if (rows.length === 0) {
      return 'BEN-001';
    }
    
    // Extract all existing ID numbers
    const existingNumbers = rows
      .map(row => {
        const numberPart = row.beneficiary_id.substring(4);
        return parseInt(numberPart, 10);
      })
      .filter(num => !isNaN(num))
      .sort((a, b) => a - b);
    
    // Check for gaps in the sequence
    let nextNumber = null;
    for (let i = 0; i < existingNumbers.length; i++) {
      const expectedNumber = i + 1;
      if (existingNumbers[i] !== expectedNumber) {
        // Found a gap, use this number
        nextNumber = expectedNumber;
        break;
      }
    }
    
    // If no gap found, use the next sequential number
    if (nextNumber === null) {
      nextNumber = existingNumbers[existingNumbers.length - 1] + 1;
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

/**
 * Generate multiple sequential beneficiary IDs
 * Fills gaps in the sequence first, then continues with next available numbers
 * @param {number} count - Number of IDs to generate
 * @returns {Promise<string[]>} Array of generated beneficiary IDs
 */
const generateMultipleBenIDs = async (count) => {
  try {
    // Get all existing beneficiary IDs in ascending order
    const [rows] = await getPromisePool().query(
      `SELECT beneficiary_id FROM beneficiaries 
       WHERE beneficiary_id LIKE 'BEN-%' 
       ORDER BY CAST(SUBSTRING(beneficiary_id, 5) AS UNSIGNED) ASC`
    );
    
    // If no beneficiaries exist, start from BEN-001
    if (rows.length === 0) {
      const beneficiaryIds = [];
      for (let i = 0; i < count; i++) {
        const formattedNumber = (i + 1).toString().padStart(3, '0');
        beneficiaryIds.push(`BEN-${formattedNumber}`);
      }
      return beneficiaryIds;
    }
    
    // Extract all existing ID numbers
    const existingNumbers = rows
      .map(row => {
        const numberPart = row.beneficiary_id.substring(4);
        return parseInt(numberPart, 10);
      })
      .filter(num => !isNaN(num))
      .sort((a, b) => a - b);
    
    const beneficiaryIds = [];
    const existingSet = new Set(existingNumbers);
    let currentNumber = 1;
    
    // Generate the requested number of IDs
    while (beneficiaryIds.length < count) {
      // Check if this number is available (either a gap or next in sequence)
      if (!existingSet.has(currentNumber)) {
        const formattedNumber = currentNumber.toString().padStart(3, '0');
        beneficiaryIds.push(`BEN-${formattedNumber}`);
        existingSet.add(currentNumber); // Mark as used for subsequent iterations
      }
      currentNumber++;
    }
    
    return beneficiaryIds;
  } catch (error) {
    console.error('Error generating multiple beneficiary IDs:', error);
    throw new Error('Failed to generate beneficiary IDs: ' + error.message);
  }
};

/**
 * Find the next available beneficiary ID (checks for gaps)
 * @returns {Promise<string>} Next available beneficiary ID
 */
const findNextAvailableBenID = async () => {
  return await generateBenID();
};

module.exports = {
  generateBenID,
  generateMultipleBenIDs,
  findNextAvailableBenID
};
