// PDF Export Utility for Reports
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

// Convert data item to PDF row based on active tab
const convertToPDFRow = (item, activeTab) => {
  let row = [];
  
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
  
  return row;
};

// Main PDF export function
export const exportToPDF = (activeTab, data) => {
  // If no tab is selected or no data, do nothing
  if (!activeTab || !data || data.length === 0) return;
  
  // Get headers for the active tab
  const headers = headersMap[activeTab] || [];
  
  // Initialize jsPDF
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  // Add title
  doc.setFontSize(16);
  doc.setTextColor(44, 85, 48); // Dark green color
  doc.text(activeTab, 14, 15);
  
  // Add timestamp
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const timestamp = new Date().toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  doc.text(`Generated: ${timestamp}`, 14, 22);
  
  // Prepare table data
  const tableData = data.map(item => convertToPDFRow(item, activeTab));
  
  // Configure column widths based on tab
  const getColumnStyles = (activeTab) => {
    switch (activeTab) {
      case 'Beneficiary List':
        return {
          0: { cellWidth: 25 }, // Beneficiary ID
          1: { cellWidth: 35 }, // Full Name
          2: { cellWidth: 20 }, // Gender
          3: { cellWidth: 25 }, // Marital Status
          4: { cellWidth: 25 }, // Birth Date
          5: { cellWidth: 15 }, // Age
          6: { cellWidth: 25 }, // Cellphone
          7: { cellWidth: 'auto' } // Address
        };
      case 'Farm Location':
        return {
          0: { cellWidth: 30 }, // Plot ID
          1: { cellWidth: 40 }, // Beneficiary
          2: { cellWidth: 25 }, // Hectares
          3: { cellWidth: 'auto' }, // Address
          4: { cellWidth: 30 } // Coordinates
        };
      case 'Seedling Record':
        return {
          0: { cellWidth: 30 }, // Beneficiary ID
          1: { cellWidth: 25 }, // Received
          2: { cellWidth: 30 }, // Date Received
          3: { cellWidth: 25 }, // Planted
          4: { cellWidth: 30 }, // Plot ID
          5: { cellWidth: 30 }, // Planting Date
          6: { cellWidth: 30 } // End Date
        };
      case 'Crop Survey Status':
        return {
          0: { cellWidth: 30 }, // Beneficiary ID
          1: { cellWidth: 40 }, // Beneficiary Name
          2: { cellWidth: 30 }, // Survey Date
          3: { cellWidth: 35 }, // Surveyer Name
          4: { cellWidth: 25 }, // Alive Crops
          5: { cellWidth: 25 }, // Dead Crops
          6: { cellWidth: 'auto' } // Plot
        };
      case 'Recent Activities':
        return {
          0: { cellWidth: 40 }, // Type
          1: { cellWidth: 'auto' }, // Action
          2: { cellWidth: 45 }, // Timestamp
          3: { cellWidth: 30 } // User
        };
      default:
        return {};
    }
  };
  
  // Add table using autoTable
  doc.autoTable({
    head: [headers],
    body: tableData,
    startY: 28,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak',
      lineColor: [224, 224, 224],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [44, 85, 48], // Dark green
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left'
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    },
    columnStyles: getColumnStyles(activeTab),
    margin: { top: 28, left: 14, right: 14 },
    didDrawPage: (data) => {
      // Add page numbers
      const pageCount = doc.internal.getNumberOfPages();
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageSize.width / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }
  });
  
  // Generate filename with tab name and timestamp
  const filename = `${activeTab.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Save the PDF
  doc.save(filename);
};
