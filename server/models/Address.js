const fs = require('fs');
const path = require('path');

class Address {
  static getProvincesData() {
    const filePath = path.join(__dirname, '..', 'data', 'provinces.json');
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  }

  static getCitiesData() {
    const filePath = path.join(__dirname, '..', 'data', 'cities.json');
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  }

  static getBarangaysData() {
    const filePath = path.join(__dirname, '..', 'data', 'barangays.json');
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  }

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
    const provincesData = this.getProvincesData();
    const names = provincesData
      .map(p => (p && p.name ? String(p.name).trim() : null))
      .filter(Boolean);
    return [...new Set(names)].sort((a, b) => a.localeCompare(b));
  }

  static getLegacyProvinceData(province) {
    if (!province) {
      return null;
    }
    const targetProvince = String(province).trim();
    const allData = this.getAllAddressData();
    return allData.find(p => p && p.province === targetProvince) || null;
  }

  static getMunicipalities(province) {
    if (!province) {
      return [];
    }
    const targetProvince = String(province).trim();
    const citiesData = this.getCitiesData();
    let names = citiesData
      .filter(
        c =>
          c &&
          c.province &&
          String(c.province).trim() === targetProvince &&
          c.name
      )
      .map(c => String(c.name).trim());
    if (!names.length) {
      const provinceData = this.getLegacyProvinceData(targetProvince);
      if (provinceData && Array.isArray(provinceData.municipalities)) {
        names = provinceData.municipalities
          .map(m => (typeof m === 'string' ? m : (m && m.name ? m.name : null)))
          .filter(Boolean);
      }
    }
    return [...new Set(names)].sort((a, b) => a.localeCompare(b));
  }

  static getBarangays(province, municipality) {
    if (!province || !municipality) {
      return [];
    }
    const targetProvince = String(province).trim();
    const targetMunicipality = String(municipality).trim();
    const citiesData = this.getCitiesData();
    const city = citiesData.find(
      c =>
        c &&
        c.province &&
        String(c.province).trim() === targetProvince &&
        c.name &&
        String(c.name).trim() === targetMunicipality &&
        c.code
    );
    const barangaysData = this.getBarangaysData();
    let names = [];
    if (city && city.code) {
      const cityCode = String(city.code);
      const prefix = cityCode.slice(0, 8);
      names = barangaysData
        .filter(
          b =>
            b &&
            b.code &&
            String(b.code).startsWith(prefix) &&
            b.name
        )
        .map(b => String(b.name).trim());
    }
    if (!names.length) {
      const provinceData = this.getLegacyProvinceData(targetProvince);
      if (provinceData && Array.isArray(provinceData.municipalities)) {
        const candidates = [
          targetMunicipality,
          targetMunicipality.startsWith('City of ')
            ? `${targetMunicipality.replace(/^City of\s+/i, '').trim()} City`
            : null,
          targetMunicipality.endsWith(' City')
            ? `City of ${targetMunicipality.replace(/\s+City$/i, '').trim()}`
            : null
        ].filter(Boolean);
        const municipalityData = provinceData.municipalities.find(m => {
          const name = typeof m === 'string' ? m : (m && m.name ? m.name : '');
          const normalized = String(name).trim();
          return candidates.some(c => normalized === c);
        });
        if (municipalityData && Array.isArray(municipalityData.barangays)) {
          names = [...municipalityData.barangays];
        }
      }
    }
    names = names
      .filter(
        n => typeof n === 'string' && n.trim() !== ''
      )
      .map(n => n.trim());
    return [...new Set(names)].sort((a, b) => a.localeCompare(b));
  }

  static getMunicipalitiesWithBarangays(province) {
    if (!province) {
      return [];
    }
    const targetProvince = String(province).trim();
    const citiesData = this.getCitiesData().filter(
      c =>
        c &&
        c.province &&
        String(c.province).trim() === targetProvince &&
        c.name &&
        c.code
    );
    const barangaysData = this.getBarangaysData();

    let result = citiesData.map(city => {
      const cityName = String(city.name).trim();
      const cityCode = String(city.code);
      const prefix = cityCode.slice(0, 8);
      const cityBarangays = barangaysData
        .filter(
          b =>
            b &&
            b.code &&
            String(b.code).startsWith(prefix) &&
            b.name
        )
        .map(b => String(b.name).trim());
      const uniqueBarangays = [...new Set(cityBarangays)].sort((a, b) =>
        a.localeCompare(b)
      );
      return {
        name: cityName,
        barangays: uniqueBarangays
      };
    });

    if (!result.length) {
      const provinceData = this.getLegacyProvinceData(targetProvince);
      if (provinceData && Array.isArray(provinceData.municipalities)) {
        result = provinceData.municipalities.map(m => ({
          name: m && m.name ? m.name : m,
          barangays: Array.isArray(m && m.barangays) ? [...m.barangays] : []
        }));
      }
    }

    return result;
  }
}

module.exports = Address;
