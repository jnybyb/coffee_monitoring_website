import React, { useState, useEffect } from 'react';
import { InputField } from '../../ui/FormFields';
import { CancelButton, SaveButton, AddCoordinateButton } from '../../ui/BeneficiaryButtons';
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
  pointerEvents: 'auto',
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
  padding: '1.4rem 1rem',
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
};

const readOnlyInputStyle = {
  width: '100%',
  padding: '6px 10px',
  borderRadius: 4,
  border: '1px solid var(--border-gray)',
  fontSize: 11,
  marginBottom: 0,
  background: 'rgba(0, 0, 0, 0.03)',
  color: 'var(--dark-text)',
  cursor: 'not-allowed',
  height: '30px',
  boxSizing: 'border-box',
};

const selectStyle = {
  width: '100%',
  padding: '6px 32px 6px 10px',
  borderRadius: 4,
  border: '1px solid var(--border-gray)',
  fontSize: 11,
  marginBottom: 0,
  background: 'white',
  height: '30px',
  boxSizing: 'border-box',
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  backgroundImage:
    "url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'%236c757d\\'><path d=\\'M7 10l5 5 5-5\\'/></svg>')",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  backgroundSize: '14px',
};

const buttonRowStyle = {
  display: 'flex',
  gap: '0.75rem',
  justifyContent: 'flex-end',
  paddingTop: '0.75rem',
  borderTop: '1px solid rgba(0, 0, 0, 0.035)',
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
  fontSize: 15,
  fontWeight: 700,
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
  
  // Remove extra spaces for easier parsing
  const cleanStr = String(dmsString).trim();
  
  // Match DMS format: 7°15'20.4"N or 126°20'36.5"E
  // This regex properly captures degrees, minutes, seconds, and direction
  const regex = /([0-9.]+)\s*°\s*([0-9.]+)?\s*'?\s*([0-9.]+)?\s*"?\s*([NSEW])?/i;
  const match = cleanStr.match(regex);
  
  if (!match) return null;
  
  // Parse components with proper fallback to 0
  const degrees = parseFloat(match[1] || 0);
  const minutes = match[2] ? parseFloat(match[2]) : 0;
  const seconds = match[3] ? parseFloat(match[3]) : 0;
  const direction = (match[4] || '').toUpperCase();
  
  // Calculate decimal degrees
  let decimal = degrees + minutes / 60 + seconds / 3600;
  
  // Apply direction (S and W are negative)
  if (direction === 'S' || direction === 'W') {
    decimal *= -1;
  }
  
  return decimal;
};

// Convert Decimal Degrees to DMS (Degrees Minutes Seconds) format for display
const decimalToDMS = (decimal, isLatitude = true) => {
  if (decimal === null || decimal === undefined || isNaN(decimal)) return '';
  
  const absDecimal = Math.abs(decimal);
  const degrees = Math.floor(absDecimal);
  const minutesDecimal = (absDecimal - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = (minutesDecimal - minutes) * 60;
  
  // Apply direction based on hemisphere
  let direction = '';
  if (isLatitude) {
    direction = decimal >= 0 ? 'N' : 'S';
  } else {
    direction = decimal >= 0 ? 'E' : 'W';
  }
  
  return `${degrees}°${minutes}'${seconds.toFixed(1)}"${direction}`;
};

// Detect whether coordinate string is in DMS or decimal format
const detectCoordinateFormat = (coordString) => {
  if (!coordString) return 'decimal';
  
  // Check if it contains DMS indicators (°, ', ")
  if (coordString.includes('°') || coordString.includes("'") || coordString.includes('"')) {
    return 'dms';
  }
  
  // Check if it's a valid decimal number
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

function EditFarmPlotModal({ isOpen, onClose, onSubmit, plot, beneficiaries }) {
  const [selectedId, setSelectedId] = useState('');
  const [coordinates, setCoordinates] = useState([
    { lat: '', lng: '', elevation: '' },
    { lat: '', lng: '', elevation: '' },
    { lat: '', lng: '', elevation: '' },
    { lat: '', lng: '', elevation: '' }
  ]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Find selected beneficiary object
  const selected = beneficiaries?.find(b => b.beneficiaryId === selectedId || b.id === selectedId) || {};

  // Initialize form with plot data, converting decimal coordinates to DMS for user-friendly editing
  useEffect(() => {
    if (plot && isOpen) {
      const beneficiaryId = plot.beneficiaryId || '';
      setSelectedId(beneficiaryId);
      
      // Convert decimal coordinates to DMS format for editing
      let plotCoordinates;
      if (plot.coordinates && Array.isArray(plot.coordinates)) {
        plotCoordinates = plot.coordinates.map(coord => ({
          lat: decimalToDMS(coord.lat, true) || '',
          lng: decimalToDMS(coord.lng, false) || '',
          elevation: coord.elevation ? String(coord.elevation) : ''
        }));
        
        // Ensure minimum 4 coordinates for plot boundary
        while (plotCoordinates.length < 4) {
          plotCoordinates.push({ lat: '', lng: '', elevation: '' });
        }
        
        setCoordinates(plotCoordinates);
      } else {
        plotCoordinates = [
          { lat: '', lng: '', elevation: '' },
          { lat: '', lng: '', elevation: '' },
          { lat: '', lng: '', elevation: '' },
          { lat: '', lng: '', elevation: '' }
        ];
        setCoordinates(plotCoordinates);
      }
      
      // Store initial state for change detection
      setInitialFormData({
        selectedId: beneficiaryId,
        coordinates: JSON.parse(JSON.stringify(plotCoordinates))
      });
      setHasChanges(false);
      setErrors({});
    }
  }, [plot, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedId('');
      setCoordinates([
        { lat: '', lng: '', elevation: '' },
        { lat: '', lng: '', elevation: '' },
        { lat: '', lng: '', elevation: '' },
        { lat: '', lng: '', elevation: '' }
      ]);
      setErrors({});
      setInitialFormData(null);
      setHasChanges(false);
    }
  }, [isOpen]);

  const addCoordinate = () => {
    const newCoordinates = [...coordinates, { lat: '', lng: '', elevation: '' }];
    setCoordinates(newCoordinates);
    checkForChanges(selectedId, newCoordinates);
  };

  const removeCoordinate = (index) => {
    // Only allow removal if we have more than 4 coordinates
    if (coordinates.length > 4) {
      const newCoordinates = coordinates.filter((_, i) => i !== index);
      setCoordinates(newCoordinates);
      checkForChanges(selectedId, newCoordinates);
    }
  };

  const updateCoordinate = (index, field, value) => {
    const updated = [...coordinates];
    updated[index][field] = value;
    setCoordinates(updated);
    checkForChanges(selectedId, updated);
  };

  // Track form changes to enable/disable save button based on modifications
  const checkForChanges = (currentSelectedId, currentCoordinates) => {
    if (!initialFormData) {
      setHasChanges(false);
      return;
    }

    if (currentSelectedId !== initialFormData.selectedId) {
      setHasChanges(true);
      return;
    }

    const coordsChanged = JSON.stringify(currentCoordinates) !== JSON.stringify(initialFormData.coordinates);
    setHasChanges(coordsChanged);
  };

  // Validate and convert coordinates from DMS or decimal format to decimal for database storage
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
      
      // Validate ranges
      if (isNaN(lat) || lat < -90 || lat > 90) {
        throw new Error(`Invalid latitude value at point ${i + 1} (must be between -90 and 90)`);
      }
      if (isNaN(lng) || lng < -180 || lng > 180) {
        throw new Error(`Invalid longitude value at point ${i + 1} (must be between -180 and 180)`);
      }
      
      // Parse elevation (optional)
      const elevation = coord.elevation ? parseInt(coord.elevation, 10) : null;
      
      validCoordinates.push({ lat, lng, elevation });
    }
    
    return validCoordinates;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    const newErrors = {};
    
    if (!selectedId) {
      newErrors.selectedId = 'Beneficiary is required';
    }
    
    // Validate coordinates
    const validCoordinates = coordinates.filter(coord => coord.lat && coord.lng);
    if (validCoordinates.length < 4) {
      newErrors.coordinates = 'At least 4 coordinate points are required to define a plot boundary';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    
    try {
      // Convert and validate all coordinates
      const convertedCoordinates = validateAndConvertCoordinates(validCoordinates);
      
      // Call the onSubmit function
      await onSubmit({
        id: plot.id,
        beneficiaryId: selected.beneficiaryId || selected.id,
        coordinates: convertedCoordinates
      });
      
      // Close loading modal first
      setIsSubmitting(false);
      
      // 100ms delay ensures loading modal closes completely before showing success modal
      setTimeout(() => {
        setShowSuccessModal(true);
      }, 100);
    } catch (error) {
      setIsSubmitting(false);
      newErrors.coordinates = error.message || 'Failed to update farm plot';
      setErrors(newErrors);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !showSuccessModal) {
      setErrors({});
      onClose();
    }
  };
  
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    // Close the entire edit modal when success modal closes
    onClose();
  };

  if (!isOpen || !plot) return null;

  return (
    <>
    {isOpen && (
    <div style={modalStyle}>
      <form style={formStyle} onSubmit={handleSubmit} className="hide-scrollbar-modal">
          {/* Modal Header - stays fixed above scrollable content */}
          <div style={headerStyle}>
          <h2 style={{ color: 'var(--dark-green)', margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
            Edit Plot: {plot.plotId || plot.id || 'N/A'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            style={{
              ...closeBtnStyle,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
            aria-label="Close"
            onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = 'var(--border-gray)')}
            onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = 'transparent')}
          >
            ×
          </button>
        </div>

        {/* Scrollable content area */}
        <div style={contentAreaStyle}>
          <div style={formBodyStyle}>
            {/* Beneficiary Selection and ID in one row */}
            <div style={twoColRowStyle}>
              <div style={twoColColStyle}>
                <label style={labelStyle}>Beneficiary Full Name</label>
                <select
                  style={selectStyle}
                  value={selectedId}
                  onChange={e => {
                    const newId = e.target.value;
                    setSelectedId(newId);
                    checkForChanges(newId, coordinates);
                  }}
                  required
                >
                  <option value="">Select beneficiary</option>
                  {beneficiaries?.map(b => (
                    <option key={b.beneficiaryId || b.id} value={b.beneficiaryId || b.id}>
                      {b.fullName || b.name || `${b.firstName || ''} ${b.middleName || ''} ${b.lastName || ''}`.trim()}
                    </option>
                  ))}
                </select>
                {errors.selectedId && <div style={{ color: 'var(--red-error)', fontSize: 10, marginTop: 6 }}>{errors.selectedId}</div>}
              </div>
              <div style={twoColColStyle}>
                <label style={labelStyle}>Beneficiary ID</label>
                <input
                  style={readOnlyInputStyle}
                  value={selected.beneficiaryId || selected.id || ''}
                  readOnly
                  tabIndex={-1}
                />
              </div>
            </div>

            {/* Address (Read-only) */}
            <div>
              <label style={labelStyle}>Address</label>
              <input
                style={readOnlyInputStyle}
                value={formatSelectedAddress(selected)}
                readOnly
                tabIndex={-1}
              />
            </div>

            {/* Plot Boundary Coordinates */}
            <div>
              <div style={sectionTitleStyle}>Plot Boundary Coordinates</div>
              <p style={{ fontSize: 8.5, color: 'var(--dark-text)', marginBottom: 10 }}>
                Edit coordinate points to define the plot boundary. Minimum 4 points required.
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
                  {coordinates.length > 4 && (
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
              {errors.coordinates && <div style={{ color: 'var(--red-error)', fontSize: 10, marginTop: 6 }}>{errors.coordinates}</div>}
            </div>

            {/* Action Buttons */}
            <div style={{ ...buttonRowStyle, padding: '1rem 0 1rem 1rem' }}>
              <CancelButton
                onClick={handleClose}
                disabled={isSubmitting}
                fontSize="11px"
                padding="10px 18px"
                borderRadius="5px"
              >
                Cancel
              </CancelButton>
              <SaveButton
                type="submit"
                disabled={isSubmitting || !hasChanges}
                fontSize="11px"
                padding="10px 18px"
                borderRadius="5px"
              >
                Update Plot
              </SaveButton>
            </div>
          </div>
        </div>
      </form>
    </div>
    )}

    {/* Loading Modal */}
    <LoadingModal 
      isOpen={isSubmitting}
      title="Updating..."
      message="Updating farm plot"
    />

    {/* Success Modal */}
    <AlertModal 
      isOpen={showSuccessModal}
      onClose={handleSuccessClose}
      type="success"
      title="Updated Successfully!"
      message="Farm plot has been updated successfully."
      autoClose={true}
      autoCloseDelay={2000}
      buttonBorderRadius={4}
      hideButton={true}
    />
    </>
  );
}

export default EditFarmPlotModal;
