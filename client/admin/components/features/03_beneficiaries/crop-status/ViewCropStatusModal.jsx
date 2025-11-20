import React from 'react';
import { IoClose } from "react-icons/io5";
import { AiOutlineEdit } from "react-icons/ai";
import { HiOutlineTrash } from "react-icons/hi2";
import { FaRegIdCard } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

const ViewCropStatusModal = ({ isOpen, onClose, record, onEdit, onDelete, beneficiary }) => {
  if (!isOpen || !record) return null;
  


  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflow: 'hidden',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    header: {
      padding: '1.5rem 1.5rem 1rem 1.5rem',
      borderBottom: '1px solid #e8f5e8',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      margin: 0,
      color: '#2c5530',
      fontSize: '1rem',
      fontWeight: '600'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.3rem',
      cursor: 'pointer',
      color: '#6c757d',
      padding: '0.25rem',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.2s'
    },
    content: {
      padding: '1.5rem',
      maxHeight: 'calc(90vh - 140px)',
      overflowY: 'auto'
    },
    section: {
      marginBottom: '1.5rem'
    },
    sectionTitle: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#2c5530',
      marginBottom: '0.75rem',
      paddingBottom: '0.5rem',
      borderBottom: '2px solid #e8f5e8'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem'
    },
    infoItem: {
      marginBottom: '0.75rem'
    },
    label: {
      fontSize: '0.625rem',
      fontWeight: '600',
      color: '#495057',
      marginBottom: '0.25rem',
      display: 'block'
    },
    value: {
      fontSize: '0.75rem',
      color: '#212529',
      padding: '0.5rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '6px',
      border: '1px solid #e8f5e8'
    },
    beneficiaryInfo: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e8f5e8'
    },
    avatar: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      overflow: 'hidden',
      border: '2px solid #e8f5e8',
      flexShrink: 0
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    avatarPlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: '#e8f5e8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      color: '#6c757d'
    },
    beneficiaryDetails: {
      flex: 1
    },
    beneficiaryName: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#2c5530',
      marginBottom: '0.5rem'
    },
    beneficiaryId: {
      fontSize: '0.7rem',
      color: '#6c757d',
      marginBottom: '0.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    beneficiaryAddress: {
      fontSize: '0.7rem',
      color: '#6c757d',
      lineHeight: '1.3',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    cropStats: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    statCard: {
      padding: '1rem',
      borderRadius: '8px',
      textAlign: 'center',
      border: '1px solid #e8f5e8'
    },
    aliveCard: {
      backgroundColor: '#f0f8f0',
      borderColor: '#28a745'
    },
    deadCard: {
      backgroundColor: '#f8f0f0',
      borderColor: '#dc3545'
    },
    statNumber: {
      fontSize: '0.875rem',
      fontWeight: '700',
      marginBottom: '0.25rem'
    },
    aliveNumber: {
      color: '#28a745'
    },
    deadNumber: {
      color: '#dc3545'
    },
    statLabel: {
      fontSize: '0.5rem',
      color: '#6c757d',
      fontWeight: '500'
    },
    actions: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end',
      paddingTop: '1rem',
      borderTop: '1px solid #e8f5e8'
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '6px',
      border: 'none',
      fontSize: '0.75rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    editButton: {
      backgroundColor: '#2c5530',
      color: 'white'
    },
    deleteButton: {
      backgroundColor: '#dc3545',
      color: 'white'
    },
    imageGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
      gap: '0.5rem'
    },
    imageContainer: {
      position: 'relative',
      width: '100%',
      paddingTop: '100%', /* 1:1 aspect ratio */
      overflow: 'hidden'
    },
    cropImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    imagePlaceholder: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#e8f5e8',
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.75rem',
      color: '#6c757d'
    },
    placeholderText: {
      fontSize: '0.75rem'
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Crop Status Details</h2>
          <button 
            onClick={onClose} 
            style={styles.closeButton}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <IoClose />
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Beneficiary Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Beneficiary Information</h3>
            <div style={styles.beneficiaryInfo}>
              {beneficiary && beneficiary.picture ? (
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
              <div style={styles.beneficiaryDetails}>
                <div style={styles.beneficiaryName}>
                  {beneficiary ? (beneficiary.fullName || `${beneficiary.firstName} ${beneficiary.middleName ? beneficiary.middleName + ' ' : ''}${beneficiary.lastName}`.trim()) : record.beneficiaryId}
                </div>
                <div style={styles.beneficiaryId}>
                  <FaRegIdCard size={12} /> {record.beneficiaryId}
                </div>
                {beneficiary && (
                  <div style={styles.beneficiaryAddress}>
                    <FaLocationDot size={12} /> {beneficiary.fullAddress || `${beneficiary.purok || ''}, ${beneficiary.barangay || ''}, ${beneficiary.municipality || ''}, ${beneficiary.province || ''}`.replace(/^,\s*/, '').replace(/,\s*,/g, ',')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Crop Statistics */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Crop Statistics</h3>
            <div style={styles.cropStats}>
              <div style={{ ...styles.statCard, ...styles.aliveCard }}>
                <div style={{ ...styles.statNumber, ...styles.aliveNumber }}>
                  {record.aliveCrops.toLocaleString()}
                </div>
                <div style={styles.statLabel}>Alive Crops</div>
              </div>
              <div style={{ ...styles.statCard, ...styles.deadCard }}>
                <div style={{ ...styles.statNumber, ...styles.deadNumber }}>
                  {record.deadCrops.toLocaleString()}
                </div>
                <div style={styles.statLabel}>Dead Crops</div>
              </div>
            </div>
          </div>

          {/* Surveyer Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Surveyer Information</h3>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <label style={styles.label}>Survey Date</label>
                <div style={styles.value}>{formatDate(record.surveyDate)}</div>
              </div>
              <div style={styles.infoItem}>
                <label style={styles.label}>Surveyer</label>
                <div style={styles.value}>{record.surveyer}</div>
              </div>
              <div style={styles.infoItem}>
                <label style={styles.label}>Plot</label>
                <div style={styles.value}>{record.plot || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Crop Images */}
          {record.pictures && Array.isArray(record.pictures) && record.pictures.length > 0 ? (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Crop Images</h3>
              <div style={styles.imageGrid}>
                {record.pictures.map((image, index) => {
                  const imageUrl = `http://localhost:5000/uploads/${image}`;
                  return (
                    <div key={index} style={styles.imageContainer}>
                      <img 
                        src={imageUrl}
                        alt={`Crop ${index + 1}`}
                        style={styles.cropImage}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div style={styles.imagePlaceholder}>
                        <span style={styles.placeholderText}>Image {index + 1}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Crop Images</h3>
              <div style={{ padding: '1rem', textAlign: 'center', color: '#6c757d', fontSize: '0.875rem' }}>
                No images available for this record
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={styles.actions}>
            <button
              onClick={() => onEdit(record)}
              style={{ ...styles.button, ...styles.editButton }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1e3a23'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2c5530'}
            >
              Edit Record
            </button>
            <button
              onClick={() => onDelete(record)}
              style={{ ...styles.button, ...styles.deleteButton }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
            >
              Delete Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCropStatusModal;
