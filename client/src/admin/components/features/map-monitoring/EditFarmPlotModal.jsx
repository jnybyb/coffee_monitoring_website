import React, { useState, useEffect } from 'react';

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
  backgroundColor: 'white',
  borderRadius: 8,
  padding: '0 1rem ',
  maxWidth: '480px',
  width: '85%',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  position: 'relative',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '.5px solid #e9ecef',
  padding: '1.50rem 1.25rem',
  background: 'white',
  position: 'sticky',
  top: 0,
  zIndex: 10,
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  fontSize: 30,
  color: '#6c757d',
  cursor: 'pointer',
  padding: 0,
  width: 30,
  height: 30,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
};

const labelStyle = {
  fontWeight: 500,
  fontSize: 13,
  marginBottom: 4,
  display: 'block',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #ccc',
  fontSize: 12,
  marginBottom: 0,
  background: 'white',
};

// Slightly more compact inputs for coordinate fields
const coordInputBoxStyle = {
  ...inputStyle,
  padding: '6px 10px',
};

const readOnlyInputStyle = {
  ...inputStyle,
  background: '#f5f5f5',
  color: '#888',
  cursor: 'not-allowed',
};

const selectStyle = {
  ...inputStyle,
  padding: '10px 32px 10px 12px',
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
  justifyContent: 'flex-end',
  gap: 10,
  marginTop: 18,
};

const cancelBtnStyle = {
  background: '#eee',
  border: 'none',
  borderRadius: 6,
  padding: '10px 24px',
  color: '#333',
  fontWeight: 500,
  cursor: 'pointer',
  fontSize: 14,
};

const saveBtnStyle = {
  background: '#2d7c4a',
  border: 'none',
  borderRadius: 6,
  padding: '8px 16px',
  color: 'white',
  fontWeight: 500,
  cursor: 'pointer',
  fontSize: 12,
};

const addButtonStyle = {
  background: '#e8f5e8',
  border: '1px solid #2d7c4a',
  borderRadius: 6,
  padding: '8px 16px',
  color: '#2d7c4a',
  fontWeight: 500,
  cursor: 'pointer',
  fontSize: 13,
  marginTop: 8,
};

const coordinateRowStyle = {
  display: 'flex',
  gap: 8,
  alignItems: 'flex-start',
  padding: '8px 12px',
  backgroundColor: '#f8f9fa',
  borderRadius: 6,
  marginBottom: 8,
  border: '1px solid #e9ecef',
};

const removeButtonStyle = {
  background: '#dc3545',
  border: 'none',
  borderRadius: 4,
  padding: '4px 8px',
  color: 'white',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 'bold',
  minWidth: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '20px',
};

const sectionTitleStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: '#2c5530',
  marginTop: 16,
};

const pointTitleStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: '#2c5530',
  marginBottom: 8,
};

const coordinateInputStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  flex: 1,
};

const coordinateFieldsStyle = {
  display: 'flex',
  gap: 8,
  alignItems: 'flex-start',
};

const plotNameInputStyle = {
  ...inputStyle,
  fontSize: 16,
  fontWeight: 500,
  color: '#2c5530',
};

const twoColRowStyle = {
  display: 'flex',
  gap: 8,
};

const twoColColStyle = {
  flex: 1,
};

const formBodyStyle = {
  padding: '1.25rem',
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
};

// Helper function to convert DMS to Decimal Degrees
const dmsToDecimal = (dmsString) => {
  if (!dmsString) return null;
  
  // Match DMS format: 7°15'20.4"N or 126°20'36.5"E
  const regex = /([0-9.]+)[°\s]+([0-9.]+)?['\s]*([0-9.]+)?["\s]*([NSEW])?/i;
  const match = dmsString.match(regex);
  
  if (!match) return null;
  
  let degrees = parseFloat(match[1] || 0);
  let minutes = parseFloat(match[2] || 0);
  let seconds = parseFloat(match[3] || 0);
  let direction = match[4] || '';
  
  let decimal = degrees + minutes / 60 + seconds / 3600;
  
  // Apply direction
  if (direction.toUpperCase() === 'S' || direction.toUpperCase() === 'W') {
    decimal *= -1;
  }
  
  return decimal;
};

// Helper function to convert Decimal Degrees to DMS format
const decimalToDMS = (decimal, isLatitude = true) => {
  if (decimal === null || decimal === undefined || isNaN(decimal)) return '';
  
  const absDecimal = Math.abs(decimal);
  const degrees = Math.floor(absDecimal);
  const minutesDecimal = (absDecimal - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = (minutesDecimal - minutes) * 60;
  
  // Determine direction
  let direction = '';
  if (isLatitude) {
    direction = decimal >= 0 ? 'N' : 'S';
  } else {
    direction = decimal >= 0 ? 'E' : 'W';
  }
  
  return `${degrees}°${minutes}'${seconds.toFixed(1)}"${direction}`;
};

// Helper function to detect coordinate format
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

// Helper to format address safely without showing "undefined"
const formatSelectedAddress = (beneficiary) => {
  if (!beneficiary) return '';
  if (beneficiary.address) return beneficiary.address;
  const parts = [beneficiary.purok, beneficiary.barangay, beneficiary.municipality, beneficiary.province]
    .filter(Boolean)
    .map(part => String(part).trim())
    .filter(part => part.length > 0);
  return parts.join(', ');
};

// Helper function to extract plot number
const getPlotNumber = (plot, plotIndex) => {
  // If plotIndex is provided, use it to calculate plot number (index + 1)
  if (plotIndex !== undefined && plotIndex !== null) {
    return plotIndex + 1;
  }
  
  // Fallback to existing logic
  if (plot.plotNumber) {
    // If plotNumber already contains "Plot #", extract just the number
    const match = String(plot.plotNumber).match(/Plot\s*#?\s*(\d+)/i);
    if (match) {
      return match[1];
    }
    // If it's just a number or other format, return as is
    return plot.plotNumber;
  }
  if (plot.id) {
    return plot.id;
  }
  return '1';
};

function EditFarmPlotModal({ isOpen, onClose, onSubmit, plot, beneficiaries, isLoading = false, plotIndex }) {
  const [selectedId, setSelectedId] = useState('');
  const [coordinates, setCoordinates] = useState([
    { lat: '', lng: '' },
    { lat: '', lng: '' },
    { lat: '', lng: '' }
  ]);
  const [errors, setErrors] = useState({});
  

  // Find selected beneficiary object
  const selected = beneficiaries?.find(b => b.beneficiaryId === selectedId || b.id === selectedId) || {};

  // Initialize form data when plot changes
  useEffect(() => {
    if (plot && isOpen) {
      setSelectedId(plot.beneficiaryId || '');
      
      // Initialize coordinates from existing plot data in DMS format
      if (plot.coordinates && Array.isArray(plot.coordinates)) {
        const plotCoordinates = plot.coordinates.map(coord => ({
          lat: decimalToDMS(coord.lat, true) || '',
          lng: decimalToDMS(coord.lng, false) || ''
        }));
        
        // Ensure minimum 3 coordinates
        while (plotCoordinates.length < 3) {
          plotCoordinates.push({ lat: '', lng: '' });
        }
        
        setCoordinates(plotCoordinates);
      } else {
        setCoordinates([
          { lat: '', lng: '' },
          { lat: '', lng: '' },
          { lat: '', lng: '' }
        ]);
      }
      
      setErrors({});
    }
  }, [plot, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedId('');
      setCoordinates([
        { lat: '', lng: '' },
        { lat: '', lng: '' },
        { lat: '', lng: '' }
      ]);
      setErrors({});
    }
  }, [isOpen]);

  const addCoordinate = () => {
    setCoordinates([...coordinates, { lat: '', lng: '' }]);
  };

  const removeCoordinate = (index) => {
    // Only allow removal if we have more than 3 coordinates
    if (coordinates.length > 3) {
      setCoordinates(coordinates.filter((_, i) => i !== index));
    }
  };

  const updateCoordinate = (index, field, value) => {
    const updated = [...coordinates];
    updated[index][field] = value;
    setCoordinates(updated);
  };

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
      
      validCoordinates.push({ lat, lng });
    }
    
    return validCoordinates;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return; // Prevent submission while loading
    
    const newErrors = {};
    
    if (!selectedId) {
      newErrors.selectedId = 'Beneficiary is required';
    }
    
    // Validate coordinates
    const validCoordinates = coordinates.filter(coord => coord.lat && coord.lng);
    if (validCoordinates.length < 3) {
      newErrors.coordinates = 'At least 3 coordinate points are required to define a plot boundary';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      // Convert and validate all coordinates
      const convertedCoordinates = validateAndConvertCoordinates(validCoordinates);
      
      // Close modal immediately and let parent handle loading/success
      onClose();
      
      // Call the onSubmit function (parent will handle loading and success)
      await onSubmit({
        id: plot.id, // Keep the original plot ID
        plotNumber: plot.plotNumber, // Keep the existing plot number
        beneficiaryId: selected.beneficiaryId || selected.id,
        fullName: selected.fullName || selected.name,
        address: selected.address,
        coordinates: convertedCoordinates,
        color: plot.color, // Keep the original color
      });
      
    } catch (error) {
      // If there's an error, show it in the modal
      newErrors.coordinates = error.message || 'Failed to update farm plot';
      setErrors(newErrors);
    }
  };

  if (!isOpen || !plot) return null;

  return (
    <div style={modalStyle}>
      <form style={formStyle} onSubmit={handleSubmit} className="hide-scrollbar-modal">
        {/* Modal Header */}
        <div style={headerStyle}>
          <h2 style={{ color: 'var(--black)', margin: 0, fontSize: '1.4rem', fontWeight: 600 }}>Edit Farm Plot #{getPlotNumber(plot, plotIndex)}</h2>
          <button
            type="button"
            onClick={onClose}
            style={closeBtnStyle}
            aria-label="Close"
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>

        <div style={formBodyStyle}>
          {/* Beneficiary Selection and ID in one row */}
          <div style={twoColRowStyle}>
            <div style={twoColColStyle}>
              <label style={labelStyle}>Beneficiary Full Name</label>
              <select
                style={selectStyle}
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
                required
              >
                <option value="">Select beneficiary</option>
                {beneficiaries?.map(b => (
                  <option key={b.beneficiaryId || b.id} value={b.beneficiaryId || b.id}>
                    {b.fullName || b.name || `${b.firstName || ''} ${b.middleName || ''} ${b.lastName || ''}`.trim()}
                  </option>
                ))}
              </select>
              {errors.selectedId && <div style={{ color: '#c00', fontSize: 12 }}>{errors.selectedId}</div>}
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
            <p style={{ fontSize: 10, color: '#666', marginBottom: 15 }}>
              Edit coordinate points to define the plot boundary. Minimum 3 points required.
            </p>
            {coordinates.map((coord, index) => (
              <div key={index} style={coordinateRowStyle}>
                <div style={coordinateInputStyle}>
                  <div style={pointTitleStyle}>Point {index + 1}</div>
                  <div style={coordinateFieldsStyle}>
                    <div style={{ flex: 1 }}>
                      <label style={{ ...labelStyle, fontSize: 11 }}>Latitude</label>
                      <input
                        style={coordInputBoxStyle}
                        type="text"
                        value={coord.lat}
                        onChange={e => updateCoordinate(index, 'lat', e.target.value)}
                        placeholder="7°15'20.4&quot;N"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ ...labelStyle, fontSize: 11 }}>Longitude</label>
                      <input
                        style={coordInputBoxStyle}
                        type="text"
                        value={coord.lng}
                        onChange={e => updateCoordinate(index, 'lng', e.target.value)}
                        placeholder="126°20'36.5&quot;E"
                      />
                    </div>
                  </div>
                </div>
                {coordinates.length > 3 && (
                  <button
                    type="button"
                    style={removeButtonStyle}
                    onClick={() => removeCoordinate(index)}
                    title="Remove coordinate"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button type="button" style={addButtonStyle} onClick={addCoordinate}>
              + Add Coordinate Point
            </button>
            {errors.coordinates && <div style={{ color: '#c00', fontSize: 12, marginTop: 8 }}>{errors.coordinates}</div>}
          </div>

          {/* Action Buttons */}
          <div style={{ ...buttonRowStyle, paddingTop: '1rem', borderTop: '1px solid #e9ecef' }}>
            <button type="button" style={cancelBtnStyle} onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button
              type="submit"
              style={{
                ...saveBtnStyle,
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Plot'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default EditFarmPlotModal;

<style>
{`
.hide-scrollbar-modal::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar-modal {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}
`}
</style>
