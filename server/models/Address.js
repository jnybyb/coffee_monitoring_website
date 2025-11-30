const fs = require('fs');
const path = require('path');

class Address {
  static getDataFiles() {
    const dataPath = path.join(__dirname, '..', 'data');
    const files = fs.readdirSync(dataPath);
    return files.filter(file => file.endsWith('.json'));
  }

  static getAllAddressData() {
    const dataPath = path.join(__dirname, '..', 'data');
    const allData = [];
    
    const jsonFiles = this.getDataFiles();
    
    jsonFiles.forEach(file => {
      try {
        const filePath = path.join(dataPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          allData.push(...data);
        }
      } catch (error) {
        console.error(`Error reading ${file}:`, error.message);
      }
    });
    
    return allData;
  }

  static getProvinces() {
    const allData = this.getAllAddressData();
    return [...new Set(allData.map(province => province.province))].sort((a, b) => a.localeCompare(b));
  }

  static getMunicipalities(province) {
    const allData = this.getAllAddressData();
    const provinceData = allData.find(p => p.province === province);
    
    if (provinceData && Array.isArray(provinceData.municipalities)) {
      return provinceData.municipalities
        .map(m => typeof m === 'string' ? m : (m && m.name ? m.name : null))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));
    }
    
    return [];
  }

  static getBarangays(province, municipality) {
    const allData = this.getAllAddressData();
    const provinceData = allData.find(p => p.province === province);
    
    if (provinceData && Array.isArray(provinceData.municipalities)) {
      const municipalityData = provinceData.municipalities.find(m => 
        (typeof m === 'string' && m === municipality) || 
        (m && m.name && m.name === municipality)
      );
      
      if (municipalityData && Array.isArray(municipalityData.barangays)) {
        return [...municipalityData.barangays].sort((a, b) => a.localeCompare(b));
      }
    }
    
    return [];
  }

  static getMunicipalitiesWithBarangays(province) {
    const allData = this.getAllAddressData();
    const provinceData = allData.find(p => p.province === province);
    
    if (provinceData && Array.isArray(provinceData.municipalities)) {
      return provinceData.municipalities.map(m => ({
        name: m.name,
        barangays: m.barangays
      }));
    }
    
    return [];
  }
}

module.exports = Address;
