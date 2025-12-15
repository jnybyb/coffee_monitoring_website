import React, { useState } from 'react';
import { FaRegIdCard } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import EditFarmPlotModal from './EditFarmPlotModal';
import { LuLandPlot } from 'react-icons/lu';
import { ActionButton } from '../../ui/BeneficiaryButtons';
import { NoOtherFarmPlots } from '../../ui/NoDataDisplay';
import AlertModal, { DeleteSuccessModal } from '../../ui/AlertModal';
import { DeleteLoadingModal } from '../../ui/LoadingModal';
import { farmPlotsAPI } from '../../../services/api';

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
  background: 'var(--white)',
  borderRadius: 5,
  padding: 0,
  minWidth: 450,
  maxWidth: 500,
  maxHeight: '90vh',
  boxShadow: '0 8px 32px var(--shadow-dark)',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
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

const contentStyle = {
  padding: '0 0.75rem',
  overflowY: 'auto',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  scrollbarWidth: 'thin',
  msOverflowStyle: 'none',
};

const profileSectionStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: 12,
  backgroundColor: 'rgba(0, 0, 0, 0.035)',
  borderRadius: 4,
  border: '1px solid var(--border-gray)',
};

const profileImageStyle = {
  width: 45,
  height: 45,
  borderRadius: '50%',
  border: '2px solid var(--dark-green)',
  objectFit: 'cover',
  backgroundColor: 'var(--light-gray)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--placeholder-text)',
  fontSize: 14,
  fontWeight: 'bold',
};

const profileInfoStyle = {
  flex: 1,
};

const beneficiaryNameStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--dark-green)',
  marginBottom: 4,
};

const beneficiaryIdStyle = {
  fontSize: 10,
  color: 'var(--placeholder-text)',
  marginBottom: 3,
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
};

const addressStyle = {
  fontSize: 10,
  color: 'var(--pagination-gray)',
  lineHeight: 1.4,
  display: 'flex',
  alignItems: 'flex-start',
  gap: 4,
};

const locationSectionStyle = {
  padding: 0,
};

const locationTitleStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--dark-green)',
  marginBottom: 6,
};

const locationInfoStyle = {
  fontSize: 12,
  color: 'var(--pagination-gray)',
  lineHeight: 1.4,
};

const coordinatesContainerStyle = {
  padding: 10,
  backgroundColor: 'rgba(0, 0, 0, 0.035)',
  borderRadius: 4,
  border: '1px solid var(--border-gray)',
  maxHeight: 240,
  overflowY: 'auto',
  fontSize: 11,
};

const buttonRowStyle = {
  display: 'flex',
  gap: 12,
  justifyContent: 'flex-end',
  paddingTop: '0.75rem',
  marginTop: 12,
  borderTop: '1px solid rgba(0, 0, 0, 0.035)',
};

// Extract initials from beneficiary name for profile placeholder (e.g., "John Doe" → "JD")
const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

function ViewFarmPlotModal({ isOpen, onClose, plot, otherPlots = [], beneficiaries = [], onDeleteSuccess = null }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPlot, setCurrentPlot] = useState(plot);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteLoadingModal, setShowDeleteLoadingModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [showDeleteErrorModal, setShowDeleteErrorModal] = useState(false);
  
  // Update current plot when prop changes
  React.useEffect(() => {
    if (plot) {
      setCurrentPlot(plot);
    }
  }, [plot]);

  if (!isOpen || !currentPlot) return null;

  const formBodyStyle = {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  };

  // Convert decimal coordinates to DMS format for display in table
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
    setShowEditModal(true);
  };

  const handleEditSubmit = async (updatedPlotData) => {
    try {
      await updatedPlotData;
      setShowEditModal(false);
      onClose();
    } catch (error) {
      console.error('Error updating plot:', error);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  // Switch to different plot when user clicks on another plot card
  const handlePlotCardClick = (selectedPlot) => {
    setCurrentPlot(selectedPlot);
  };

  // Handle image click to open preview
  const handleImageClick = (e) => {
    e.stopPropagation();
    if (currentPlot.beneficiaryPicture) {
      setShowImagePreview(true);
    }
  };

  const handleCloseImagePreview = () => {
    setShowImagePreview(false);
  };

  // Execute delete with sequential modal display: loading (1s) → success (1.2s) → refresh
  const handleDeleteConfirm = async () => {
    try {
      setShowDeleteConfirm(false);
      setShowDeleteLoadingModal(true);
      
      const plotId = currentPlot.id || currentPlot.plotId;
      const response = await farmPlotsAPI.delete(plotId);
      
      if (response && response.success) {
        // Display loading for 1s, then success for 1.2s before closing and refreshing data
        setTimeout(() => {
          setShowDeleteLoadingModal(false);
          setShowDeleteSuccessModal(true);
          
          setTimeout(() => {
            setShowDeleteSuccessModal(false);
            if (onDeleteSuccess) {
              onDeleteSuccess();
            }
            onClose();
          }, 1200);
        }, 1000);
      } else {
        throw new Error('Delete operation failed');
      }
    } catch (error) {
      console.error('Error deleting plot:', error);
      setShowDeleteLoadingModal(false);
      setDeleteError(error.message || 'Failed to delete the plot. Please try again.');
      setShowDeleteErrorModal(true);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };


  return (
    <div style={modalStyle}>
      <div style={formStyle}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
            <span style={{ color: 'var(--dark-green)' }}>Plot:</span> {currentPlot.plotId || currentPlot.id || 'N/A'}
          </h2>
          <button 
            type="button" 
            style={closeBtnStyle} 
            onClick={onClose} 
            aria-label="Close"
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--border-gray)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>
        
        <div style={contentStyle} className="hide-scrollbar-modal">
          <div style={formBodyStyle}>
          {/* Beneficiary Information */}
          <div style={locationSectionStyle}>
            <div style={locationTitleStyle}>Beneficiary Information</div>
            
            {/* Beneficiary Picture and Basic Info */}
            <div style={profileSectionStyle}>
              <div 
                style={{
                  ...profileImageStyle,
                  cursor: currentPlot.beneficiaryPicture ? 'pointer' : 'default',
                  transition: 'transform 0.2s ease'
                }}
                onClick={handleImageClick}
                onMouseEnter={(e) => {
                  if (currentPlot.beneficiaryPicture) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title={currentPlot.beneficiaryPicture ? 'Click to preview' : ''}
              >
                {currentPlot.beneficiaryPicture ? (
                  <img 
                    src={`http://localhost:5000${currentPlot.beneficiaryPicture}`} 
                    alt="Profile" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  getInitials(currentPlot.beneficiaryName)
                )}
              </div>
              <div style={profileInfoStyle}>
                <div style={beneficiaryNameStyle}>{currentPlot.beneficiaryName || 'Unknown Beneficiary'}</div>
                <div style={beneficiaryIdStyle}>
                  <FaRegIdCard size={10} />
                  <span>{currentPlot.beneficiaryId || 'N/A'}</span>
                </div>
                <div style={addressStyle}>
                  <FaLocationDot size={10} style={{ marginTop: 1 }} />
                  <span>{currentPlot.address || 'Address not available'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Plot Coordinates Section */}
          <div style={locationSectionStyle}>
            <div style={locationTitleStyle}>Plot Coordinates</div>
            <div style={locationInfoStyle}>
              {Array.isArray(currentPlot.coordinates) && currentPlot.coordinates.length > 0 ? (
                <div style={coordinatesContainerStyle}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: 10, color: 'var(--placeholder-text)', borderBottom: '1px solid var(--border-gray)' }}>Point</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: 10, color: 'var(--placeholder-text)', borderBottom: '1px solid var(--border-gray)' }}>Latitude (DMS)</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: 10, color: 'var(--placeholder-text)', borderBottom: '1px solid var(--border-gray)' }}>Longitude (DMS)</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: 10, color: 'var(--placeholder-text)', borderBottom: '1px solid var(--border-gray)' }}>Elevation (m)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPlot.coordinates.map((c, i) => (
                        <tr key={i}>
                          <td style={{ padding: '6px 8px', fontSize: 10, borderBottom: '1px solid var(--light-gray)' }}>{i + 1}</td>
                          <td style={{ padding: '6px 8px', fontSize: 10, borderBottom: '1px solid var(--light-gray)' }}>{toDMS(c.lat, true)}</td>
                          <td style={{ padding: '6px 8px', fontSize: 10, borderBottom: '1px solid var(--light-gray)' }}>{toDMS(c.lng, false)}</td>
                          <td style={{ padding: '6px 8px', fontSize: 10, borderBottom: '1px solid var(--light-gray)' }}>{c.elevation || 'N/A'}</td>
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
              {/* Filter to show only plots from same beneficiary, excluding current plot */}
              {Array.isArray(otherPlots) && otherPlots.filter(p => (p.beneficiaryId || p.beneficiary_id) === (currentPlot.beneficiaryId || currentPlot.beneficiary_id) && (p.id !== currentPlot.id)).length > 0 ? (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', 
                  gap: '10px',
                  padding: '8px 0'
                }}>
                  {otherPlots
                    .filter(p => (p.beneficiaryId || p.beneficiary_id) === (currentPlot.beneficiaryId || currentPlot.beneficiary_id) && (p.id !== currentPlot.id))
                    .map((p, i) => {
                      const plotId = p.plotId || p.id || 'N/A';
                      
                      return (
                        <div 
                          key={p.id || i}
                          onClick={() => handlePlotCardClick(p)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '16px 12px',
                            backgroundColor: 'var(--white)',
                            borderRadius: '6px',
                            border: '1px solid var(--light-gray)',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            minHeight: '110px',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--dark-green)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 124, 74, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--light-gray)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '48px',
                            height: '48px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(45, 124, 74, 0.1)',
                            color: 'var(--dark-green)'
                          }}>
                            <LuLandPlot size={28} strokeWidth={1.5} />
                          </div>
                          <div style={{
                            fontSize: '10px',
                            fontWeight: '600',
                            color: 'var(--dark-text)',
                            textAlign: 'center',
                            wordBreak: 'break-word',
                            width: '100%'
                          }}>
                            {plotId}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <NoOtherFarmPlots />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={buttonRowStyle}>
            <ActionButton
              onClick={handleEdit}
              backgroundColor="var(--dark-green)"
              color="white"
              borderColor="var(--dark-green)"
              fontSize="12px"
              padding="10px 18px"
              borderRadius="5px"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--dark-green)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--dark-green)'}
            >
              Edit Plot
            </ActionButton>
            <ActionButton
              onClick={handleDeleteClick}
              backgroundColor="var(--danger-red)"
              color="white"
              borderColor="var(--danger-red)"
              fontSize="12px"
              padding="10px 18px"
              borderRadius="5px"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--danger-red)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--danger-red)';
              }}
            >
              Delete Plot
            </ActionButton>
          </div>
          </div>
        </div>
      </div>
      
      {/* Edit Farm Plot Modal */}
      <EditFarmPlotModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onSubmit={handleEditSubmit}
        plot={currentPlot}
        beneficiaries={beneficiaries}
      />

      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        type="delete"
        title="Delete Plot?"
        message={`Are you sure you want to delete plot ${currentPlot.plotId || currentPlot.id}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        showCancel={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        maxWidth={350}
        borderRadius={6}
      />

      {/* Delete Loading Modal */}
      <DeleteLoadingModal
        isOpen={showDeleteLoadingModal}
        onClose={() => setShowDeleteLoadingModal(false)}
      />

      {/* Delete Success Modal */}
      <DeleteSuccessModal
        isOpen={showDeleteSuccessModal}
        onClose={() => setShowDeleteSuccessModal(false)}
      />

      {/* Delete Error Modal */}
      <AlertModal
        isOpen={showDeleteErrorModal}
        onClose={() => setShowDeleteErrorModal(false)}
        type="error"
        title="Delete Failed"
        message={deleteError || 'An unexpected error occurred while deleting the plot.'}
        confirmText="OK"
        maxWidth={350}
        borderRadius={6}
      />

      {/* Image Preview Modal */}
      {showImagePreview && currentPlot.beneficiaryPicture && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={handleCloseImagePreview}
        >
          <button
            type="button"
            onClick={handleCloseImagePreview}
            style={{
              position: 'absolute',
              top: 20,
              right: 30,
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              fontSize: 24,
              color: 'var(--dark-text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              fontWeight: 'bold',
              zIndex: 2001
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ×
          </button>
          <img
            src={`http://localhost:5000${currentPlot.beneficiaryPicture}`}
            alt="Beneficiary Profile"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              borderRadius: 8,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              objectFit: 'contain'
            }}
          />
        </div>
      )}
    </div>
  );
}

export default ViewFarmPlotModal;
