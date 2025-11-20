import React from 'react';
import { HiOutlineTrash } from "react-icons/hi2";
import { FaRegIdCard } from "react-icons/fa";

const DeleteBeneficiaryModal = ({ isOpen, onClose, onConfirm, beneficiary }) => {
  if (!isOpen || !beneficiary) return null;

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
      fontSize: '48px',
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
    beneficiaryInfo: {
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
    avatar: {
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
    avatarImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    avatarPlaceholder: {
      fontSize: '18px'
    },
    beneficiaryId: {
      fontWeight: '600',
      color: 'var(--emerald-green)',
      fontSize: '12px',
      marginTop: '.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    beneficiaryName: {
      color: 'var(--black)',
      fontSize: '17px',
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
    onConfirm(beneficiary);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Modal Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Delete Beneficiary</h2>
        </div>

        {/* Modal Content */}
        <div style={styles.content}>
          {/* Warning Icon */}
          <div style={styles.icon}>
            <HiOutlineTrash size={38} color="#dc3545" />
          </div>

          {/* Confirmation Message */}
          <p style={styles.message}>
            Are you sure you want to delete this beneficiary?
          </p>

          {/* Beneficiary Information */}
          <div style={styles.beneficiaryInfo}>
            {beneficiary.picture ? (
              <div style={styles.avatar}>
                <img
                  src={`http://localhost:5000${beneficiary.picture}`}
                  alt="Profile"
                  style={styles.avatarImage}
                />
              </div>
            ) : (
              <div style={styles.avatar}>
                <div style={styles.avatarPlaceholder}>👤</div>
              </div>
            )}
            <div>
              <div style={styles.beneficiaryName}>
                {beneficiary.firstName} {beneficiary.middleName} {beneficiary.lastName}
              </div>
              <div style={styles.beneficiaryId}>
                <FaRegIdCard size={12} /> {beneficiary.beneficiaryId}
              </div>
             
            </div>
          </div>

          {/* Warning Message */}
          <p style={styles.warning}>
            This action cannot be undone. All beneficiary data will be permanently deleted.
          </p>
          
          

          {/* Action Buttons */}
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
              Delete Beneficiary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteBeneficiaryModal; 