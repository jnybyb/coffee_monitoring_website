import React from 'react';
import { HiOutlineTrash } from "react-icons/hi2";

const DeleteCropStatusModal = ({ isOpen, onClose, onConfirm, record }) => {
  if (!isOpen || !record) return null;

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
      fontSize: '0.9rem',
      fontWeight: '600'
    },
    content: {
      padding: '2rem',
      textAlign: 'center'
    },
    icon: {
      fontSize: '38px',
      color: 'var(--red)',
      marginBottom: '1rem',
      display: 'flex',
      justifyContent: 'center'
    },
    message: {
      color: 'var(--black)',
      fontSize: '12px',
      marginBottom: '1.5rem',
      lineHeight: '1.5'
    },
    recordInfo: {
      backgroundColor: '#f8f9fa',
      padding: '1rem',
      borderRadius: '6px',
      margin: '0 auto 1.5rem',
      border: '1px solid #e9ecef'
    },
    surveyDate: {
      fontWeight: '600',
      color: 'var(--emerald-green)',
      fontSize: '16px',
      marginBottom: '0.5rem'
    },
    recordDetails: {
      color: 'var(--black)',
      fontSize: '14px',
      fontWeight: '500'
    },
    warning: {
      color: 'var(--red)',
      fontSize: '11px',
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

  const handleConfirm = () => {
    onConfirm(record);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Delete Crop Status Record</h2>
        </div>

        <div style={styles.content}>
          <div style={styles.icon}>
            <HiOutlineTrash size={38} color="#dc3545" />
          </div>

          <p style={styles.message}>Are you sure you want to delete this crop status record?</p>

          <p style={styles.warning}>This action cannot be undone. All crop status data will be permanently deleted.</p>

          <div style={styles.buttons}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                ...styles.button,
                ...styles.cancelButton
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f8f9fa';
                e.target.style.borderColor = '#adb5bd';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.borderColor = 'var(--gray)';
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              style={{
                ...styles.button,
                ...styles.deleteButton
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#dc3545'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--red)'}
            >
              Delete Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteCropStatusModal;
