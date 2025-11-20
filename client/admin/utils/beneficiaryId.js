import { beneficiariesAPI } from '../services/api';

/**
 * Generate beneficiary ID by calling the server API
 * @returns {Promise<string>} Generated beneficiary ID (e.g., BEN-001, BEN-002, etc.)
 */
const generateBeneficiaryId = async () => {
  try {
    const response = await beneficiariesAPI.generateId();
    return response.beneficiaryId;
  } catch (error) {
    console.error('Error generating beneficiary ID:', error);
    throw error;
  }
};

export { generateBeneficiaryId };
