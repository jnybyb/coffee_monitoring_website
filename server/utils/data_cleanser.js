// Data Cleanser Utility Functions
const XLSX = require('xlsx');
const ExcelJS = require('exceljs');

// ---------- Helpers (cleaning) ----------
function titleCase(s) {
  if (!s) return s;
  return s.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()).replace(/\s+/g,' ').trim();
}

function cleanPurok(value) {
  if (!value) return null;
  const str = value.toString().trim();
  
  // If it's already in "Purok X" format, just clean it
  if (str.toLowerCase().startsWith('purok')) {
    return titleCase(str);
  }
  
  // If it's just a number, convert to "Purok X"
  if (/^\d+$/.test(str)) {
    return `Purok ${str}`;
  }
  
  // If it's a sitio or other name, return as-is with title case
  return titleCase(str);
}

function parseName(fullName) {
  if (!fullName) return { first_name: '', middle_name: '', last_name: '' };
  // remove unwanted chars
  const cleaned = fullName.replace(/\//g, ' ').replace(/\+/g, ' ').replace(/\s+/g, ' ').trim();
  const parts = cleaned.split(' ');
  if (parts.length === 1) return { first_name: titleCase(parts[0]), middle_name: '', last_name: '' };
  if (parts.length === 2) return { first_name: titleCase(parts[0]), middle_name: '', last_name: titleCase(parts[1]) };
  // >2 parts: assume first is first, last is last, middle is join of between
  const first = parts.shift();
  const last = parts.pop();
  const middle = parts.join(' ');
  return { first_name: titleCase(first), middle_name: titleCase(middle), last_name: titleCase(last) };
}

function sumNumericExpression(val) {
  if (val === undefined || val === null) return null;
  if (typeof val === 'number') return val;
  const s = String(val).trim().replace(/,/g, '');
  // '500 + 500' or '500-250' etc
  if (/^\d+(\s*[\+\-xX*\/]\s*\d+)+$/.test(s)) {
    try {
      // safe evaluate only digits and + - * / x X
      const safe = s.replace(/x/gi, '*');
      // eslint-disable-next-line no-eval
      const v = eval(safe);
      return Number.isFinite(v) ? v : null;
    } catch (e) {
      return null;
    }
  }
  // if it's a single number
  if (/^\d+(\.\d+)?$/.test(s)) return Number(s);
  return null;
}

function propagateColumnDown(rows, colName) {
  let last = null;
  rows.forEach(row => {
    if (row[colName] !== undefined && row[colName] !== null && String(row[colName]).trim() !== '') {
      last = String(row[colName]).trim();
      row[colName] = last;
    } else {
      row[colName] = last;
    }
  });
}

function parseDateRange(raw) {
  if (!raw) return { start_date: null, end_date: null };
  const s = String(raw).trim();
  // Examples:
  // "Jan 19-25, 2025"
  // "Jan 20-27"
  // "Jan 25-28, 2025"
  // "Jan 23-28, 2025"
  // "2025-01-19" (single date)
  // Approach: try to match Month day-day (optional year)
  const monthNameMap = {
    jan: 1, feb:2, mar:3, apr:4, may:5, jun:6, jul:7, aug:8, sep:9, sept:9, oct:10, nov:11, dec:12
  };
  const regex = /([A-Za-z]+)\s+(\d{1,2})\s*[-–]\s*(\d{1,2})(?:,\s*(\d{4}))?/i;
  const match = s.match(regex);
  if (match) {
    const month = match[1].toLowerCase();
    const d1 = parseInt(match[2], 10);
    const d2 = parseInt(match[3], 10);
    const year = match[4] ? parseInt(match[4], 10) : (new Date()).getFullYear();
    const mnum = monthNameMap[month.substring(0,3)];
    if (mnum) {
      const pad = n => (n<10? '0'+n: ''+n);
      const start = `${year}-${pad(mnum)}-${pad(d1)}`;
      const end = `${year}-${pad(mnum)}-${pad(d2)}`;
      return { start_date: start, end_date: end };
    }
  }
  // Try single date like "Jan 23, 2025"
  const regex2 = /([A-Za-z]+)\s+(\d{1,2})(?:,\s*(\d{4}))?/i;
  const m2 = s.match(regex2);
  if (m2) {
    const month = m2[1].toLowerCase();
    const d = parseInt(m2[2], 10);
    const year = m2[3] ? parseInt(m2[3],10) : (new Date()).getFullYear();
    const mnum = monthNameMap[month.substring(0,3)];
    if (mnum) {
      const pad = n => (n<10? '0'+n: ''+n);
      const date = `${year}-${pad(mnum)}-${pad(d)}`;
      return { start_date: date, end_date: date };
    }
  }
  // If raw looks like yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return { start_date: s, end_date: s };
  }
  return { start_date: null, end_date: null };
}

/**
 * Convert DMS (Degrees Minutes Seconds) string to decimal degrees
 * Example: 7°15'50.01"N → 7.263891
 * @param {string} dmsStr - DMS format string (e.g., "7°15'50.01\"N")
 * @returns {number|null} - Decimal degrees or null if invalid
 */
function dmsToDecimal(dmsStr) {
  if (!dmsStr || typeof dmsStr !== 'string') return null;
  
  // Regex to extract: degrees, minutes, seconds, direction
  const pattern = /(\d+)°(\d+)'([\d.]+)\"?([NSEW])/;
  const match = dmsStr.trim().match(pattern);
  
  if (!match) return null;
  
  const degrees = parseFloat(match[1]);
  const minutes = parseFloat(match[2]);
  const seconds = parseFloat(match[3]);
  const direction = match[4];
  
  let decimal = degrees + minutes/60 + seconds/3600;
  
  // South and West coordinates are negative
  if (direction === 'S' || direction === 'W') {
    decimal *= -1;
  }
  
  return Math.round(decimal * 100000000) / 100000000; // Round to 8 decimal places
}

/**
 * Cleanse farm coordinates Excel data
 * Expects rows with farmer names (#21 NOLI MAGNO) followed by coordinate rows
 * @param {Array} rows - Array of row arrays from Excel
 * @returns {Array} - Array of cleaned coordinate objects
 */
function cleanseFarmCoordinates(rows) {
  const cleanRows = [];
  
  let currentFarmer = null;
  let currentPlotId = null;
  let pointOrder = 1;
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    // Convert row cells to strings, handle nulls
    const r = row.map(cell => cell === null || cell === undefined ? '' : String(cell).trim());
    
    // Detect farmer name rows: "#21  NOLI MAGNO" or "21  NOLI MAGNO"
    const farmerMatch = r[0].match(/^#?(\d+)\s+(.+)/);
    if (farmerMatch) {
      const beneficiaryId = farmerMatch[1];
      const farmerName = farmerMatch[2].trim();
      
      currentFarmer = farmerName;
      currentPlotId = `PLOT-${beneficiaryId.padStart(5, '0')}`;
      pointOrder = 1; // Reset point order for new plot
      
      continue;
    }
    
    // Detect coordinate rows
    // Expect: index | latitude | longitude | elevation
    if (r.length >= 3 && 
        (r[1].endsWith('N') || r[1].endsWith('S')) && 
        (r[2].endsWith('E') || r[2].endsWith('W'))) {
      
      const latDms = r[1];
      const lonDms = r[2];
      const elevation = r[3] && r[3] !== '' ? r[3] : null;
      
      const latDecimal = dmsToDecimal(latDms);
      const lonDecimal = dmsToDecimal(lonDms);
      
      if (latDecimal !== null && lonDecimal !== null) {
        cleanRows.push({
          plot_id: currentPlotId,
          farmer_name: currentFarmer,
          point_order: pointOrder,
          latitude: latDecimal,
          longitude: lonDecimal,
          elevation: elevation
        });
        
        pointOrder++;
      }
    }
  }
  
  return cleanRows;
}

// Export utility functions
module.exports = {
  titleCase,
  cleanPurok,
  parseName,
  sumNumericExpression,
  propagateColumnDown,
  parseDateRange,
  dmsToDecimal,
  cleanseFarmCoordinates
};
