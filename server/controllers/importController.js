const xlsx = require('xlsx');
const BaseController = require('./baseController');
const Beneficiary = require('../models/Beneficiary');
const { generateBenID } = require('../utils/generateBenID');
const { cleanPurok, parseDateRange, cleanseFarmCoordinates } = require('../utils/data_cleanser');
const { getPromisePool } = require('../config/database');
const path = require('path');
const fs = require('fs').promises;

class ImportController extends BaseController {
  // Step 1: Clean uploaded Excel and generate draft Excel for download
  static async cleanAndDraft(req, res) {
    try {
      if (!req.file) {
        return ImportController.error(res, 'No file uploaded', 400);
      }

      // Parse Excel file
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = xlsx.utils.sheet_to_json(worksheet, { defval: null });

      if (!rawData || rawData.length === 0) {
        return ImportController.error(res, 'Excel file is empty or invalid', 400);
      }

      // Cleanse and validate data
      const { cleanedData, errors } = await ImportController.cleanseData(rawData);

      // Generate clean Excel file
      const cleanWorkbook = xlsx.utils.book_new();
      
      // Create worksheet with cleaned data
      const cleanData = cleanedData.map((row, index) => ({
        'Row': index + 2,
        'First Name': row.firstName,
        'Middle Name': row.middleName || '',
        'Last Name': row.lastName,
        'Purok': row.purok,
        'Gender': row.gender || '',
        'Birth Date': row.birthDate || '',
        'Age': row.age || '',
        'Marital Status': row.maritalStatus || '',
        'Cellphone': row.cellphone || '',
        'Barangay': row.barangay || '',
        'Municipality': row.municipality || '',
        'Province': row.province || '',
        'Received': row.received || '',
        'Planted': row.planted || '',
        'Hectares': row.hectares || '',
        'Date of Planting': row.dateOfPlanting || '',
        'Status': 'Valid'
      }));

      // Add error rows if any
      const errorData = errors.map(err => ({
        'Row': err.row,
        'First Name': err.name?.split(' ')[0] || '',
        'Middle Name': err.name?.split(' ').slice(1, -1).join(' ') || '',
        'Last Name': err.name?.split(' ').slice(-1)[0] || '',
        'Purok': '',
        'Gender': '',
        'Birth Date': '',
        'Age': '',
        'Marital Status': '',
        'Cellphone': '',
        'Barangay': '',
        'Municipality': '',
        'Province': '',
        'Received': '',
        'Planted': '',
        'Hectares': '',
        'Date of Planting': '',
        'Status': 'ERROR: ' + err.errors.join(', ')
      }));

      const allData = [...cleanData, ...errorData].sort((a, b) => a.Row - b.Row);

      const cleanSheet = xlsx.utils.json_to_sheet(allData);
      xlsx.utils.book_append_sheet(cleanWorkbook, cleanSheet, 'Cleaned Data');

      // Generate buffer
      const buffer = xlsx.write(cleanWorkbook, { type: 'buffer', bookType: 'xlsx' });

      // Set response headers for file download
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `cleaned_import_draft_${timestamp}.xlsx`;
      
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Length', buffer.length);
      
      return res.send(buffer);

    } catch (error) {
      console.error('Clean and draft error:', error);
      return ImportController.error(res, 'Clean failed: ' + error.message, 500);
    }
  }

  // Step 2: Parse and process Excel file for preview
  static async bulkImport(req, res) {
    const connection = await getPromisePool().getConnection();
    
    try {
      if (!req.file) {
        return ImportController.error(res, 'No file uploaded', 400);
      }

      // Parse Excel file
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Parse with header row detection - skip merged header rows
      // Look for the row that contains actual column headers like "Name", "Purok", etc.
      const rawData = xlsx.utils.sheet_to_json(worksheet, { 
        defval: null,
        range: 2  // Start reading from row 3 (index 2) to skip title and category headers
      });

      console.log('\n=== Excel Parsing Debug ===');
      console.log('Raw Excel data (first 3 rows):', rawData.slice(0, 3));
      console.log('Total rows parsed:', rawData.length);
      console.log('Column names detected:', rawData.length > 0 ? Object.keys(rawData[0]) : []);

      if (!rawData || rawData.length === 0) {
        return ImportController.error(res, 'Excel file is empty or invalid', 400);
      }

      // Cleanse and validate data
      const { cleanedData, errors } = await ImportController.cleanseData(rawData);

      // Always return preview data with cleansed records
      if (errors.length > 0) {
        return res.json({
          success: true,
          data: {
            previewData: cleanedData,  // Valid rows after cleansing
            errors: errors,            // Invalid rows with errors
            hasErrors: true,
            totalRows: rawData.length,
            validRows: cleanedData.length,
            invalidRows: errors.length
          }
        });
      }

      // If no errors, return preview data for confirmation
      return res.json({
        success: true,
        data: {
          previewData: cleanedData,
          errors: [],
          hasErrors: false,
          totalRows: rawData.length,
          validRows: cleanedData.length,
          invalidRows: 0
        }
      });

    } catch (error) {
      console.error('Bulk import error:', error);
      return ImportController.error(res, 'Import failed: ' + error.message, 500);
    } finally {
      connection.release();
    }
  }

  // Confirm and process the import after user review
  static async confirmImport(req, res) {
    const connection = await getPromisePool().getConnection();
    
    try {
      const { data } = req.body;

      if (!data || !Array.isArray(data) || data.length === 0) {
        return ImportController.error(res, 'No data provided for import', 400);
      }

      // Begin transaction
      await connection.beginTransaction();

      const results = {
        success: [],
        failed: [],
        totalProcessed: 0
      };

      // Process each confirmed row
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        
        console.log(`\n=== Processing Row ${i + 1} ===`);
        console.log('Row data:', JSON.stringify(row, null, 2));
        console.log('Seedling data check:', {
          received: row.received,
          dateReceived: row.dateReceived,
          planted: row.planted,
          plantingStartDate: row.plantingStartDate,
          plantingEndDate: row.plantingEndDate
        });
        
        // Skip invalid or deleted rows
        if (row.isDeleted || row.isValid === false) {
          console.log('Skipping row - isDeleted or isValid=false');
          continue;
        }
        
        try {
          // 1. Create beneficiary record (TABLE: beneficiaries)
          const beneficiaryData = {
            beneficiaryId: await generateBenID(),
            firstName: row.firstName,
            middleName: row.middleName,
            lastName: row.lastName,
            purok: row.purok,
            barangay: row.barangay || 'Unknown',
            municipality: row.municipality || 'Unknown',
            province: row.province || 'Unknown',
            gender: row.gender || null,
            birthDate: row.birthDate || null,
            age: row.age || null,
            maritalStatus: row.maritalStatus || null,
            cellphone: row.cellphone || null
          };

          await Beneficiary.create(beneficiaryData);

          // 2. Create coffee seedling record if data exists (TABLE: coffee_seedlings)
          // Check if any seedling data is provided (handle numbers, not just truthy values)
          const hasReceivedData = row.received !== null && row.received !== undefined && row.received !== '';
          const hasPlantedData = row.planted !== null && row.planted !== undefined && row.planted !== '';
          const hasDateReceived = row.dateReceived !== null && row.dateReceived !== undefined && row.dateReceived !== '';
          const hasPlantingDates = (row.plantingStartDate !== null && row.plantingStartDate !== undefined && row.plantingStartDate !== '') || 
                                   (row.plantingEndDate !== null && row.plantingEndDate !== undefined && row.plantingEndDate !== '');
          
          if (hasReceivedData || hasPlantedData || hasDateReceived || hasPlantingDates) {
            const seedlingSQL = `INSERT INTO coffee_seedlings 
              (beneficiary_id, received_seedling, date_received, planted_seedling, date_planting_start, date_planting_end)
              VALUES (?, ?, ?, ?, ?, ?)`;
            
            const seedlingValues = [
              beneficiaryData.beneficiaryId,
              hasReceivedData ? parseInt(row.received) || 0 : 0,
              row.dateReceived || null,
              hasPlantedData ? parseInt(row.planted) || 0 : 0,
              row.plantingStartDate || null,
              row.plantingEndDate || null
            ];
            
            console.log('Inserting seedling record:', seedlingValues);
            await connection.query(seedlingSQL, seedlingValues);
            console.log('✓ Seedling record inserted successfully');
          } else {
            console.log('✗ No seedling data to insert for this beneficiary');
          }

          results.success.push({
            row: row.rowNumber || i + 2,
            name: `${row.firstName} ${row.lastName}`,
            beneficiaryId: beneficiaryData.beneficiaryId
          });

        } catch (error) {
          console.error(`Error processing row ${row.rowNumber || i + 2}:`, error);
          results.failed.push({
            row: row.rowNumber || i + 2,
            name: `${row.firstName || ''} ${row.lastName || ''}`,
            error: error.message
          });
        }

        results.totalProcessed++;
      }

      // Commit transaction
      await connection.commit();

      return res.json({
        success: true,
        data: {
          summary: {
            total: results.totalProcessed,
            success: results.success.length,
            failed: results.failed.length
          },
          successRecords: results.success,
          failedRecords: results.failed
        }
      });

    } catch (error) {
      // Rollback on error
      await connection.rollback();
      console.error('Confirm import error:', error);
      return ImportController.error(res, 'Import failed: ' + error.message, 500);
    } finally {
      connection.release();
    }
  }

  // Data cleansing and validation
  static async cleanseData(rawData) {
    const cleanedData = [];
    const errors = [];

    console.log('\n=== Starting Data Cleansing ===');
    console.log('Total rows to process:', rawData.length);
    console.log('First raw row:', rawData[0]);
    console.log('Column names:', Object.keys(rawData[0] || {}));

    let currentPurok = null; // Track current Purok for merged cells

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const rowNum = i + 4; // Excel row number (row 1-2 are headers, row 3 is column names, data starts at row 4)

      try {
        // Skip empty rows or total rows
        // Handle both standard column names and __EMPTY_ prefixed columns from merged headers
        const nameField = row.Name || row['First Name'] || row.__EMPTY_2;
        
        // Try multiple possible purok column locations
        let purokField = null;
        const possiblePurokKeys = [
          'Purok', 
          'purok', 
          'PUROK',
          'Purok/Sitio', 
          'Sitio',
          '__EMPTY_1',
          '__EMPTY',
          '__EMPTY_0'
        ];
        
        for (const key of possiblePurokKeys) {
          if (row[key] && row[key].toString().trim() !== '') {
            purokField = row[key];
            break;
          }
        }
        
        console.log(`\nProcessing row ${rowNum}:`, {
          Name: nameField,
          Purok: purokField,
          Received: row.Received,
          Planted: row.Planted,
          AllColumns: Object.keys(row),
          AllData: row
        });
        
        if (!nameField || nameField.toString().trim() === '' || 
            nameField.toString().toLowerCase().includes('total') ||
            nameField.toString().toLowerCase().includes('seedling') ||
            nameField.toString().toLowerCase().includes('less')) {
          console.log(`  -> Skipped: Empty or summary row`);
          continue;
        }

        // Handle merged Purok cells - if current row has Purok, update currentPurok
        // Otherwise, use the last known Purok value
        if (purokField && purokField.toString().trim() !== '') {
          currentPurok = cleanPurok(purokField);
          console.log(`  -> New Purok detected: ${currentPurok}`);
        }
        console.log(`  -> Using Purok: ${currentPurok}`);

        let firstName, lastName, middleName;

        // Check if data is already split (from cleaned Excel)
        if (row['First Name'] && row['Last Name']) {
          firstName = ImportController.cleanString(row['First Name']);
          middleName = ImportController.cleanString(row['Middle Name']) || null;
          lastName = ImportController.cleanString(row['Last Name']);
        } else {
          // Parse full name into components (from raw Excel)
          const nameParts = ImportController.cleanString(nameField).split(' ').filter(part => part);
          
          if (nameParts.length === 1) {
            // Single name: treat as first name
            firstName = nameParts[0];
            middleName = null;
            lastName = '';
          } else if (nameParts.length === 2) {
            // Two names: first and last
            firstName = nameParts[0];
            middleName = null;
            lastName = nameParts[1];
          } else if (nameParts.length === 3) {
            // Three names: first, middle, last
            firstName = nameParts[0];
            middleName = nameParts[1];
            lastName = nameParts[2];
          } else {
            // Four or more names: treat first two as first name, last as last name, rest as middle
            firstName = nameParts.slice(0, 2).join(' ');
            lastName = nameParts[nameParts.length - 1];
            middleName = nameParts.length > 3 ? nameParts.slice(2, -1).join(' ') : null;
          }
        }

        // Parse date range for Date of Planting
        const plantingDateRange = parseDateRange(row['Date of Planting'] || row['Date Planted']);
        
        const cleanedRow = {
          // Beneficiary personal info
          firstName,
          middleName,
          lastName,
          purok: currentPurok, // Use tracked Purok value for merged cells
          gender: ImportController.cleanString(row.Gender) || null,
          maritalStatus: ImportController.cleanString(row['Marital Status']) || null,
          birthDate: ImportController.cleanDate(row['Birth Date']) || null,
          age: ImportController.cleanNumber(row.Age) || null,
          cellphone: ImportController.cleanString(row.Cellphone) || null,
          barangay: ImportController.cleanString(row.Barangay) || null,
          municipality: ImportController.cleanString(row.Municipality) || null,
          province: ImportController.cleanString(row.Province) || null,
          
          // Coffee seedling data
          received: ImportController.cleanNumber(row.Received),
          planted: ImportController.cleanNumber(row.Planted),
          hectares: ImportController.cleanNumber(row.Hectares),
          plantingStartDate: plantingDateRange.start_date,
          plantingEndDate: plantingDateRange.end_date,
          dateReceived: ImportController.cleanDate(row['Date Received']) || null
        };

        console.log('  Cleaned row:', cleanedRow);

        // Skip rows marked with ERROR status
        if (row.Status && row.Status.toString().startsWith('ERROR')) {
          console.log('  -> Skipped: Has ERROR status');
          continue;
        }

        // Validate required fields
        const validationErrors = [];
        if (!cleanedRow.firstName || !cleanedRow.lastName) {
          validationErrors.push('First name and last name are required');
        }
        if (!cleanedRow.purok) {
          validationErrors.push('Purok is required');
        }
        if (cleanedRow.received && cleanedRow.planted && cleanedRow.planted > cleanedRow.received) {
          validationErrors.push('Planted cannot exceed Received');
        }

        if (validationErrors.length > 0) {
          console.log('  -> Validation failed:', validationErrors);
          errors.push({
            row: rowNum,
            name: `${firstName} ${lastName}`,
            errors: validationErrors
          });
        } else {
          console.log('  -> Valid! Added to cleanedData');
          cleanedData.push(cleanedRow);
        }

      } catch (error) {
        console.log(`  -> Error:`, error.message);
        errors.push({
          row: rowNum,
          name: row.Name || row['First Name'] || 'Unknown',
          errors: [error.message]
        });
      }
    }

    console.log('\n=== Cleansing Complete ===');
    console.log('Cleaned data count:', cleanedData.length);
    console.log('Errors count:', errors.length);
    console.log('Sample cleaned data:', cleanedData[0]);

    return { cleanedData, errors };
  }

  // Helper: Clean string values
  static cleanString(value) {
    if (!value) return null;
    return value.toString().trim();
  }

  // Helper: Clean number values
  static cleanNumber(value) {
    if (!value) return null;
    const cleaned = value.toString().replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  // Helper: Clean date values
  static cleanDate(value) {
    if (!value) return null;
    
    try {
      // Handle Excel date serial numbers
      if (typeof value === 'number') {
        const date = xlsx.SSF.parse_date_code(value);
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
      }
      
      // Handle date strings
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (error) {
      console.error('Date parsing error:', error);
    }
    
    return null;
  }

  // Step 3: Import farm coordinates from Excel
  static async importFarmCoordinates(req, res) {
    const connection = await getPromisePool().getConnection();
    
    try {
      if (!req.file) {
        return ImportController.error(res, 'No file uploaded', 400);
      }

      console.log('\n=== Farm Coordinates Import ===');
      console.log('File received:', req.file.originalname);

      // Parse Excel file - read all rows as raw arrays
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to array of arrays (rows) to preserve structure
      const rawRows = xlsx.utils.sheet_to_json(worksheet, { 
        header: 1,  // Return array of arrays instead of objects
        defval: null,
        raw: false  // Get formatted strings
      });

      console.log('Total rows read:', rawRows.length);
      console.log('First 5 rows:', rawRows.slice(0, 5));

      // Use the cleanseFarmCoordinates utility
      const cleanedCoordinates = cleanseFarmCoordinates(rawRows);

      console.log('Cleaned coordinates count:', cleanedCoordinates.length);
      console.log('Sample cleaned data:', cleanedCoordinates.slice(0, 3));

      // Group by farmer/plot for preview
      const plotsMap = new Map();
      const coordinatesList = [];

      cleanedCoordinates.forEach((coord, index) => {
        const plotKey = coord.plot_id || `plot_${index}`;
        
        // Add unique plot info
        if (!plotsMap.has(plotKey)) {
          plotsMap.set(plotKey, {
            plotId: coord.plot_id,
            beneficiaryName: coord.farmer_name,
            beneficiaryId: '', // Will be matched on frontend
            plotNumber: '',
            hectares: ''
          });
        }
        
        // Add coordinate point
        coordinatesList.push({
          plotId: coord.plot_id,
          beneficiaryName: coord.farmer_name,
          beneficiaryId: '', // Will be matched on frontend
          pointNumber: coord.point_order,
          latitude: coord.latitude,
          longitude: coord.longitude,
          elevation: coord.elevation
        });
      });

      const previewData = coordinatesList;

      console.log('Preview data prepared:', previewData.length, 'coordinate points');

      return res.json({
        success: true,
        data: {
          previewData: previewData,
          errors: [],
          hasErrors: false,
          totalRows: rawRows.length,
          validRows: cleanedCoordinates.length,
          invalidRows: 0
        }
      });

    } catch (error) {
      console.error('Farm coordinates import error:', error);
      return ImportController.error(res, 'Import failed: ' + error.message, 500);
    } finally {
      connection.release();
    }
  }
}

module.exports = ImportController;
