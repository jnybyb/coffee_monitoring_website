import React, { useState, useEffect } from 'react';
import { InputField, SelectField } from '../../ui/FormFields';
import { CancelButton, SaveButton, AddCoordinateButton } from '../../ui/BeneficiaryButtons';
import { farmPlotsAPI } from '../../../services/api';
import LoadingModal from '../../ui/LoadingModal';
import AlertModal from '../../ui/AlertModal';

const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const formStyle = {
  backgroundColor: 'var(--white)',
  borderRadius: '5px',
  maxWidth: '450px',
  width: '85%',
  maxHeight: '90vh',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
};

// Add new style for scrollable content area
const contentAreaStyle = {
  overflowY: 'auto',
  scrollbarWidth: 'thin',
  msOverflowStyle: 'none',
  padding: '0 0.75rem',
  flex: 1,
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '.5px solid var(--border-gray)',
  padding: '1.4rem 1.4rem',
  background: 'var(--white)',
  position: 'sticky',
  borderRadius: '5px',
  top: 0,
  zIndex: 10,
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  fontSize: 30,
  color: 'var(--gray-icon)',
  cursor: 'pointer',
  padding: 0,
  width: 28,
  height: 28,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
};

const labelStyle = {
  fontWeight: 500,
  fontSize: 11,
  marginBottom: '0.1rem',
  display: 'block',
  color: 'var(--dark-green)',
};

const readOnlyInputStyle = {
  width: '100%',
  padding: '6px 10px',
  borderRadius: 4,
  border: '1px solid var(--border-gray)',
  fontSize: 11,
  marginBottom: 0,
  background: 'var(--white)',
  color: 'var(--dark-text)',
  cursor: 'not-allowed',
  height: '30px',
  boxSizing: 'border-box',
};

const buttonRowStyle = {
  display: 'flex',
  gap: '0.75rem',
  justifyContent: 'flex-end',
  paddingTop: '0.75rem',
  borderTop: 'rgba(0, 0, 0, 0.035)',
};

const coordinateRowStyle = {
  display: 'flex',
  gap: 6,
  alignItems: 'flex-start',
  padding: '6px 10px',
  backgroundColor: 'rgba(5, 80, 53, 0.08)',
  borderRadius: 4,
  marginBottom: 6,
  border: '1px solid var(--border-gray)',
  position: 'relative',
};

const removeButtonStyle = {
  background: 'none',
  border: 'none',
  borderRadius: 4,
  padding: '3px 6px',
  color: 'var(--dark-green)',
  cursor: 'pointer',
  fontSize: 18,
  fontWeight: '400',
  minWidth: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '0px',
  transition: 'all 0.2s ease',
  position: 'absolute',
  top: '6px',
  right: '10px',
};

const sectionTitleStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--dark-green)',
  marginTop: 12,
};

const pointTitleStyle = {
  fontSize: 10,
  fontWeight: 600,
  color: 'var(--dark-green)',
  marginBottom: 2,
};

const coordinateInputStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  flex: 1,
};

const coordinateFieldsStyle = {
  display: 'flex',
  gap: 6,
  alignItems: 'flex-start',
};

const twoColRowStyle = {
  display: 'flex',
  gap: 6,
};

const twoColColStyle = {
  flex: 1,
};

const formBodyStyle = {
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

// Convert DMS (Degrees Minutes Seconds) format to Decimal Degrees
const dmsToDecimal = (dmsString) => {
  if (!dmsString) return null;
  
  // Match DMS format: 7°15'20.4"N or 126°20'36.5"E
  const regex = /([0-9.]+)[°\s]+([0-9.]+)?["\s]*([0-9.]+)?["\s]*([NSEW])?/i;
  const match = dmsString.match(regex);
  
  if (!match) return null;
  
  let degrees = parseFloat(match[1] || 0);
  let minutes = parseFloat(match[2] || 0);
  let seconds = parseFloat(match[3] || 0);
  let direction = match[4] || '';
  
  let decimal = degrees + minutes / 60 + seconds / 3600;
  
  // Apply direction (S and W are negative)
  if (direction.toUpperCase() === 'S' || direction.toUpperCase() === 'W') {
    decimal *= -1;
  }
  
  return decimal;
};

// Detect whether coordinate string is in DMS or decimal format
const detectCoordinateFormat = (coordString) => {
  if (!coordString) return 'decimal';
  
  if (coordString.includes('°') || coordString.includes("'") || coordString.includes('"')) {
    return 'dms';
  }
  
  const decimal = parseFloat(coordString);
  if (!isNaN(decimal)) {
    return 'decimal';
  }
  
  return 'unknown';
};

// Format beneficiary address for display, handling missing fields gracefully
const formatSelectedAddress = (beneficiary) => {
  if (!beneficiary) return '';
  if (beneficiary.address) return beneficiary.address;
  const parts = [beneficiary.purok, beneficiary.barangay, beneficiary.municipality, beneficiary.province]
    .filter(Boolean)
    .map(part => String(part).trim())
    .filter(part => part.length > 0);
  return parts.join(', ');
};

function AddFarmPlotModal({ isOpen, onClose, onSubmit, beneficiaries, selectedBeneficiary }) {
  const [selectedId, setSelectedId] = useState('');
  const [generatedPlotId, setGeneratedPlotId] = useState('Auto-generated');
  const [coordinates, setCoordinates] = useState([
    { lat: '', lng: '', elevation: '' },
    { lat: '', lng: '', elevation: '' },
    { lat: '', lng: '', elevation: '' },
    { lat: '', lng: '', elevation: '' }
  ]); // Start with 4 minimum coordinates
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Find selected beneficiary object
  const selected = beneficiaries?.find(b => b.beneficiaryId === selectedId || b.id === selectedId) || {};

  // Auto-generate Plot ID in format BXXX-PLYY when beneficiary is selected
  useEffect(() => {
    const generatePlotId = async () => {
      if (selectedId) {
        try {
          const beneficiaryNumber = selectedId.substring(4);
          
          const allPlots = await farmPlotsAPI.getAll();
          const beneficiaryPlots = allPlots.filter(plot => plot.beneficiaryId === selectedId);
          
          // Extract plot numbers from existing plot IDs to find next available number
          let nextPlotNumber = 1;
          if (beneficiaryPlots.length > 0) {
            const plotNumbers = beneficiaryPlots.map(plot => {
              const plotId = plot.id;
              const plPosition = plotId.indexOf('-PL');
              if (plPosition !== -1) {
                const plotNumberPart = plotId.substring(plPosition + 3);
                return parseInt(plotNumberPart, 10);
              }
              return 0;
            }).filter(num => !isNaN(num));
            
            if (plotNumbers.length > 0) {
              nextPlotNumber = Math.max(...plotNumbers) + 1;
            }
          }
          
          // Format: BXXX-PLYY (e.g., B001-PL01)
          const formattedPlotNumber = nextPlotNumber.toString().padStart(2, '0');
          const plotId = `B${beneficiaryNumber}-PL${formattedPlotNumber}`;
          setGeneratedPlotId(plotId);
        } catch (error) {
          console.error('Error generating plot ID:', error);
          setGeneratedPlotId('Auto-generated');
        }
      } else {
        setGeneratedPlotId('Auto-generated');
      }
    };

    generatePlotId();
  }, [selectedId]);

  // Set selected beneficiary when modal opens or when selectedBeneficiary prop changes
  useEffect(() => {
    if (isOpen && selectedBeneficiary) {
      setSelectedId(selectedBeneficiary.beneficiaryId || selectedBeneficiary.id || '');
    }
  }, [isOpen, selectedBeneficiary]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedId('');
      setGeneratedPlotId('Auto-generated');
      setCoordinates([
        { lat: '', lng: '', elevation: '' },
        { lat: '', lng: '', elevation: '' },
        { lat: '', lng: '', elevation: '' },
        { lat: '', lng: '', elevation: '' }
      ]);
      setErrors({});
      setIsSaving(false);
      setShowSuccessModal(false);
    }
  }, [isOpen]);

  const addCoordinate = () => {
    setCoordinates([...coordinates, { lat: '', lng: '', elevation: '' }]);
  };

  const removeCoordinate = (index) => {
    // Only allow removal if we have more than 4 coordinates
    if (coordinates.length > 4) {
      setCoordinates(coordinates.filter((_, i) => i !== index));
    }
  };

  const updateCoordinate = (index, field, value) => {
    const updated = [...coordinates];
    updated[index][field] = value;
    setCoordinates(updated);
  };

  // Validate and convert coordinates from DMS or decimal to decimal format for database storage
  const validateAndConvertCoordinates = (coordinates) => {
    const validCoordinates = [];
    
    for (let i = 0; i < coordinates.length; i++) {
      const coord = coordinates[i];
      if (!coord.lat || !coord.lng) continue;
      
      let lat, lng;
      
      // Detect and convert latitude
      const latFormat = detectCoordinateFormat(coord.lat);
      if (latFormat === 'dms') {
        lat = dmsToDecimal(coord.lat);
      } else if (latFormat === 'decimal') {
        lat = parseFloat(coord.lat);
      } else {
        throw new Error(`Invalid latitude format at point ${i + 1}`);
      }
      
      // Detect and convert longitude
      const lngFormat = detectCoordinateFormat(coord.lng);
      if (lngFormat === 'dms') {
        lng = dmsToDecimal(coord.lng);
      } else if (lngFormat === 'decimal') {
        lng = parseFloat(coord.lng);
      } else {
        throw new Error(`Invalid longitude format at point ${i + 1}`);
      }
      
      // Validate coordinate ranges
      if (isNaN(lat) || lat < -90 || lat > 90) {
        throw new Error(`Invalid latitude value at point ${i + 1} (must be between -90 and 90)`);
      }
      if (isNaN(lng) || lng < -180 || lng > 180) {
        throw new Error(`Invalid longitude value at point ${i + 1} (must be between -180 and 180)`);
      }
      
      const elevation = coord.elevation ? parseInt(coord.elevation, 10) : null;
      
      validCoordinates.push({ lat, lng, elevation });
    }
    
    return validCoordinates;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSaving) return; // Prevent submission while loading
    
    const newErrors = {};
    
    if (!selectedId) {
      newErrors.selectedId = 'Required';
    }
    
    // Validate coordinates
    const validCoordinates = coordinates.filter(coord => coord.lat && coord.lng);
    if (validCoordinates.length < 4) {
      newErrors.coordinates = 'At least 4 coordinate points are required to define a plot boundary';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      // Convert and validate all coordinates
      const convertedCoordinates = validateAndConvertCoordinates(validCoordinates);
      
      // Start saving
      setIsSaving(true);
      
      // Call the onSubmit function
      await onSubmit({
        beneficiaryId: selected.beneficiaryId || selected.id,
        fullName: selected.fullName || selected.name,
        address: selected.address,
        coordinates: convertedCoordinates
      });
      
      // Success - stop saving and show success modal
      setIsSaving(false);
      setShowSuccessModal(true);
      
      // Note: AlertModal's autoClose will trigger onClose after 2 seconds
      
    } catch (error) {
      // If there's an error, show it in the modal
      setIsSaving(false);
      newErrors.coordinates = error.message || 'Failed to save farm plot';
      setErrors(newErrors);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={modalStyle}>
      <form style={formStyle} onSubmit={handleSubmit} className="hide-scrollbar-modal">
        {/* Modal Header - stays fixed above scrollable content */}
        <div style={headerStyle}>
          <h2 style={{ color: 'var(--dark-green)', margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Add Farm Plot</h2>
          <button
            type="button"
            onClick={onClose}
            style={closeBtnStyle}
            aria-label="Close"
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--border-gray)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>

        {/* Scrollable content area */}
        <div style={contentAreaStyle}>
          <div style={formBodyStyle}>
            <div style={twoColRowStyle}>
              <div style={twoColColStyle}>
                {selectedBeneficiary ? (
                  <div>
                    <label style={labelStyle}>Beneficiary Full Name</label>
                    <input
                      style={readOnlyInputStyle}
                      value={selectedBeneficiary.fullName || selectedBeneficiary.name || `${selectedBeneficiary.firstName || ''} ${selectedBeneficiary.middleName || ''} ${selectedBeneficiary.lastName || ''}`.trim()}
                      readOnly
                      tabIndex={-1}
                    />
                  </div>
                ) : (
                  <div>
                    <SelectField
                      name="beneficiaryId"
                      label="Beneficiary Full Name"
                      value={selectedId}
                      onChange={e => setSelectedId(e.target.value)}
                      options={beneficiaries?.map(b => ({
                        value: b.beneficiaryId || b.id,
                        label: b.fullName || b.name || `${b.firstName || ''} ${b.middleName || ''} ${b.lastName || ''}`.trim()
                      })) || []}
                      placeholder="Select beneficiary"
                      required
                      error={errors.selectedId}
                    />
                  </div>
                )}
              </div>
              <div style={twoColColStyle}>
                <label style={labelStyle}>Beneficiary ID</label>
                <input
                  style={readOnlyInputStyle}
                  value={selectedBeneficiary ? (selectedBeneficiary.beneficiaryId || selectedBeneficiary.id || '') : (selected.beneficiaryId || selected.id || '')}
                  readOnly
                  tabIndex={-1}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Address</label>
              <input
                style={readOnlyInputStyle}
                value={selectedBeneficiary ? formatSelectedAddress(selectedBeneficiary) : formatSelectedAddress(selected)}
                readOnly
                tabIndex={-1}
              />
            </div>

            <div>
              <label style={labelStyle}>Plot ID</label>
              <input
                style={readOnlyInputStyle}
                value={generatedPlotId}
                readOnly
                tabIndex={-1}
                title={generatedPlotId === 'Auto-generated' ? 'Plot ID will be automatically generated' : `Generated Plot ID: ${generatedPlotId}`}
              />
            </div>

            <div>
              <div style={sectionTitleStyle}>Plot Boundary Coordinates</div>
              <p style={{ fontSize: 8.5, color: 'var(--dark-text)', marginBottom: 10 }}>
                Add coordinate points to define the plot boundary. Minimum 4 points required.
              </p>
              
              {coordinates.map((coord, index) => (
                <div key={index} style={coordinateRowStyle}>
                  <div style={coordinateInputStyle}>
                    <div style={pointTitleStyle}>Point {index + 1}</div>
                    <div style={coordinateFieldsStyle}>
                      <div style={{ flex: 1 }}>
                        <InputField
                          name={`lat-${index}`}
                          label="Latitude"
                          value={coord.lat}
                          onChange={e => updateCoordinate(index, 'lat', e.target.value)}
                          placeholder=" "
                          labelFontSize="9px"
                          labelMarginBottom="2px"
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <InputField
                          name={`lng-${index}`}
                          label="Longitude"
                          value={coord.lng}
                          onChange={e => updateCoordinate(index, 'lng', e.target.value)}
                          placeholder=" "
                          labelFontSize="9px"
                          labelMarginBottom="2px"
                        />
                      </div>
                      <div style={{ flex: 0.7 }}>
                        <InputField
                          name={`elevation-${index}`}
                          label="Elevation (m)"
                          type="number"
                          value={coord.elevation}
                          onChange={e => updateCoordinate(index, 'elevation', e.target.value)}
                          placeholder=" "
                          labelFontSize="9px"
                          labelMarginBottom="2px"
                        />
                      </div>
                    </div>
              </div>
                  {coordinates.length >= 5 && (
              <button
                type="button"
                    style={removeButtonStyle}
                    onClick={() => removeCoordinate(index)}
                    title="Remove coordinate"
                    onMouseEnter={(e) => {
                      e.target.style.color = 'var(--danger-red)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = 'var(--dark-green)';
                    }}
                  >
                    ×
              </button>
                  )}
                </div>
              ))}
              
              <AddCoordinateButton onClick={addCoordinate}>
                + Add Coordinate Point
              </AddCoordinateButton>
              
              {errors.coordinates && <div style={{ color: 'var(--danger-red)', fontSize: 10, marginTop: 6 }}>{errors.coordinates}</div>}
            </div>

            <div style={{ ...buttonRowStyle, padding: '1rem 0 1rem 1rem' }}>
              <CancelButton 
                onClick={onClose} 
                disabled={isSaving}
                fontSize="11px"
                padding="10px 18px"
                borderRadius="5px"
              >
                Cancel
              </CancelButton>
              <SaveButton 
                disabled={isSaving}
                fontSize="11px"
                padding="10px 18px"
                borderRadius="5px"
              >
                {isSaving ? 'Saving...' : 'Save Plot'}
              </SaveButton>
            </div>
          </div>
        </div>
      </form>

      {/* Loading Modal */}
      <LoadingModal
        isOpen={isSaving}
        title="Saving plot..."
        message="Please wait while we save your farm plot"
        dismissible={false}
        spinnerColor="var(--dark-green)"
      />

      {/* Success Modal */}
      <AlertModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
        }}
        type="success"
        title="Plot Saved Successfully!"
        message="The farm plot has been added."
        autoClose={true}
        autoCloseDelay={2000}
        hideButton={true}
        maxWidth={300}
        borderRadius={6}
      />
    </div>
  );
}

export default AddFarmPlotModal;

<style>
{`
  .hide-scrollbar-modal::-webkit-scrollbar {
    width: 6px;
  }
  .hide-scrollbar-modal::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  .hide-scrollbar-modal::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  .hide-scrollbar-modal::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`}
</style>
