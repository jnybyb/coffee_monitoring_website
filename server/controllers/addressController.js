const Address = require('../models/Address');
const fs = require('fs').promises;
const path = require('path');

class AddressController {
  // Get all provinces
  static async getProvinces(req, res) {
    try {
      const provinces = Address.getProvinces();
      res.json(provinces);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get municipalities by province
  static async getMunicipalities(req, res) {
    try {
      const municipalities = Address.getMunicipalities(req.params.province);
      res.json(municipalities);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get barangays by province and municipality
  static async getBarangays(req, res) {
    try {
      const barangays = Address.getBarangays(req.params.province, req.params.municipality);
      res.json(barangays);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get all municipalities with their barangays for a specific province
  static async getMunicipalitiesWithBarangays(req, res) {
    try {
      const { province } = req.params;
      const data = Address.getMunicipalitiesWithBarangays(province);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Helper function to fetch with retry
  static async fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.warn(`Attempt ${i + 1} failed for ${url}:`, error.message);
        if (i === retries - 1) throw error;
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  // Sync all Philippine address data from external API
  static async syncAllAddresses(req, res) {
    try {
      // Fetch provinces
      const provincesData = await AddressController.fetchWithRetry('https://psgc.cloud/api/provinces');
      
      // Group data by province
      const provinceMap = {};
      let processedProvinces = 0;
      
      // Process each province
      for (const province of provincesData) {
        const provinceName = province.name;
        
        try {
          // Initialize province structure
          provinceMap[provinceName] = {
            province: provinceName,
            municipalities: []
          };
          
          // Fetch municipalities for this province
          const municipalitiesUrl = `https://psgc.cloud/api/municipalities?province_code=${province.code}`;
          const municipalitiesData = await AddressController.fetchWithRetry(municipalitiesUrl);
          
          // Process each municipality
          for (const municipality of municipalitiesData) {
            const municipalityName = municipality.name;
            
            try {
              // Fetch barangays for this municipality
              const barangaysUrl = `https://psgc.cloud/api/barangays?municipality_code=${municipality.code}`;
              const barangaysData = await AddressController.fetchWithRetry(barangaysUrl);
              
              // Extract barangay names
              const barangayNames = barangaysData.map(b => b.name);
              
              // Add to province structure
              provinceMap[provinceName].municipalities.push({
                name: municipalityName,
                barangays: barangayNames
              });
            } catch (error) {
              console.warn(`Failed to process municipality ${municipalityName}:`, error.message);
              // Continue with other municipalities
            }
          }
        } catch (error) {
          console.warn(`Failed to process province ${provinceName}:`, error.message);
          // Continue with other provinces
        }
      }
      
      // Save each province to a separate JSON file
      const dataPath = path.join(__dirname, '..', 'data');
      
      // Ensure data directory exists
      await fs.mkdir(dataPath, { recursive: true });
      
      // Write each province to its own file
      for (const [provinceName, provinceData] of Object.entries(provinceMap)) {
        // Convert province name to snake_case for filename
        const fileName = provinceName
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '') + '.json';
        
        const filePath = path.join(dataPath, fileName);
        await fs.writeFile(filePath, JSON.stringify([provinceData], null, 2));
      }
      
      res.json({ 
        success: true, 
        message: `Synced ${Object.keys(provinceMap).length} provinces`,
        provinces: Object.keys(provinceMap)
      });
    } catch (error) {
      console.error('Address sync error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AddressController;