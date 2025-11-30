const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const getAuthToken = () => {
  try {
    return localStorage.getItem('auth_token');
  } catch (_) {
    return null;
  }
};

// Helper function to handle API errors
const handleAPIError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    return {
      message: error.response.data?.error || 'Server error occurred',
      status: error.response.status
    };
  } else if (error.request) {
    return {
      message: 'No response from server. Please check your connection.',
      status: 0
    };
  } else {
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0
    };
  }
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401 || response.status === 403) {
        try {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        } catch (_) {}
        if (typeof window !== 'undefined') {
          window.location.replace('/login');
        }
      }
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Handle BaseController response format
    if (result && result.success && result.data !== undefined) {
      return result.data;
    }
    
    return result;
  } catch (error) {
    throw handleAPIError(error);
  }
};

// Generic API request function for file uploads
const apiRequestWithFile = async (endpoint, formData, options = {}) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: options.method || 'POST',
      body: formData,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      },
      ...options
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401 || response.status === 403) {
        try {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        } catch (_) {}
        if (typeof window !== 'undefined') {
          window.location.replace('/login');
        }
      }
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Handle BaseController response format
    if (result && result.success && result.data !== undefined) {
      return result.data;
    }
    
    return result;
  } catch (error) {
    throw handleAPIError(error);
  }
};

// Beneficiaries API
export const beneficiariesAPI = {
  getAll: async () => apiRequest('/beneficiaries'),
  getById: async (id) => apiRequest(`/beneficiaries/${id}`),
  generateId: async () => apiRequest('/beneficiaries/generate-id'),
  generateMultipleIds: async (count) => apiRequest('/beneficiaries/generate-ids', {
    method: 'POST',
    body: JSON.stringify({ count })
  }),
  create: async (beneficiaryData) => {
    const formData = new FormData();
    Object.keys(beneficiaryData).forEach(key => {
      if (key !== 'picture' && beneficiaryData[key] !== null && beneficiaryData[key] !== undefined) {
        formData.append(key, beneficiaryData[key]);
      }
    });
    if (beneficiaryData.picture instanceof File) {
      formData.append('picture', beneficiaryData.picture);
    }
    return apiRequestWithFile('/beneficiaries', formData, { method: 'POST' });
  },
  update: async (id, beneficiaryData) => {
    const formData = new FormData();
    Object.keys(beneficiaryData).forEach(key => {
      if (key !== 'picture' && beneficiaryData[key] !== null && beneficiaryData[key] !== undefined) {
        formData.append(key, beneficiaryData[key]);
      }
    });
    if (beneficiaryData.picture instanceof File) {
      formData.append('picture', beneficiaryData.picture);
    }
    return apiRequestWithFile(`/beneficiaries/${id}`, formData, { method: 'PUT' });
  },
  delete: async (id) => apiRequest(`/beneficiaries/${id}`, { method: 'DELETE' })
};

// Seedlings API
export const seedlingsAPI = {
  getAll: async () => apiRequest('/seedlings'),
  create: async (record) => {
    // Validate numeric fields before sending
    const received = parseInt(record.received);
    const planted = parseInt(record.planted);
    
    if (isNaN(received) || received <= 0) {
      throw new Error('Received seedlings must be a valid positive number');
    }
    if (isNaN(planted) || planted <= 0) {
      throw new Error('Planted seedlings must be a valid positive number');
    }
    if (planted > received) {
      throw new Error('Planted seedlings cannot exceed received seedlings');
    }
    
    // Ensure proper date formatting for dateReceived
    let dateReceived = new Date().toISOString().split('T')[0]; // Default to today
    if (record.dateReceived && record.dateReceived.trim() !== '') {
      try {
        const date = new Date(record.dateReceived);
        if (!isNaN(date.getTime())) {
          dateReceived = date.toISOString().split('T')[0];
        }
      } catch (error) {
        console.error('Error parsing dateReceived:', error);
      }
    }
    
    const payload = {
      beneficiaryId: record.beneficiaryId,
      received,
      dateReceived,
      planted,
      plotId: record.plotId,
      dateOfPlantingStart: record.dateOfPlantingStart || record.dateOfPlanting,
      dateOfPlantingEnd: record.dateOfPlantingEnd || null
    };
    return apiRequest('/seedlings', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  update: async (id, record) => {
    // Validate numeric fields before sending
    const received = parseInt(record.received);
    const planted = parseInt(record.planted);
    
    if (isNaN(received) || received <= 0) {
      throw new Error('Received seedlings must be a valid positive number');
    }
    if (isNaN(planted) || planted <= 0) {
      throw new Error('Planted seedlings must be a valid positive number');
    }
    if (planted > received) {
      throw new Error('Planted seedlings cannot exceed received seedlings');
    }
    
    // Ensure proper date formatting for dateReceived
    let dateReceived = new Date().toISOString().split('T')[0]; // Default to today
    if (record.dateReceived && record.dateReceived.trim() !== '') {
      try {
        const date = new Date(record.dateReceived);
        if (!isNaN(date.getTime())) {
          dateReceived = date.toISOString().split('T')[0];
        }
      } catch (error) {
        console.error('Error parsing dateReceived:', error);
      }
    }
    
    const payload = {
      beneficiaryId: record.beneficiaryId,
      received,
      dateReceived,
      planted,
      plotId: record.plotId,
      dateOfPlantingStart: record.dateOfPlantingStart || record.dateOfPlanting,
      dateOfPlantingEnd: record.dateOfPlantingEnd || null
    };
    return apiRequest(`/seedlings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  delete: async (id) => apiRequest(`/seedlings/${id}`, { method: 'DELETE' })
};

// Crop Status API
export const cropStatusAPI = {
  getAll: async () => apiRequest('/crop-status'),
  getById: async (id) => apiRequest(`/crop-status/${id}`),
  create: async (record) => {
    const formData = new FormData();
    formData.append('surveyDate', record.surveyDate);
    formData.append('surveyer', record.surveyer);
    formData.append('beneficiaryId', record.beneficiaryId);
    formData.append('aliveCrops', record.aliveCrops);
    formData.append('deadCrops', record.deadCrops ?? 0);
    if (record.plot !== undefined && record.plot !== null) {
      formData.append('plot', record.plot);
    }
    if (Array.isArray(record.pictures)) {
      record.pictures.forEach(file => {
        if (file instanceof File) formData.append('pictures', file);
      });
    }
    return apiRequestWithFile('/crop-status', formData, { method: 'POST' });
  },
  update: async (id, record) => {
    const formData = new FormData();
    formData.append('surveyDate', record.surveyDate);
    formData.append('surveyer', record.surveyer);
    formData.append('beneficiaryId', record.beneficiaryId);
    formData.append('aliveCrops', record.aliveCrops);
    formData.append('deadCrops', record.deadCrops ?? 0);
    if (record.plot !== undefined && record.plot !== null) {
      formData.append('plot', record.plot);
    }
    
    // Handle existing pictures for edit mode
    if (record.existingPictures && Array.isArray(record.existingPictures)) {
      formData.append('existingPictures', JSON.stringify(record.existingPictures));
    }
    
    // Handle new pictures
    if (Array.isArray(record.pictures)) {
      record.pictures.forEach(file => {
        if (file instanceof File) formData.append('pictures', file);
      });
    }
    return apiRequestWithFile(`/crop-status/${id}`, formData, { method: 'PUT' });
  },
  delete: async (id) => apiRequest(`/crop-status/${id}`, { method: 'DELETE' })
};

// Farm Plots API
export const farmPlotsAPI = {
  getAll: async () => apiRequest('/farm-plots'),
  getById: async (id) => apiRequest(`/farm-plots/${id}`),
  create: async (farmPlotData) => apiRequest('/farm-plots', { method: 'POST', body: JSON.stringify(farmPlotData) }),
  update: async (id, farmPlotData) => apiRequest(`/farm-plots/${id}`, { method: 'PUT', body: JSON.stringify(farmPlotData) }),
  delete: async (id) => apiRequest(`/farm-plots/${id}`, { method: 'DELETE' })
};

// Philippine Addresses API
export const addressesAPI = {
  getProvinces: async () => apiRequest('/addresses/provinces'),
  getMunicipalities: async (province) => apiRequest(`/addresses/municipalities/${encodeURIComponent(province)}`),
  getBarangays: async (province, municipality) => apiRequest(`/addresses/barangays/${encodeURIComponent(province)}/${encodeURIComponent(municipality)}`),
  syncAddresses: async (addresses) => apiRequest('/addresses/sync', {
    method: 'POST',
    body: JSON.stringify({ addresses })
  })
};

// Statistics API
export const statisticsAPI = {
  getDashboardStats: async () => apiRequest('/statistics'),
  getChartData: async () => apiRequest('/statistics/chart-data'),
  getRecentActivities: async (limit = 10) => apiRequest(`/statistics/recent-activities?limit=${limit}`)
};

// Test API connection
export const testAPI = async () => apiRequest('/health');

export { handleAPIError }; 

// Auth API
export const authAPI = {
  login: async (username, password) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  }),
  me: async () => apiRequest('/auth/me')
};

// Import API
export const importAPI = {
  // Upload raw Excel and get cleaned preview data
  uploadAndClean: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequestWithFile('/import/bulk', formData, { method: 'POST' });
  },
  // Upload farm coordinates Excel and get cleaned preview data
  uploadFarmCoordinates: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequestWithFile('/import/farm-coordinates', formData, { method: 'POST' });
  },
  // Confirm and save the imported data
  confirmImport: async (data) => apiRequest('/import/confirm', {
    method: 'POST',
    body: JSON.stringify({ data })
  })
};