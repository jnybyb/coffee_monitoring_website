import React, { useState } from 'react';
import { FaRegIdCard } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import DeleteFarmPlotModal from './DeleteFarmPlotModal';
import { LuLandPlot } from 'react-icons/lu';

const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.60)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const formStyle = {
  background: 'white',
  borderRadius: 8,
  padding: 0,
  minWidth: 450,
  maxWidth: 500,
  maxHeight: '85vh',
  boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
};

const headerStyle = {
  fontSize: 19,
  fontWeight: 600,
  margin: 0,
  padding: '30px 28px 20px 28px',
  textAlign: 'left',
  borderBottom: '1px solid #e0e0e0',
  color: '#2c5530',
  backgroundColor: 'white',
  position: 'sticky',
  top: 0,
  zIndex: 10,
};

const closeBtnStyle = {
  position: 'absolute',
  top: 15,
  right: 22,
  background: 'none',
  border: 'none',
  fontSize: 30,
  color: '#888',
  cursor: 'pointer',
};

const contentStyle = {
  padding: '28px',
  overflowY: 'auto',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
};

const profileSectionStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: 16,
  backgroundColor: '#f8f9fa',
  borderRadius: 8,
  border: '1px solid #e8f5e8',
};

const profileImageStyle = {
  width: 50,
  height: 50,
  borderRadius: '50%',
  border: '2px solid #2d7c4a',
  objectFit: 'cover',
  backgroundColor: '#f1f3f5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#6c757d',
  fontSize: 14,
  fontWeight: 'bold',
};

const profileInfoStyle = {
  flex: 1,
};

const beneficiaryNameStyle = {
  fontSize: 14,
  fontWeight: 700,
  color: '#2d7c4a',
  marginBottom: 6,
};

const beneficiaryIdStyle = {
  fontSize: 10,
  color: '#6c757d',
  marginBottom: 4,
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

const addressStyle = {
  fontSize: 10,
  color: '#495057',
  lineHeight: 1.4,
  display: 'flex',
  alignItems: 'flex-start',
  gap: 6,
};

const fieldStyle = {
  marginBottom: 16,
};

const labelStyle = {
  fontWeight: 600,
  fontSize: 14,
  marginBottom: 8,
  display: 'block',
  color: '#2c5530',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const valueStyle = {
  fontSize: 16,
  color: '#343a40',
  fontWeight: 500,
  padding: '12px 16px',
  backgroundColor: '#f8f9fa',
  borderRadius: 8,
  border: '1px solid #e9ecef',
  minHeight: '24px',
};

const locationSectionStyle = {
  padding: 5,
};

const locationTitleStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: '#2c5530',
  marginBottom: 7,
};

const locationInfoStyle = {
  fontSize: 14,
  color: '#495057',
  lineHeight: 1.4,
};

const coordinatesContainerStyle = {
  padding: 12,
  backgroundColor: '#f8f9fa',
  borderRadius: 8,
  border: '1px solid #e9ecef',
  maxHeight: 240,
  overflowY: 'auto',
  fontSize: 12,
};

const buttonRowStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 12,
  marginTop: 20,
  paddingTop: 20,
  borderTop: '1px solid #e0e0e0',
};

const editButtonStyle = {
  background: '#2d7c4a',
  border: 'none',
  borderRadius: 5,
  padding: '8px 12px',
  color: 'white',
  fontWeight: 400,
  cursor: 'pointer',
  fontSize: 10,
  transition: 'background-color 0.2s',
};

const deleteButtonStyle = {
  background: '#dc3545',
  border: 'none',
  borderRadius: 5,
  padding: '8px 12px',
  color: 'white',
  fontWeight: 400,
  cursor: 'pointer',
  fontSize: 10,
  transition: 'background-color 0.2s',
};

// Helper function to get initials from name
const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

function ViewFarmPlotModal({ isOpen, onClose, plot, onEdit, onDelete, plotIndex, otherPlots = [] }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  if (!isOpen || !plot) return null;

  const toDMS = (decimal, isLat) => {
    if (decimal === null || decimal === undefined || isNaN(decimal)) return '';
    const abs = Math.abs(Number(decimal));
    const degrees = Math.floor(abs);
    const minutesFloat = (abs - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = (minutesFloat - minutes) * 60;
    const dir = isLat ? (decimal >= 0 ? 'N' : 'S') : (decimal >= 0 ? 'E' : 'W');
    const secFixed = seconds.toFixed(2);
    return `${degrees}° ${minutes}' ${secFixed}" ${dir}`;
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(plot, plotIndex);
    }
    onClose();
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(plot, plotIndex);
    }
    setShowDeleteModal(false);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };


  return (
    <div style={modalStyle}>
      <div style={formStyle}>
        <div style={headerStyle}>
          {`Plot #${(String(plot.plotNumber || '').match(/\d+/) || [])[0] || (plotIndex + 1)}`}
          <button type="button" style={closeBtnStyle} onClick={onClose} aria-label="Close">×</button>
        </div>
        
        <div style={contentStyle} className="hide-scrollbar-modal">
          {/* Beneficiary Details Section */}
          <div style={locationSectionStyle}>
            <div style={locationTitleStyle}>Beneficiary Details</div>
            <div style={locationInfoStyle}>
              <div style={profileSectionStyle}>
                <div style={profileImageStyle}>
                  {plot.beneficiaryPicture ? (
                    <img 
                      src={`http://localhost:5000${plot.beneficiaryPicture}`} 
                      alt="Profile" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    getInitials(plot.beneficiaryName)
                  )}
                </div>
                <div style={profileInfoStyle}>
                  <div style={beneficiaryNameStyle}>{plot.beneficiaryName || 'Unknown Beneficiary'}</div>
                  <div style={beneficiaryIdStyle}>
                    <FaRegIdCard size={12} />
                    <span>{plot.beneficiaryId || 'N/A'}</span>
                  </div>
                  <div style={addressStyle}>
                    <FaLocationDot size={12} style={{ marginTop: 1 }} />
                    <span>{plot.address || 'Address not available'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Plot Coordinates Section */}
          <div style={locationSectionStyle}>
            <div style={locationTitleStyle}>All Plot Coordinates</div>
            <div style={locationInfoStyle}>
              {Array.isArray(plot.coordinates) && plot.coordinates.length > 0 ? (
                <div style={coordinatesContainerStyle}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: 11, color: '#6c757d', borderBottom: '1px solid #e9ecef' }}>Point</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: 11, color: '#6c757d', borderBottom: '1px solid #e9ecef' }}>Latitude (DMS)</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: 11, color: '#6c757d', borderBottom: '1px solid #e9ecef' }}>Longitude (DMS)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plot.coordinates.map((c, i) => (
                        <tr key={i}>
                          <td style={{ padding: '6px 8px', borderBottom: '1px solid #f1f3f5' }}>{i + 1}</td>
                          <td style={{ padding: '6px 8px', borderBottom: '1px solid #f1f3f5' }}>{toDMS(c.lat, true)}</td>
                          <td style={{ padding: '6px 8px', borderBottom: '1px solid #f1f3f5' }}>{toDMS(c.lng, false)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div>No coordinates available</div>
              )}
            </div>
          </div>

          {/* Other Farm Plots Section */}
          <div style={locationSectionStyle}>
            <div style={locationTitleStyle}>Other Farm Plots</div>
            <div style={locationInfoStyle}>
              {Array.isArray(otherPlots) && otherPlots.filter(p => (p.beneficiaryId || p.beneficiary_id) === (plot.beneficiaryId || plot.beneficiary_id) && (p.id !== plot.id)).length > 0 ? (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', 
                  gap: '12px',
                  padding: '8px 0'
                }}>
                  {otherPlots
                    .filter(p => (p.beneficiaryId || p.beneficiary_id) === (plot.beneficiaryId || plot.beneficiary_id) && (p.id !== plot.id))
                    .map((p, i) => {
                      // Generate a consistent color based on plot ID or index
                      const colors = ['#2d7c4a', '#28a745', '#20c997', '#17a2b8', '#6f42c1', '#e83e8c', '#fd7e14', '#ffc107'];
                      const colorIndex = (p.id || i) % colors.length;
                      const plotColor = p.color || colors[colorIndex];
                      
                      // Get plot number by finding the index of this plot in the original farmPlots array
                      const originalIndex = otherPlots.findIndex(plot => plot.id === p.id);
                      const plotNumber = originalIndex !== -1 ? (originalIndex + 1) : (p.id || (i + 1));
                      
                      return (
                        <div 
                          key={p.id || i} 
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 8px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            border: '1px solid #e9ecef',
                            transition: 'all 0.2s ease',
                            minHeight: '80px',
                            justifyContent: 'center'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: plotColor,
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            <LuLandPlot size={20} />
                          </div>
                          <div style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#2d7c4a',
                            textAlign: 'center'
                          }}>
                            Plot #{plotNumber}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: '#6c757d' }}>No other farm plots.</div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={buttonRowStyle}>
            <button 
              type="button" 
              style={{ ...editButtonStyle, padding: '10px 18px', fontSize: 13 }} 
              onClick={handleEdit}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1e5a3a'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2d7c4a'}
            >
              Edit Plot
            </button>
            <button 
              type="button" 
              style={{ ...deleteButtonStyle, padding: '10px 18px', fontSize: 13 }} 
              onClick={handleDelete}
              onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
            >
              Delete Plot
            </button>
          </div>
        </div>
      </div>
      
      {/* Delete Farm Plot Modal */}
      <DeleteFarmPlotModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        plot={plot}
        plotIndex={plotIndex}
      />
    </div>
  );
}

export default ViewFarmPlotModal;
