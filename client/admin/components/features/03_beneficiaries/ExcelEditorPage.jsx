import React, { useState, useEffect, useMemo } from 'react';
import { FiSave, FiAlertCircle, FiTrash2 } from 'react-icons/fi';
import AlertModal from '../../ui/AlertModal';
import LoadingModal from '../../ui/LoadingModal';
import DataGrid from '../../ui/DataGrid';
import { beneficiariesAPI } from '../../../services/api';

// Helper function to format date to MM-DD-YYYY
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  } catch (error) {
    return dateString;
  }
};

const ExcelEditorPage = ({ initialData = [], errors = [], onSave, onCancel }) => {
  // Beneficiaries Table State
  const [beneficiaries, setBeneficiaries] = useState([]);

  // Coffee Seedlings Table State
  const [seedlings, setSeedlings] = useState([]);

  // Crop Survey Status Table State
  const [cropSurveys, setCropSurveys] = useState([]);

  const [saving, setSaving] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Initialize data from imported Excel
  useEffect(() => {  
    const initializeData = async () => {
      console.log('ExcelEditorPage - initialData:', initialData);
      console.log('ExcelEditorPage - initialData length:', initialData.length);
      
      if (initialData.length > 0) {
        // Generate beneficiary IDs for all rows
        let generatedIds = [];
        try {
          const result = await beneficiariesAPI.generateMultipleIds(initialData.length);
          generatedIds = result.beneficiaryIds || [];
          console.log('Generated beneficiary IDs:', generatedIds);
        } catch (error) {
          console.error('Error generating beneficiary IDs:', error);
          alert('Failed to generate beneficiary IDs. Please try again.');
          return;
        }

        // Map cleaned data to beneficiaries format with auto-generated IDs
        const mappedBeneficiaries = initialData.map((row, index) => ({
          beneficiaryId: row.beneficiaryId || generatedIds[index] || '',
          firstName: row.firstName || '',
          middleName: row.middleName || '',
          lastName: row.lastName || '',
          gender: row.gender || '',
          maritalStatus: row.maritalStatus || '',
          birthDate: row.birthDate || '',
          age: row.age || '',
          cellphone: row.cellphone || '',
          province: row.province || '',
          municipality: row.municipality || '',
          barangay: row.barangay || '',
          purok: row.purok || ''
        }));

        console.log('ExcelEditorPage - mappedBeneficiaries:', mappedBeneficiaries);

        // Map seedling data if available
        const mappedSeedlings = initialData.map((row, index) => ({
          beneficiaryId: row.beneficiaryId || generatedIds[index] || '',
          receivedSeedling: row.received || '',
          dateReceived: row.dateReceived || '',
          plantedSeedling: row.planted || '',
          plotId: row.plotId || '',
          plantingStartDate: row.plantingStartDate || '',
          plantingEndDate: row.plantingEndDate || ''
        }));
        
        console.log('ExcelEditorPage - mappedSeedlings:', mappedSeedlings);

        setBeneficiaries(mappedBeneficiaries);
        setSeedlings(mappedSeedlings);

        // Initialize crop surveys with empty row
        setCropSurveys([{
          beneficiaryId: '',
          plotId: '',
          surveyer: '',
          surveyDate: '',
          aliveCrops: '',
          deadCrops: ''
        }]);
      } else {
        // Reset to empty rows when opening without data
        setBeneficiaries([{
          beneficiaryId: '',
          firstName: '',
          middleName: '',
          lastName: '',
          gender: '',
          maritalStatus: '',
          birthDate: '',
          age: '',
          cellphone: '',
          province: '',
          municipality: '',
          barangay: '',
          purok: ''
        }]);

        setSeedlings([{
          beneficiaryId: '',
          receivedSeedling: '',
          dateReceived: '',
          plantedSeedling: '',
          plotId: '',
          plantingStartDate: '',
          plantingEndDate: ''
        }]);

        setCropSurveys([{
          beneficiaryId: '',
          plotId: '',
          surveyer: '',
          surveyDate: '',
          aliveCrops: '',
          deadCrops: ''
        }]);
      }
    };

    initializeData();
  }, [initialData]);

  // Validate required fields
  const validateData = () => {
    const validationErrors = [];
    beneficiaries.forEach((row, index) => {
      const errors = [];
      if (!row.firstName?.trim()) errors.push('First Name required');
      if (!row.lastName?.trim()) errors.push('Last Name required');
      if (!row.purok?.trim()) errors.push('Purok required');
      
      if (errors.length > 0) {
        validationErrors.push({
          row: index + 1,
          errors: errors
        });
      }
    });
    return validationErrors;
  };

  // Delete row functions
  const deleteBeneficiaryRow = (index) => {
    if (beneficiaries.length > 1) {
      // Get the beneficiary ID before deleting
      const deletedBeneficiaryId = beneficiaries[index].beneficiaryId;
      
      // Remove the beneficiary
      setBeneficiaries(beneficiaries.filter((_, i) => i !== index));
      
      // Cascade delete: Remove all seedlings with this beneficiary ID
      setSeedlings(seedlings.filter(s => s.beneficiaryId !== deletedBeneficiaryId));
      
      // Cascade delete: Remove all crop surveys with this beneficiary ID
      setCropSurveys(cropSurveys.filter(cs => cs.beneficiaryId !== deletedBeneficiaryId));
    }
  };

  const deleteSeedlingRow = (index) => {
    if (seedlings.length > 1) {
      setSeedlings(seedlings.filter((_, i) => i !== index));
    }
  };

  const deleteCropSurveyRow = (index) => {
    if (cropSurveys.length > 1) {
      setCropSurveys(cropSurveys.filter((_, i) => i !== index));
    }
  };

  // Delete button cell renderer component
  const DeleteButtonRenderer = (props) => {
    return (
      <button
        onClick={() => props.onClick(props.node.rowIndex)}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--red)',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Delete row"
      >
        <FiTrash2 size={14} />
      </button>
    );
  };

  // AG-Grid Column Definitions
  const beneficiariesColumnDefs = useMemo(() => [
    { 
      field: 'rowNum', 
      headerName: '#', 
      editable: false, 
      width: 60,
      valueGetter: (params) => params.node.rowIndex + 1,
      cellStyle: { fontWeight: 600 }
    },
    { field: 'beneficiaryId', headerName: 'Beneficiary ID', editable: true, width: 150 },
    { field: 'firstName', headerName: 'First Name *', editable: true, width: 130 },
    { field: 'middleName', headerName: 'Middle Name', editable: true, width: 130 },
    { field: 'lastName', headerName: 'Last Name *', editable: true, width: 130 },
    { 
      field: 'gender', 
      headerName: 'Gender', 
      editable: true, 
      width: 120,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['', 'Male', 'Female']
      }
    },
    { field: 'maritalStatus', headerName: 'Marital Status', editable: true, width: 130 },
    { field: 'birthDate', headerName: 'Birth Date', editable: true, width: 130 },
    { field: 'age', headerName: 'Age', editable: true, width: 80 },
    { field: 'cellphone', headerName: 'Cellphone', editable: true, width: 140 },
    { field: 'province', headerName: 'Province', editable: true, width: 120 },
    { field: 'municipality', headerName: 'Municipality', editable: true, width: 130 },
    { field: 'barangay', headerName: 'Barangay', editable: true, width: 120 },
    { 
      field: 'purok', 
      headerName: 'Purok *', 
      editable: true, 
      width: 100,
      valueFormatter: (params) => params.value || '-',
      valueGetter: (params) => params.data?.purok || ''
    },
    {
      headerName: '',
      field: 'delete',
      width: 50,
      editable: false,
      cellRenderer: DeleteButtonRenderer,
      cellRendererParams: {
        onClick: deleteBeneficiaryRow
      },
      suppressMovable: true
    }
  ], [deleteBeneficiaryRow, DeleteButtonRenderer]);

  const seedlingsColumnDefs = useMemo(() => [
    { 
      field: 'rowNum', 
      headerName: '#', 
      editable: false, 
      width: 60,
      valueGetter: (params) => params.node.rowIndex + 1,
      cellStyle: { fontWeight: 600 }
    },
    { field: 'beneficiaryId', headerName: 'Beneficiary ID', editable: true, width: 150 },
    { field: 'receivedSeedling', headerName: 'Received Seedling', editable: true, width: 160 },
    { 
      field: 'dateReceived', 
      headerName: 'Date Received', 
      editable: true, 
      width: 150,
      valueFormatter: (params) => params.value ? formatDate(params.value) : ''
    },
    { field: 'plantedSeedling', headerName: 'Planted Seedling', editable: true, width: 160 },
    { field: 'plotId', headerName: 'Plot ID', editable: true, width: 150 },
    { 
      headerName: 'Date Planting', 
      children: [
        { 
          field: 'plantingStartDate', 
          headerName: 'Start', 
          editable: true, 
          width: 140,
          valueFormatter: (params) => params.value ? formatDate(params.value) : ''
        },
        { 
          field: 'plantingEndDate', 
          headerName: 'End', 
          editable: true, 
          width: 140,
          valueFormatter: (params) => params.value ? formatDate(params.value) : ''
        }
      ]
    },
    {
      headerName: '',
      field: 'delete',
      width: 50,
      editable: false,
      cellRenderer: DeleteButtonRenderer,
      cellRendererParams: {
        onClick: deleteSeedlingRow
      },
      suppressMovable: true
    }
  ], [deleteSeedlingRow, DeleteButtonRenderer]);

  const cropSurveysColumnDefs = useMemo(() => [
    { 
      field: 'rowNum', 
      headerName: '#', 
      editable: false, 
      width: 60,
      valueGetter: (params) => params.node.rowIndex + 1,
      cellStyle: { fontWeight: 600 }
    },
    { field: 'beneficiaryId', headerName: 'Beneficiary ID', editable: true, width: 150 },
    { field: 'plotId', headerName: 'Plot ID', editable: true, width: 150 },
    { field: 'surveyer', headerName: 'Surveyer', editable: true, width: 150 },
    { 
      field: 'surveyDate', 
      headerName: 'Survey Date', 
      editable: true, 
      width: 150,
      valueFormatter: (params) => params.value ? formatDate(params.value) : ''
    },
    { field: 'aliveCrops', headerName: 'Alive Crops', editable: true, width: 130 },
    { field: 'deadCrops', headerName: 'Dead Crops', editable: true, width: 130 },
    {
      headerName: '',
      field: 'delete',
      width: 50,
      editable: false,
      cellRenderer: DeleteButtonRenderer,
      cellRendererParams: {
        onClick: deleteCropSurveyRow
      },
      suppressMovable: true
    }
  ], [deleteCropSurveyRow, DeleteButtonRenderer]);





  // Handle save
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
      await onSave({
        beneficiaries,
        seedlings,
        cropSurveys
      });
      setSaving(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Save error:', error);
      setSaving(false);
      alert('Failed to save data. Please try again.');
    }
  };

  // Handle success modal close
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onCancel(); // Return to main page after success
  };

  // Handle cancel
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
            Imported Data
          </h2>
          <div style={{
            color: 'var(--dark-brown)',
            fontSize: '0.65rem',
            marginTop: '0.2rem',
            fontWeight: 500
          }}>
            {beneficiaries.length} beneficiaries • {seedlings.length} seedling records • {cropSurveys.length} crop surveys • {errors.length} import errors
          </div>
        </div>
        {/* Action Buttons */}
        <div style={{ 
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center'
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
          <div style={styles.errorBox}>
            <FiAlertCircle size={20} style={styles.errorIcon} />
            <div style={{ flex: 1 }}>
              <h4 style={styles.errorTitle}>
                {errors.length} Row{errors.length > 1 ? 's' : ''} Excluded Due to Errors
              </h4>
              <div style={styles.errorList}>
                {errors.map((error, idx) => (
                  <div key={idx} style={{ marginBottom: '0.25rem' }}>
                    • <strong>Row {error.row}:</strong> {error.name} - {error.errors.join(', ')}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 1. Beneficiaries Table */}
        <DataGrid
          title="1. Beneficiaries"
          rowData={beneficiaries}
          columnDefs={beneficiariesColumnDefs}
          onCellValueChanged={(params) => {
            const updatedData = [...beneficiaries];
            updatedData[params.node.rowIndex] = params.data;
            setBeneficiaries(updatedData);
          }}
        />

        {/* 2. Coffee Seedlings Table */}
        <DataGrid
          title="2. Coffee Seedlings"
          rowData={seedlings}
          columnDefs={seedlingsColumnDefs}
          onCellValueChanged={(params) => {
            const updatedData = [...seedlings];
            updatedData[params.node.rowIndex] = params.data;
            setSeedlings(updatedData);
          }}
        />

        {/* 3. Crop Survey Status Table */}
        <DataGrid
          title="3. Crop Survey Status"
          rowData={cropSurveys}
          columnDefs={cropSurveysColumnDefs}
          onCellValueChanged={(params) => {
            const updatedData = [...cropSurveys];
            updatedData[params.node.rowIndex] = params.data;
            setCropSurveys(updatedData);
          }}
        />
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
        message="Importing beneficiaries and records..."
        dismissible={false}
        spinnerColor="var(--dark-green)"
      />

      {/* Success Modal - Auto-dismiss after 2 seconds, no button */}
      <AlertModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        type="success"
        title="Saved Successfully"
        message={`Successfully imported ${beneficiaries.length} beneficiary record${beneficiaries.length > 1 ? 's' : ''} with associated data.`}
        autoClose={true}
        autoCloseDelay={2000}
        hideButton={true}
        showCancel={false}
        maxWidth={350}
      />
    </div>
  );
};

const styles = {
  errorBox: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: 'var(--beige)',
    border: '1px solid var(--warning)',
    borderRadius: '5px',
    display: 'flex',
    gap: '0.8rem',
    alignItems: 'flex-start'
  },
  errorIcon: {
    color: 'var(--dark-brown)',
    flexShrink: 0,
    marginTop: '0.1rem'
  },
  errorTitle: {
    margin: '0 0 0.5rem 0',
    color: 'var(--dark-brown)',
    fontSize: '0.8rem',
    fontWeight: 600
  },
  errorList: {
    maxHeight: '50px',
    overflowY: 'auto',
    fontSize: '0.68rem',
    color: 'var(--dark-brown)'
  },
};

export default ExcelEditorPage;
