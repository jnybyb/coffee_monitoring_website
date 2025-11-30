import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MdClose, MdOutlineRotateRight } from 'react-icons/md';
import { FaFilePdf } from 'react-icons/fa6';
import { IoMdArrowBack } from 'react-icons/io';

const PDFEditorPage = ({ activeTab, data, selectedAttributes, attributeColumnMap, onClose }) => {
  const [orientation, setOrientation] = useState('landscape');
  const [paperSize, setPaperSize] = useState('a4');
  const [margins, setMargins] = useState({ top: 25.4, left: 25.4, right: 25.4, bottom: 25.4 });
  const [title, setTitle] = useState(activeTab || 'Report');
  const [fontSize, setFontSize] = useState(8);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef(null);

  // Headers map for each tab
  const headersMap = {
    'Beneficiary List': ['#', 'Beneficiary ID', 'Full Name', 'Gender', 'Marital Status', 'Birth Date', 'Age', 'Cellphone', 'Address'],
    'Farm Location': ['#', 'Plot ID', 'Beneficiary', 'Hectares', 'Address', 'Coordinates'],
    'Seedling Record': ['#', 'Beneficiary ID', 'Received', 'Date Received', 'Planted', 'Plot ID', 'Planting Date', 'End Date'],
    'Crop Survey Status': ['#', 'Beneficiary ID', 'Beneficiary Name', 'Survey Date', 'Surveyer Name', 'Alive Crops', 'Dead Crops', 'Plot'],
    'Recent Activities': ['#', 'Type', 'Action', 'Timestamp', 'User']
  };

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

  // Convert data item to PDF row
  const convertToPDFRow = (item, activeTab, index) => {
    // If attributes are selected, export only those columns
    if (selectedAttributes && selectedAttributes.length > 0) {
      return [
        index + 1,
        ...selectedAttributes.map(attrId => getCellValueByAttribute(item, attrId))
      ];
    }
    
    let row = [];
    
    switch (activeTab) {
      case 'Beneficiary List':
        const address = [item.purok, item.barangay, item.municipality, item.province]
          .filter(part => part && part.trim() !== '' && part.toLowerCase() !== 'unknown')
          .join(', ');
        row = [
          index + 1,
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
          index + 1,
          item.id || '—',
          item.beneficiaryName || '—',
          item.hectares || '—',
          item.address || '—',
          `${item.coordinates?.length || 0} points`
        ];
        break;
      case 'Seedling Record':
        row = [
          index + 1,
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
          index + 1,
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
          index + 1,
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

  // Generate preview
  const generatePreview = () => {
    if (!previewRef.current || !data || data.length === 0) return;

    // Get headers based on selected attributes or default
    let headers = [];
    if (selectedAttributes && selectedAttributes.length > 0 && attributeColumnMap) {
      headers = ['#', ...selectedAttributes.map(attrId => attributeColumnMap[attrId]?.header).filter(Boolean)];
    } else {
      headers = headersMap[activeTab] || [];
    }
    const tableData = data.map((item, index) => convertToPDFRow(item, activeTab, index));

    // Calculate rows per page (approximate)
    const rowsPerPage = orientation === 'landscape' ? 25 : 35;
    const totalPages = Math.ceil(tableData.length / rowsPerPage);

    // Generate pages
    let pagesHTML = '';
    for (let pageNum = 0; pageNum < totalPages; pageNum++) {
      const startIdx = pageNum * rowsPerPage;
      const endIdx = Math.min(startIdx + rowsPerPage, tableData.length);
      const pageRows = tableData.slice(startIdx, endIdx);

      pagesHTML += `
        <div style="
          padding: ${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px;
          background: white;
          font-family: 'Helvetica', sans-serif;
          margin-bottom: 2rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          page-break-after: always;
          min-height: ${orientation === 'landscape' ? '210mm' : '297mm'};
        ">
          <h2 style="color: #2c5530; font-size: 16px; margin-bottom: 8px;">${title}</h2>
          <p style="color: #666; font-size: 10px; margin-bottom: 20px;">Generated: ${new Date().toLocaleString()}</p>
          <table style="width: 100%; border-collapse: collapse; font-size: ${fontSize}px;">
            <thead>
              <tr style="background-color: #2c5530; color: white;">
                ${headers.map(h => `<th style="padding: 8px; text-align: left; border: 1px solid #ddd;">${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${pageRows.map((row, idx) => `
                <tr style="background-color: ${idx % 2 === 0 ? 'white' : '#f8f9fa'};">
                  ${row.map(cell => `<td style="padding: 6px; border: 1px solid #ddd; color: #333;">${cell}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="text-align: center; margin-top: 20px; font-size: 10px; color: #999;">
            Page ${pageNum + 1} of ${totalPages}
          </div>
        </div>
      `;
    }

    previewRef.current.innerHTML = pagesHTML;
  };

  useEffect(() => {
    generatePreview();
  }, [orientation, paperSize, margins, title, fontSize, data, activeTab]);

  // Handle export
  const handleExport = async () => {
    if (!activeTab || !data || data.length === 0) {
      alert('No data available to export');
      return;
    }

    setIsExporting(true);

    try {
      // Get headers based on selected attributes or default
      let headers = [];
      if (selectedAttributes && selectedAttributes.length > 0 && attributeColumnMap) {
        headers = ['#', ...selectedAttributes.map(attrId => attributeColumnMap[attrId]?.header).filter(Boolean)];
      } else {
        headers = headersMap[activeTab] || [];
      }
      const tableData = data.map((item, index) => convertToPDFRow(item, activeTab, index));

      // Paper size dimensions in mm
      const paperSizes = {
        'a4': [210, 297],
        'a3': [297, 420],
        'letter': [215.9, 279.4],
        'legal': [215.9, 355.6]
      };

      const [width, height] = paperSizes[paperSize];

      const doc = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: [width, height]
      });

      // Add title
      doc.setFontSize(16);
      doc.setTextColor(44, 85, 48);
      doc.text(title, margins.left, 15);

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
      doc.text(`Generated: ${timestamp}`, margins.left, 22);

      // Configure column styles
      const getColumnStyles = (activeTab) => {
        switch (activeTab) {
          case 'Beneficiary List':
            return orientation === 'landscape' ? {
              0: { cellWidth: 10 },
              1: { cellWidth: 25 },
              2: { cellWidth: 35 },
              3: { cellWidth: 20 },
              4: { cellWidth: 25 },
              5: { cellWidth: 25 },
              6: { cellWidth: 15 },
              7: { cellWidth: 25 },
              8: { cellWidth: 'auto' }
            } : {
              0: { cellWidth: 8 },
              1: { cellWidth: 20 },
              2: { cellWidth: 'auto' },
              3: { cellWidth: 15 },
              4: { cellWidth: 20 },
              5: { cellWidth: 20 },
              6: { cellWidth: 12 },
              7: { cellWidth: 20 },
              8: { cellWidth: 'auto' }
            };
          case 'Farm Location':
            return {
              0: { cellWidth: 10 },
              1: { cellWidth: 30 },
              2: { cellWidth: 40 },
              3: { cellWidth: 25 },
              4: { cellWidth: 'auto' },
              5: { cellWidth: 30 }
            };
          case 'Seedling Record':
            return {
              0: { cellWidth: 10 },
              1: { cellWidth: 30 },
              2: { cellWidth: 25 },
              3: { cellWidth: 30 },
              4: { cellWidth: 25 },
              5: { cellWidth: 30 },
              6: { cellWidth: 30 },
              7: { cellWidth: 30 }
            };
          case 'Crop Survey Status':
            return {
              0: { cellWidth: 10 },
              1: { cellWidth: 30 },
              2: { cellWidth: 40 },
              3: { cellWidth: 30 },
              4: { cellWidth: 35 },
              5: { cellWidth: 25 },
              6: { cellWidth: 25 },
              7: { cellWidth: 'auto' }
            };
          case 'Recent Activities':
            return {
              0: { cellWidth: 10 },
              1: { cellWidth: 40 },
              2: { cellWidth: 'auto' },
              3: { cellWidth: 45 },
              4: { cellWidth: 30 }
            };
          default:
            return {};
        }
      };

      // Add table - FIXED: Call autoTable as standalone function
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 28,
        styles: {
          fontSize: fontSize,
          cellPadding: 2,
          overflow: 'linebreak',
          lineColor: [224, 224, 224],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [44, 85, 48],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'left'
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        columnStyles: getColumnStyles(activeTab),
        margin: { top: margins.top, left: margins.left, right: margins.right, bottom: margins.bottom },
        didDrawPage: (data) => {
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          
          // Add header on every page
          if (data.pageNumber > 1) {
            // Add title
            doc.setFontSize(16);
            doc.setTextColor(44, 85, 48);
            doc.text(title, margins.left, 15);
            
            // Add timestamp
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated: ${timestamp}`, margins.left, 22);
          }
          
          // Add page number at bottom
          const pageCount = doc.internal.getNumberOfPages();
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

      const filename = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

      setIsExporting(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setIsExporting(false);
      alert('Failed to export PDF. Please try again.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'white'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '1.6rem 1rem 0.5rem 1rem',
        backgroundColor: 'var(--white)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexShrink: 0,
      }}>
        <div>
          <h2 style={{ 
            color: 'var(--dark-green)', 
            fontSize: '1.25rem', 
            fontWeight: 600, 
            margin: 0 
          }}>
            PDF Document Editor
          </h2>
          <div style={{
            color: 'var(--dark-brown)',
            fontSize: '0.65rem',
            marginTop: '0.2rem',
            fontWeight: 500
          }}>
            Customize your document before exporting
          </div>
        </div>
        {/* Action Buttons */}
        <div style={{ 
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.4rem 1.5rem',
              backgroundColor: 'var(--white)',
              color: 'var(--dark-green)',
              border: '1px solid var(--dark-green)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.65rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.1s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <IoMdArrowBack size={12} />
            <span>Back to Reports</span>
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            style={{
              padding: '0.4rem 1.3rem',
              backgroundColor: isExporting ? '#6b9270' : 'var(--dark-green)',
              color: 'white',
              border: '1px solid var(--dark-green)',
              borderRadius: '4px',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              fontSize: '0.65rem',
              fontWeight: '400',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.1s ease',
              opacity: isExporting ? 0.7 : 1
            }}
            onMouseEnter={(e) => !isExporting && (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => !isExporting && (e.currentTarget.style.transform = 'scale(1)')}
            onMouseDown={(e) => !isExporting && (e.currentTarget.style.transform = 'scale(1)')}
          >
            <FaFilePdf size={10} />
            <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        gap: '1rem',
        padding: '1rem',
        overflow: 'hidden',
        backgroundColor: 'white'
      }}>
        {/* Control Panel */}
        <div style={{
          width: '280px',
          backgroundColor: 'transparent',
          borderRadius: '6px',
          padding: '0.75rem',
          overflow: 'auto'
        }}>
          <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', color: '#2c5530', fontWeight: 600 }}>
            Document Settings
          </h3>

          {/* Document Title */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.65rem', fontWeight: 600, color: '#333' }}>
              Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '0.35rem 0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '0.7rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Orientation */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.65rem', fontWeight: 600, color: '#333' }}>
              Orientation
            </label>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button
                onClick={() => setOrientation('portrait')}
                style={{
                  flex: 1,
                  padding: '0.4rem',
                  backgroundColor: orientation === 'portrait' ? '#2c5530' : 'white',
                  color: orientation === 'portrait' ? 'white' : '#333',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
              >
                Portrait
              </button>
              <button
                onClick={() => setOrientation('landscape')}
                style={{
                  flex: 1,
                  padding: '0.4rem',
                  backgroundColor: orientation === 'landscape' ? '#2c5530' : 'white',
                  color: orientation === 'landscape' ? 'white' : '#333',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
              >
                Landscape
              </button>
            </div>
          </div>

          {/* Paper Size */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.65rem', fontWeight: 600, color: '#333' }}>
              Paper Size
            </label>
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value)}
              style={{
                width: '100%',
                padding: '0.35rem 0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '0.7rem',
                cursor: 'pointer',
                backgroundColor: 'white'
              }}
            >
              <option value="a4">A4 (210 × 297 mm)</option>
              <option value="a3">A3 (297 × 420 mm)</option>
              <option value="letter">Letter (8.5 × 11 in)</option>
              <option value="legal">Legal (8.5 × 14 in)</option>
            </select>
          </div>

          {/* Font Size */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.65rem', fontWeight: 600, color: '#333' }}>
              Font Size: {fontSize}px
            </label>
            <input
              type="range"
              min="6"
              max="12"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              style={{
                width: '100%'
              }}
            />
          </div>

          {/* Margins */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.65rem', fontWeight: 600, color: '#333' }}>
              Margins (mm)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.6rem', color: '#666' }}>Top</label>
                <input
                  type="number"
                  value={margins.top}
                  onChange={(e) => setMargins({ ...margins, top: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '0.3rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.6rem', color: '#666' }}>Bottom</label>
                <input
                  type="number"
                  value={margins.bottom}
                  onChange={(e) => setMargins({ ...margins, bottom: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '0.3rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.6rem', color: '#666' }}>Left</label>
                <input
                  type="number"
                  value={margins.left}
                  onChange={(e) => setMargins({ ...margins, left: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '0.3rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.6rem', color: '#666' }}>Right</label>
                <input
                  type="number"
                  value={margins.right}
                  onChange={(e) => setMargins({ ...margins, right: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '0.3rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div style={{
            padding: '0.5rem',
            backgroundColor: '#f0f9f0',
            borderRadius: '4px',
            border: '1px solid #d0e8d0'
          }}>
            <p style={{ margin: 0, fontSize: '0.6rem', color: '#2c5530', lineHeight: '1.3' }}>
              <strong>💡 Tip:</strong> Adjust the settings above to customize your PDF document. 
              The preview will update in real-time. Click "Export PDF" when ready.
            </p>
          </div>
        </div>

        {/* Preview Panel */}
        <div style={{
          flex: 1,
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'auto',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            width: orientation === 'landscape' ? '100%' : '80%',
            maxWidth: orientation === 'landscape' ? '1200px' : '800px'
          }}>
            <div style={{
              backgroundColor: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minHeight: '400px'
            }}>
              <div ref={previewRef}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFEditorPage;
