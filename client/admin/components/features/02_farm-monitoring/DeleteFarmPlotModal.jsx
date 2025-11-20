import React, { useState } from 'react';
import { HiOutlineTrash } from "react-icons/hi2";
import { FaRegIdCard } from "react-icons/fa";

const DeleteFarmPlotModal = ({ isOpen, onClose, onConfirm, plot, plotIndex, isLoading = false }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  if (!isOpen || !plot) return null;

  // Helper function to extract plot number
  const getPlotNumber = () => {
    console.log('DeleteFarmPlotModal - plotIndex:', plotIndex);
    console.log('DeleteFarmPlotModal - plot:', plot);
    
    // If plotIndex is provided, use it to calculate plot number (index + 1)
    if (plotIndex !== undefined && plotIndex !== null) {
      const plotNum = plotIndex + 1;
      console.log('DeleteFarmPlotModal - using plotIndex, result:', plotNum);
      return plotNum;
    }
    
    // Fallback to existing logic
    if (plot.plotNumber) {
      // If plotNumber already contains "Plot #", extract just the number
      const match = plot.plotNumber.match(/Plot\s*#?\s*(\d+)/i);
      if (match) {
        console.log('DeleteFarmPlotModal - using plotNumber match, result:', match[1]);
        return match[1];
      }
      // If it's just a number or other format, return as is
      console.log('DeleteFarmPlotModal - using plotNumber as is, result:', plot.plotNumber);
      return plot.plotNumber;
    }
    if (plot.id) {
      console.log('DeleteFarmPlotModal - using plot.id, result:', plot.id);
      return plot.id;
    }
    console.log('DeleteFarmPlotModal - fallback to N/A');
    return 'N/A';
  };

  const styles = {
    overlay: {
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
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '0',
      maxWidth: '350px',
      width: '90%',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      position: 'relative',
      overflow: 'hidden'
    },
    header: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderBottom: '.5px solid #e9ecef',
      padding: '1.5rem 1.5rem',
      background: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px'
    },
    title: {
      color: 'var(--black)',
      margin: 0,
      fontSize: '1rem',
      fontWeight: '600'
    },
    content: {
      padding: '2rem',
      textAlign: 'center'
    },
    icon: {
      fontSize: '48px',
      color: 'var(--red)',
      marginBottom: '1rem',
      display: 'flex',
      justifyContent: 'center'
    },
    message: {
      color: 'var(--black)',
      fontSize: '13.5px',
      marginBottom: '1.5rem',
      lineHeight: '1.5',
      fontWeight: '600',

    },
    plotInfo: {
      backgroundColor: '#f8f9fa',
      padding: '1rem',
      borderRadius: '6px',
      margin: '0 auto 1.5rem',
      border: '1px solid #e9ecef',
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '12px',
      textAlign: 'left'
    },
    plotIcon: {
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f9fa',
      border: '2px solid #e8f5e8'
    },
    plotIconText: {
      fontSize: '18px',
      color: '#2d7c4a',
      fontWeight: 'bold'
    },
    plotDetails: {
      textAlign: 'left'
    },
    plotNumber: {
      fontWeight: '600',
      color: 'var(--emerald-green)',
      fontSize: '12px',
      marginTop: '.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    plotName: {
      color: 'var(--black)',
      fontSize: '17px',
      fontWeight: '500'
    },
    beneficiaryInfo: {
      fontSize: '11px',
      color: '#6c757d',
      marginTop: '4px'
    },
    warning: {
      color: 'var(--red)',
      fontSize: '10px',
      fontStyle: 'italic',
      marginBottom: '1.5rem'
    },
    buttons: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '11px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      border: 'none'
    },
    cancelButton: {
      border: '1px solid var(--gray)',
      backgroundColor: 'white',
      color: 'var(--black)'
    },
    deleteButton: {
      backgroundColor: 'var(--red)',
      color: 'white'
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = async () => {
    if (isLoading || isDeleting) return;
    
    // Close modal immediately and let parent handle loading/success
    onClose();
    
    // Call the onConfirm function (parent will handle loading and success)
    await onConfirm();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Modal Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Delete Farm Plot</h2>
        </div>

        {/* Modal Content */}
        <div style={styles.content}>
          {/* Warning Icon */}
          <div style={styles.icon}>
            <HiOutlineTrash size={38} color="#dc3545" />
          </div>

          {/* Confirmation Message */}
          <p style={styles.message}>
            Are you sure you want to delete this Farm Plot #{getPlotNumber()}?
          </p>

          {/* Warning Message */}
          <p style={styles.warning}>
            This action cannot be undone. All farm plot data will be permanently deleted.
          </p>
          
          {/* Action Buttons */}
          <div style={styles.buttons}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                ...styles.button,
                ...styles.cancelButton,
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = '#f8f9fa';
                  e.target.style.borderColor = '#adb5bd';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = 'var(--gray)';
                }
              }}
              disabled={isLoading || isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              style={{
                ...styles.button,
                ...styles.deleteButton,
                opacity: (isLoading || isDeleting) ? 0.6 : 1,
                cursor: (isLoading || isDeleting) ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isLoading && !isDeleting) {
                  e.target.style.backgroundColor = '#c82333';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--red)';
              }}
              disabled={isLoading || isDeleting}
            >
              {(isLoading || isDeleting) ? 'Deleting...' : 'Delete Plot'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteFarmPlotModal;
