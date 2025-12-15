import React, { useState, useEffect, useMemo } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import { FiSave, FiAlertCircle } from 'react-icons/fi';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import AlertModal from '../../ui/AlertModal';
import LoadingModal from '../../ui/LoadingModal';
import { farmPlotsAPI, beneficiariesAPI } from '../../../services/api';

ModuleRegistry.registerModules([AllCommunityModule]);

const ImportDisplayPage = ({ initialData = [], errors = [], onSave, onCancel }) => {
  const [mergedData, setMergedData] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchBeneficiaries = async () => {
      try {
        setLoading(true);
        const data = await beneficiariesAPI.getAll();
        setBeneficiaries(data || []);
        console.log('Fetched beneficiaries:', data);
      } catch (error) {
        console.error('Error fetching beneficiaries:', error);
        setBeneficiaries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBeneficiaries();
  }, []);

  // Match imported data with existing beneficiaries and prepare for AG Grid display
  useEffect(() => {
    const initializeData = async () => {
      console.log('ImportDisplayPage - initialData:', initialData);
      console.log('ImportDisplayPage - initialData length:', initialData.length);
      
      if (initialData.length > 0) {
        // Build map to ensure consistent beneficiary names across all points in same plot
        const plotBeneficiaryMap = new Map();
        
        initialData.forEach(row => {
          const plotId = row.plotId;
          const beneficiaryName = row.beneficiaryName;
          
          if (plotId && beneficiaryName && beneficiaryName.trim() !== '') {
            if (!plotBeneficiaryMap.has(plotId)) {
              plotBeneficiaryMap.set(plotId, beneficiaryName.trim());
            }
          }
        });
        
        console.log('Plot to Beneficiary Name Map:', Array.from(plotBeneficiaryMap.entries()));
        
        const pointCounters = new Map();
        
        const processedData = initialData.map((row, index) => {
          const plotId = row.plotId || '';
          
          // Ensure consistent beneficiary name across all points in same plot
          let beneficiaryName = '';
          if (plotId && plotBeneficiaryMap.has(plotId)) {
            beneficiaryName = plotBeneficiaryMap.get(plotId);
          } else if (row.beneficiaryName) {
            beneficiaryName = row.beneficiaryName.trim();
          }
          
          console.log(`Row ${index}: plotId=${plotId}, beneficiaryName from map=${beneficiaryName}`);
          
          // Match beneficiary by comparing full name variations (with/without middle name)
          let matchedBeneficiary = null;
          if (beneficiaryName) {
            matchedBeneficiary = beneficiaries.find(ben => {
              const fullName = `${ben.firstName} ${ben.middleName || ''} ${ben.lastName}`.trim().toLowerCase();
              const fullNameNoMiddle = `${ben.firstName} ${ben.lastName}`.trim().toLowerCase();
              const rowName = beneficiaryName.toLowerCase();
              
              return fullName === rowName || fullNameNoMiddle === rowName;
            });
            
            if (matchedBeneficiary) {
              console.log(`  -> Matched to beneficiary ID: ${matchedBeneficiary.beneficiaryId}`);
            } else {
              console.log(`  -> No match found for: ${beneficiaryName}`);
            }
          }

          const beneficiaryId = matchedBeneficiary?.beneficiaryId || row.beneficiaryId || '';
          
          const plotKey = plotId || `unknown_${index}`;
          
          // Track point numbers per plot
          if (!pointCounters.has(plotKey)) {
            pointCounters.set(plotKey, 0);
          }
          pointCounters.set(plotKey, pointCounters.get(plotKey) + 1);
          const pointNumber = row.pointNumber || pointCounters.get(plotKey);
          
          return {
            plotId: plotId,
            beneficiaryId: beneficiaryId,
            beneficiaryName: beneficiaryName,
            hectares: row.hectares || '',
            pointNumber: pointNumber,
            latitude: row.latitude || '',
            longitude: row.longitude || '',
            elevation: row.elevation || ''
          };
        });
        
        console.log('ImportDisplayPage - processedData:', processedData);
        
        setMergedData(processedData.length > 0 ? processedData : [{
          plotId: '',
          beneficiaryId: '',
          beneficiaryName: '',
          hectares: '',
          pointNumber: 1,
          latitude: '',
          longitude: '',
          elevation: ''
        }]);
      } else {
        setMergedData([{
          plotId: '',
          beneficiaryId: '',
          beneficiaryName: '',
          hectares: '',
          pointNumber: 1,
          latitude: '',
          longitude: '',
          elevation: ''
        }]);
      }
    };

    if (!loading && beneficiaries.length >= 0) {
      initializeData();
    }
  }, [initialData, beneficiaries, loading]);

  const validateData = () => {
    const validationErrors = [];
    
    // Validate merged data
    mergedData.forEach((row, index) => {
      const errors = [];
      if (!row.beneficiaryId?.trim() && !row.beneficiaryName?.trim()) {
        errors.push('Beneficiary ID or Name required');
      }
      if (!row.latitude || String(row.latitude).trim() === '') {
        errors.push('Latitude required');
      }
      if (!row.longitude || String(row.longitude).trim() === '') {
        errors.push('Longitude required');
      }
      
      if (errors.length > 0) {
        validationErrors.push({
          row: index + 1,
          errors: errors
        });
      }
    });
    
    return validationErrors;
  };

  const mergedColumnDefs = useMemo(() => [
    { 
      field: 'rowNum', 
      headerName: '#', 
      editable: false, 
      flex: 0.5,
      minWidth: 60,
      valueGetter: (params) => params.node.rowIndex + 1,
      cellStyle: { fontWeight: 600 }
    },
    { 
      field: 'plotId', 
      headerName: 'Plot ID', 
      editable: true, 
      flex: 1,
      minWidth: 100
    },
    { 
      field: 'beneficiaryId', 
      headerName: 'Beneficiary ID', 
      editable: false, 
      flex: 1.2,
      minWidth: 130
    },
    { 
      field: 'beneficiaryName', 
      headerName: 'Beneficiary Name *', 
      editable: true, 
      flex: 2,
      minWidth: 180,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: beneficiaries.map(ben => 
          `${ben.firstName} ${ben.middleName || ''} ${ben.lastName}`.trim()
        )
      },
      valueFormatter: (params) => params.value || '-'
    },
    { 
      field: 'hectares', 
      headerName: 'Hectares', 
      editable: true, 
      flex: 0.8,
      minWidth: 90
    },
    { 
      field: 'pointNumber', 
      headerName: 'Point #', 
      editable: true, 
      flex: 0.7,
      minWidth: 80
    },
    { 
      field: 'latitude', 
      headerName: 'Latitude (Decimal) *', 
      editable: true, 
      flex: 1.5,
      minWidth: 160,
      valueFormatter: (params) => params.value ? Number(params.value).toFixed(8) : ''
    },
    { 
      field: 'longitude', 
      headerName: 'Longitude (Decimal) *', 
      editable: true, 
      flex: 1.5,
      minWidth: 160,
      valueFormatter: (params) => params.value ? Number(params.value).toFixed(8) : ''
    },
    { 
      field: 'elevation', 
      headerName: 'Elevation (m)', 
      editable: true, 
      flex: 1,
      minWidth: 100
    },
  ], [beneficiaries]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    suppressMovable: false,
  }), []);

  const addRow = () => {
    setMergedData([...mergedData, {
      plotId: '',
      beneficiaryId: '',
      beneficiaryName: '',
      hectares: '',
      pointNumber: mergedData.length + 1,
      latitude: '',
      longitude: '',
      elevation: ''
    }]);
  };

  // Organize data into plots and coordinates for backend processing
  const handleSave = async () => {
    const validationErrors = validateData();
    
    if (validationErrors.length > 0) {
      const errorMsg = validationErrors
        .map(e => `Row ${e.row}: ${e.errors.join(', ')}`)
        .join('\n');
      alert(`Please fix the following errors:\n\n${errorMsg}`);
      return;
    }

    setSaving(true);
    try {
      const plotsMap = new Map();
      const coordinates = [];
      
      mergedData.forEach((row) => {
        const plotKey = row.plotId || row.beneficiaryId || row.beneficiaryName;
        
        // Extract unique plot information
        if (plotKey && !plotsMap.has(plotKey)) {
          plotsMap.set(plotKey, {
            plotId: row.plotId,
            beneficiaryId: row.beneficiaryId,
            beneficiaryName: row.beneficiaryName,
            hectares: row.hectares
          });
        }
        
        // Extract coordinate point
        if (row.latitude && row.longitude) {
          coordinates.push({
            plotId: row.plotId,
            beneficiaryId: row.beneficiaryId,
            beneficiaryName: row.beneficiaryName,
            pointNumber: row.pointNumber,
            latitude: row.latitude,
            longitude: row.longitude,
            elevation: row.elevation
          });
        }
      });
      
      const farmPlots = Array.from(plotsMap.values());
      
      console.log('Saving - farmPlots:', farmPlots);
      console.log('Saving - coordinates:', coordinates);
      
      await onSave({ farmPlots, coordinates });
      setSaving(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Save error:', error);
      setSaving(false);
      alert('Failed to save data. Please try again.');
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onCancel();
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    onCancel();
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: 'white',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ 
        padding: '1.6rem 1rem 1.7rem 1rem',
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
            Imported Farm Plot Data
          </h2>
          <div style={{
            color: 'var(--dark-brown)',
            fontSize: '0.65rem',
            marginTop: '0.2rem',
            fontWeight: 500
          }}>
            {`${mergedData.length} coordinate points • ${errors.length} import errors`}
          </div>
        </div>
        <div style={{ 
          display: 'flex',
          gap: '0.5rem'
        }}>
          <button
            onClick={handleCancel}
            disabled={saving}
            style={{
              padding: '0.4rem 1.5rem',
              backgroundColor: 'var(--white)',
              color: 'var(--dark-green)',
              border: '1px solid var(--dark-green)',
              borderRadius: '4px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '0.65rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              opacity: saving ? 0.6 : 1,
              transition: 'all 0.1s ease',
            }}
            onMouseEnter={(e) => !saving && (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => !saving && (e.currentTarget.style.transform = 'scale(1)')}
            onMouseDown={(e) => !saving && (e.currentTarget.style.transform = 'scale(1)')}
          >
            <span>Cancel</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.4rem 1.3rem',
              backgroundColor: 'var(--dark-green)',
              color: 'white',
              border: '1px solid var(--dark-green)',
              borderRadius: '4px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '0.65rem',
              fontWeight: '400',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              opacity: saving ? 0.6 : 1,
              transition: 'all 0.1s ease',
            }}
            onMouseEnter={(e) => !saving && (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => !saving && (e.currentTarget.style.transform = 'scale(1)')}
            onMouseDown={(e) => !saving && (e.currentTarget.style.transform = 'scale(1)')}
          >
            <FiSave size={10} />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '1.5rem',
        }}
      >
        {/* Error Summary Section */}
        {errors.length > 0 && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: 'var(--warning)',
            border: '1px solid var(--warning)',
            borderRadius: '5px',
            display: 'flex',
            gap: '0.8rem',
            alignItems: 'flex-start'
          }}>
            <FiAlertCircle size={20} color="var(--warning)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <div style={{ flex: 1 }}>
              <h4 style={{
                margin: '0 0 0.5rem 0',
                color: 'var(--warning)',
                fontSize: '0.8rem',
                fontWeight: 600
              }}>
                {errors.length} Row{errors.length > 1 ? 's' : ''} Excluded Due to Errors
              </h4>
              <div style={{
                maxHeight: '100px',
                overflowY: 'auto',
                fontSize: '0.68rem',
                color: 'var(--warning)'
              }}>
                {errors.map((error, idx) => (
                  <div key={idx} style={{ marginBottom: '0.25rem' }}>
                    • <strong>Row {error.row}:</strong> {error.errors.join(', ')}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div style={{
          padding: '0.8rem 0.9rem',
          backgroundColor: 'var(--mint-green)',
          border: '1px solid var(--mint-green)',
          borderRadius: '5px',
          marginBottom: '1.5rem',
          fontSize: '0.7rem',
          color: 'var(--dark-green)',
          fontWeight: 500
        }}>
          <strong>Instructions:</strong> Review the imported data below. All coordinates have been converted from DMS (Degrees Minutes Seconds) to decimal format. 
          Double-click cells to edit. One farm plot can have multiple coordinate points. When saved, data will be separated into farm plots and coordinates tables. 
          Required fields: Beneficiary Name*, Latitude*, Longitude*
        </div>

        {/* Farm Plot Coordinates Table */}
        <div style={styles.tableSection}>
          <div style={styles.tableSectionHeader}>
            <h4 style={styles.tableTitle}>Farm Plot Coordinates</h4>
            <button onClick={addRow} style={styles.addButton}>
              <AiOutlinePlus size={10} />
              Add Row
            </button>
          </div>
          <div className="ag-theme-alpine" style={{ height: 600, width: '100%', fontSize: '0.65rem', '--ag-row-height': '28px', '--ag-header-height': '32px', '--ag-font-size': '0.53rem' }}>
            <AgGridReact
              theme="legacy"
              rowData={mergedData}
              columnDefs={mergedColumnDefs}
              defaultColDef={defaultColDef}
              onCellValueChanged={(params) => {
                const updatedData = [...mergedData];
                const rowData = params.data;
                
                // Auto-populate beneficiary ID when name is selected
                if (params.column.getColId() === 'beneficiaryName' && params.newValue) {
                  const matchedBeneficiary = beneficiaries.find(ben => {
                    const fullName = `${ben.firstName} ${ben.middleName || ''} ${ben.lastName}`.trim();
                    return fullName === params.newValue;
                  });
                  
                  if (matchedBeneficiary) {
                    rowData.beneficiaryId = matchedBeneficiary.beneficiaryId;
                  }
                }
                
                updatedData[params.node.rowIndex] = rowData;
                setMergedData(updatedData);
              }}
              singleClickEdit={false}
              stopEditingWhenCellsLoseFocus={true}
            />
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <AlertModal
        isOpen={showCancelModal}
        onClose={handleCloseCancelModal}
        type="info"
        title="Cancel Changes?"
        message="Are you sure you want to cancel? Any unsaved changes will be lost."
        confirmText="Yes, Cancel"
        cancelText="No, Continue Editing"
        showCancel={true}
        onConfirm={handleConfirmCancel}
        onCancel={handleCloseCancelModal}
        maxWidth={420}
      />

      {/* Saving Loading Modal */}
      <LoadingModal
        isOpen={saving}
        title="Saving Data"
        message="Importing farm plot records..."
        dismissible={false}
        spinnerColor="var(--dark-green)"
      />

      {/* Success Modal */}
      <AlertModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        type="success"
        title="Saved Successfully"
        message={`Successfully imported ${mergedData.length} coordinate point${mergedData.length > 1 ? 's' : ''}.`}
        confirmText="OK"
        showCancel={false}
        onConfirm={handleSuccessModalClose}
        maxWidth={400}
      />
    </div>
  );
};

const styles = {
  tableSection: {
    marginBottom: '2rem',
  },
  tableSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid var(--dark-green)',
  },
  tableTitle: {
    margin: 0,
    fontSize: '0.85rem',
    color: 'var(--dark-green)',
    fontWeight: 700,
  },
  addButton: {
    padding: '0.35rem 1rem',
    backgroundColor: 'var(--dark-green)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.65rem',
    fontWeight: 400,
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },
};

export default ImportDisplayPage;
