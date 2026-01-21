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
      const provincesData = await AddressController.fetchWithRetry('https://psgc.cloud/api/v2/provinces');
      const citiesMunicipalitiesData = await AddressController.fetchWithRetry('https://psgc.cloud/api/v2/cities-municipalities');
      const barangaysData = await AddressController.fetchWithRetry('https://psgc.cloud/api/v2/barangays');

      const provinceMap = {};

      // Index barangays by province + city/municipality name
      const barangaysMap = new Map();
      for (const barangay of barangaysData) {
        const provinceName = barangay.province && barangay.province.name ? barangay.province.name : barangay.province;
        const cityMunicipalityName =
          barangay.city_municipality && barangay.city_municipality.name
            ? barangay.city_municipality.name
            : barangay.city_municipality;

        if (!provinceName || !cityMunicipalityName || !barangay.name) continue;

        const key = `${provinceName}|||${cityMunicipalityName}`;
        if (!barangaysMap.has(key)) {
          barangaysMap.set(key, []);
        }
        barangaysMap.get(key).push(barangay.name);
      }

      // Sort barangay names for each municipality
      for (const [key, list] of barangaysMap.entries()) {
        list.sort((a, b) => a.localeCompare(b));
        barangaysMap.set(key, list);
      }

      // Initialize provinces
      for (const province of provincesData) {
        if (!province || !province.name) continue;
        const provinceName = province.name;
        if (!provinceMap[provinceName]) {
          provinceMap[provinceName] = {
            province: provinceName,
            municipalities: []
          };
        }
      }

      // Attach cities/municipalities and their barangays to provinces
      for (const city of citiesMunicipalitiesData) {
        if (!city || !city.name) continue;

        const municipalityName = city.name;
        const provinceName = city.province && city.province.name ? city.province.name : city.province;

        if (!provinceName) continue;

        if (!provinceMap[provinceName]) {
          provinceMap[provinceName] = {
            province: provinceName,
            municipalities: []
          };
        }

        const key = `${provinceName}|||${municipalityName}`;
        const barangayNames = barangaysMap.get(key) || [];

        provinceMap[provinceName].municipalities.push({
          name: municipalityName,
          barangays: barangayNames
        });
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
