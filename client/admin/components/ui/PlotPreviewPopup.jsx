import React from 'react';

/**
 * PlotPreviewPopup Component
 * A minimalist popup component for displaying plot information on map markers
 * Shows only: Picture, Name, ID Number, and Plot ID
 */
const PlotPreviewPopup = ({ plot }) => {
  if (!plot) return null;

  // Helper function to get initials from name
  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      padding: '7px',
      minWidth: '170px',
      maxWidth: '170px',
      borderRadius: '2px',
    }}>
      {/* Profile Picture */}
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '3px solid #2d7c4a',
        backgroundColor: '#f1f3f5'
      }}>
        {plot.beneficiaryPicture ? (
          <img 
            src={`http://localhost:5000${plot.beneficiaryPicture}`}
            alt="Beneficiary"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 24px; font-weight: bold; color: #6c757d;">${getInitials(plot.beneficiaryName)}</div>`;
            }}
          />
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#6c757d'
          }}>
            {getInitials(plot.beneficiaryName)}
          </div>
        )}
      </div>
      
      {/* Name */}
      <div style={{
        fontSize: '14px',
        fontWeight: '600',
        color: '#2d7c4a',
        textAlign: 'center',
        lineHeight: '0.1'
      }}>
        {plot.beneficiaryName || 'Unknown'}
      </div>
      
      {/* ID Number */}
      <div style={{
        fontSize: '10px',
        color: '#6c757d',
        textAlign: 'center',
        fontWeight: '500'
      }}>
        ID: {plot.beneficiaryId || 'N/A'}
      </div>
      
      {/* Plot ID */}
      <div style={{
        fontSize: '12px',
        color: '#2d7c4a',
        textAlign: 'center',
        fontWeight: '600',
        backgroundColor: 'rgba(45, 124, 74, 0.1)',
        padding: '6px 12px',
        borderRadius: '4px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {plot.id || 'N/A'}
      </div>
    </div>
  );
};

export default PlotPreviewPopup;
