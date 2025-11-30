// Excel/CSV Export Utility for Reports

// Format timestamp for export
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Get activity title
const getActivityTitle = (type) => {
  switch (type) {
    case 'beneficiary':
      return 'Coffee Beneficiary';
    case 'crop':
      return 'Crop Survey Status';
    case 'seedling':
      return 'Seedling Record';
    case 'plot':
      return 'Farm Monitoring';
    case 'report':
      return 'Reports';
    default:
      return 'Reports';
  }
};

// Headers map for each tab
const headersMap = {
  'Beneficiary List': ['Beneficiary ID', 'Full Name', 'Gender', 'Marital Status', 'Birth Date', 'Age', 'Cellphone', 'Address'],
  'Farm Location': ['Plot ID', 'Beneficiary', 'Hectares', 'Address', 'Coordinates'],
  'Seedling Record': ['Beneficiary ID', 'Received', 'Date Received', 'Planted', 'Plot ID', 'Planting Date', 'End Date'],
  'Crop Survey Status': ['Beneficiary ID', 'Beneficiary Name', 'Survey Date', 'Surveyer Name', 'Alive Crops', 'Dead Crops', 'Plot'],
  'Recent Activities': ['Type', 'Action', 'Timestamp', 'User']
};

// Get cell value by attribute ID
const getCellValueByAttribute = (item, attrId) => {
  switch (attrId) {
    // Beneficiary List
    case 'ben_id':
      return item.beneficiaryId || '—';
    case 'ben_fullname':
      return `${item.firstName || ''} ${item.middleName || ''} ${item.lastName || ''}`.trim() || '—';
    case 'ben_gender':
      return item.gender || '—';
    case 'ben_birthdate':
      return item.birthDate ? new Date(item.birthDate).toLocaleDateString() : '—';
    case 'ben_age':
      return item.age || '—';
    case 'ben_cellphone':
      return item.cellphone || '—';
    case 'ben_address':
      const benAddress = [item.purok, item.barangay, item.municipality, item.province]
        .filter(part => part && part.trim() !== '' && part.toLowerCase() !== 'unknown')
        .join(', ');
      return benAddress || '—';
    case 'ben_marital':
      return item.maritalStatus || '—';
    
    // Farm Location
    case 'farm_plot_id':
      return item.id || '—';
    case 'farm_beneficiary':
      return item.beneficiaryName || '—';
    case 'farm_hectares':
      return item.hectares || '—';
    case 'farm_address':
      return item.address || '—';
    case 'farm_coordinates':
      return `${item.coordinates?.length || 0} points`;
    
    // Seedling Record
    case 'seed_ben_id':
      return item.beneficiaryId || '—';
    case 'seed_received':
      return item.received || 0;
    case 'seed_date_received':
      return item.dateReceived ? new Date(item.dateReceived).toLocaleDateString() : '—';
    case 'seed_planted':
      return item.planted || 0;
    case 'seed_plot_id':
      return item.plotId || '—';
    case 'seed_planting_date':
      return item.dateOfPlantingStart ? new Date(item.dateOfPlantingStart).toLocaleDateString() : '—';
    
    // Crop Survey Status
    case 'crop_ben_id':
      return item.beneficiaryId || '—';
    case 'crop_beneficiary':
      return item.beneficiaryName || '—';
    case 'crop_survey_date':
      return item.surveyDate ? new Date(item.surveyDate).toLocaleDateString() : '—';
    case 'crop_surveyer':
      return item.surveyer || '—';
    case 'crop_alive':
      return item.aliveCrops || 0;
    case 'crop_dead':
      return item.deadCrops || 0;
    case 'crop_plot':
      return item.plot || '—';
    
    // Recent Activities
    case 'act_type':
      return getActivityTitle(item.type);
    case 'act_action':
      return item.action || '—';
    case 'act_timestamp':
      return formatTimestamp(item.timestamp);
    case 'act_user':
      return item.user || 'Admin';
    
    default:
      return '—';
  }
};

// Convert data item to CSV row based on active tab or selected attributes
const convertToCSVRow = (item, activeTab, selectedAttributes, attributeColumnMap) => {
  let row = [];
  
  // If attributes are selected, export only those columns
  if (selectedAttributes && selectedAttributes.length > 0) {
    return selectedAttributes.map(attrId => {
      return getCellValueByAttribute(item, attrId);
    });
  }
  
  switch (activeTab) {
    case 'Beneficiary List':
      const address = [item.purok, item.barangay, item.municipality, item.province]
        .filter(part => part && part.trim() !== '')
        .join(', ');
      row = [
        item.beneficiaryId || '—',
        `${item.firstName || ''} ${item.middleName || ''} ${item.lastName || ''}`.trim() || '—',
        item.gender || '—',
        item.maritalStatus || '—',
        item.birthDate ? new Date(item.birthDate).toLocaleDateString() : '—',
        item.age || '—',
        item.cellphone || '—',
        address || '—'
      ];
      break;
    case 'Farm Location':
      row = [
        item.id || '—',
        item.beneficiaryName || '—',
        item.hectares || '—',
        item.address || '—',
        `${item.coordinates?.length || 0} points`
      ];
      break;
    case 'Seedling Record':
      row = [
        item.beneficiaryId || '—',
        item.received || 0,
        item.dateReceived ? new Date(item.dateReceived).toLocaleDateString() : '—',
        item.planted || 0,
        item.plotId || '—',
        item.dateOfPlantingStart ? new Date(item.dateOfPlantingStart).toLocaleDateString() : '—',
        item.dateOfPlantingEnd ? new Date(item.dateOfPlantingEnd).toLocaleDateString() : '—'
      ];
      break;
    case 'Crop Survey Status':
      row = [
        item.beneficiaryId || '—',
        item.beneficiaryName || '—',
        item.surveyDate ? new Date(item.surveyDate).toLocaleDateString() : '—',
        item.surveyer || '—',
        item.aliveCrops || 0,
        item.deadCrops || 0,
        item.plot || '—'
      ];
      break;
    case 'Recent Activities':
      row = [
        getActivityTitle(item.type),
        item.action || '—',
        formatTimestamp(item.timestamp),
        item.user || 'Admin'
      ];
      break;
    default:
      row = [];
  }
  
  // Escape commas and quotes in cells
  return row.map(cell => {
    const cellStr = String(cell);
    if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
      return `"${cellStr.replace(/"/g, '""')}"`;
    }
    return cellStr;
  });
};

// Main export function
export const exportToExcel = (activeTab, data, selectedAttributes = null, attributeColumnMap = null) => {
  // If no tab is selected or no data, do nothing
  if (!activeTab || !data || data.length === 0) return;
  
  let headers = [];
  
  // Get headers based on selected attributes or default
  if (selectedAttributes && selectedAttributes.length > 0 && attributeColumnMap) {
    headers = ['#', ...selectedAttributes.map(attrId => attributeColumnMap[attrId]?.header).filter(Boolean)];
  } else {
    headers = ['#', ...(headersMap[activeTab] || [])];
  }
  
  // Create CSV content
  const csvRows = [
    headers.join(','),
    ...data.map((item, index) => {
      let rowData;
      if (selectedAttributes && selectedAttributes.length > 0) {
        rowData = [index + 1, ...convertToCSVRow(item, activeTab, selectedAttributes, attributeColumnMap)];
      } else {
        rowData = [index + 1, ...convertToCSVRow(item, activeTab, null, null)];
      }
      return rowData.map(cell => {
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',');
    })
  ];
  
  const csvContent = csvRows.join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  
  // Generate filename with tab name and timestamp
  const filename = `${activeTab.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
