import React, { useState, useEffect } from 'react';
import { CancelButton, SaveButton } from '../../ui/BeneficiaryButtons';
import LoadingModal from '../../ui/LoadingModal';
import AlertModal from '../../ui/AlertModal';
import { farmPlotsAPI } from '../../../services/api';

// Shared styles constants
const MODAL_STYLES = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'var(--white)',
    borderRadius: '5px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '.5px solid var(--border-gray)',
    padding: '1.4rem 1.4rem',
    background: 'var(--white)',
    position: 'sticky',
    borderRadius: '5px',
    top: 0,
    zIndex: 10
  },
  title: {
    color: 'var(--dark-green)',
    margin: 0,
    fontSize: '1.4rem',
    fontWeight: 700
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '37px',
    color: 'var(--gray-icon)',
    padding: 0,
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%'
  },
  scrollArea: {
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    msOverflowStyle: 'none',
    padding: '0 0.75rem',
    flex: 1
  },
  form: {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  footer: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
    paddingTop: '0.75rem',
    borderTop: 'rgba(0, 0, 0, 0.035)',
    marginTop: '12px',
    padding: '1rem 1.7rem 2rem 1rem'
  }
};

const FIELD_STYLES = {
  wrapper: { marginBottom: '12px' },
  label: {
    display: 'block',
    marginBottom: '0.1rem',
    fontWeight: '500',
    color: 'var(--dark-brown)',
    fontSize: '12px'
  },
  input: {
    width: '100%',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '13px',
    backgroundColor: 'var(--white)',
    color: 'var(--pagination-gray)',
    height: '36px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease'
  },
  readOnlyInput: {
    width: '100%',
    padding: '4px 10px',
    border: '1px solid var(--border-gray)',
    borderRadius: '4px',
    fontSize: '13px',
    backgroundColor: 'var(--shadow-transparent)',
    color: 'var(--dark-text)',
    cursor: 'not-allowed',
    height: '36px',
    boxSizing: 'border-box'
  },
  error: {
    color: 'var(--red)',
    fontSize: '12px',
    marginTop: '4px',
    display: 'block'
  },
  errorBox: {
    backgroundColor: 'var(--danger-red)',
    color: 'var(--white)',
    padding: '0.75rem',
    borderRadius: '4px',
    margin: '1rem 0.75rem 0 0.75rem',
    border: '1px solid var(--danger-red)',
    fontSize: '12px',
    opacity: 0.9
  },
  helpText: {
    color: 'var(--placeholder-text)',
    fontSize: '12px',
    marginTop: '4px',
    margin: '4px 0 0 0'
  }
};

// Helper function to construct full name
const getFullName = (beneficiary) => {
  if (beneficiary.fullName) return beneficiary.fullName;
  const firstName = beneficiary.firstName || '';
  const middleName = beneficiary.middleName || '';
  const lastName = beneficiary.lastName || '';
  return `${firstName} ${middleName} ${lastName}`.trim().replace(/\s+/g, ' ');
};

const AddSeedlingRecordModal = ({ isOpen, onClose, onSubmit, selectedBeneficiary }) => {
  const [formData, setFormData] = useState({
    beneficiaryId: '',
    beneficiaryName: '',
    received: '',
    dateReceived: '',
    planted: '',
    plotId: '',
    dateOfPlantingStart: '',
    dateOfPlantingEnd: ''
  });
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [beneficiariesLoading, setBeneficiariesLoading] = useState(false);
  const [plots, setPlots] = useState([]);
  const [plotsLoading, setPlotsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [showSavingModal, setShowSavingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const getInputStyle = (hasError) => ({
    ...FIELD_STYLES.input,
    border: hasError ? '1px solid var(--red)' : '1px solid var(--border-gray)'
  });

  const getDateInputStyle = (hasError, value) => ({
    ...FIELD_STYLES.input,
    border: hasError ? '1px solid var(--red)' : '1px solid var(--border-gray)',
    color: value ? 'var(--black)' : 'var(--text-gray)'
  });

  const getSelectStyle = (hasError, value) => ({
    ...FIELD_STYLES.input,
    border: hasError ? '1px solid var(--red)' : '1px solid var(--border-gray)',
    color: value ? 'var(--pagination-gray)' : 'var(--text-gray)'
  });

  // Fetch plots when beneficiary changes
  useEffect(() => {
    const fetchPlots = async () => {
      if (formData.beneficiaryId) {
        try {
          setPlotsLoading(true);
          const allPlots = await farmPlotsAPI.getAll();
          const beneficiaryPlots = allPlots.filter(
            plot => plot.beneficiaryId === formData.beneficiaryId
          );
          setPlots(beneficiaryPlots);
        } catch (error) {
          console.error('Error fetching plots:', error);
          setPlots([]);
        } finally {
          setPlotsLoading(false);
        }
      } else {
        setPlots([]);
      }
    };

    fetchPlots();
  }, [formData.beneficiaryId]);

  // Reset form data whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      // Pre-populate beneficiary fields if a selected beneficiary is provided
      if (selectedBeneficiary) {
        const fullName = getFullName(selectedBeneficiary);
        setFormData({
          beneficiaryId: selectedBeneficiary.beneficiaryId || '',
          beneficiaryName: fullName || '',
          received: '',
          dateReceived: '',
          planted: '',
          plotId: '',
          dateOfPlantingStart: '',
          dateOfPlantingEnd: ''
        });
      } else {
        setFormData({
          beneficiaryId: '',
          beneficiaryName: '',
          received: '',
          dateReceived: '',
          planted: '',
          plotId: '',
          dateOfPlantingStart: '',
          dateOfPlantingEnd: ''
        });
      }
      setErrors({});
      setSubmitError('');
    }
  }, [isOpen, selectedBeneficiary]);

  const validateForm = () => {
    const newErrors = {};
    
    // Validate beneficiary
    if (!formData.beneficiaryName || !formData.beneficiaryId) {
      newErrors.beneficiaryName = 'Please select a valid beneficiary';
    }
    
    // Validate received seedlings
    if (!formData.received || formData.received <= 0 || isNaN(parseInt(formData.received))) {
      newErrors.received = 'Received seedlings must be a valid positive number';
    }
    
    // Validate date received - this is critical
    if (!formData.dateReceived || formData.dateReceived.trim() === '') {
      newErrors.dateReceived = 'Date received is required';
    } else {
      // Validate date format
      const dateReceived = new Date(formData.dateReceived);
      if (isNaN(dateReceived.getTime())) {
        newErrors.dateReceived = 'Please enter a valid date';
      }
    }

    // Validate planted seedlings
    if (!formData.planted || formData.planted <= 0 || isNaN(parseInt(formData.planted))) {
      newErrors.planted = 'Planted seedlings must be a valid positive number';
    } else if (parseInt(formData.planted) > parseInt(formData.received)) {
      newErrors.planted = 'Planted seedlings cannot exceed received seedlings';
    }
    
    // Validate date of planting
    if (!formData.dateOfPlantingStart) {
      newErrors.dateOfPlantingStart = 'Date of planting (start) is required';
    }
    
    // Validate end date if provided
    if (formData.dateOfPlantingEnd && formData.dateOfPlantingStart) {
      const startDate = new Date(formData.dateOfPlantingStart);
      const endDate = new Date(formData.dateOfPlantingEnd);
      if (endDate < startDate) {
      newErrors.dateOfPlantingEnd = 'End date cannot be before start date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'beneficiaryName') {
      const beneficiary = beneficiaries.find(b => getFullName(b) === value);
      setFormData(prev => ({ 
        ...prev, 
        beneficiaryName: value, 
        beneficiaryId: beneficiary ? beneficiary.beneficiaryId : '' 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setSubmitError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setShowSavingModal(true);
    
    try {
      // Ensure dateReceived is properly formatted
      if (!formData.dateReceived || formData.dateReceived.trim() === '') {
        throw new Error('Date received is required');
      }
      
      // Format dateReceived to YYYY-MM-DD
      let formattedDateReceived = formData.dateReceived;
      try {
        const date = new Date(formData.dateReceived);
        if (!isNaN(date.getTime())) {
          formattedDateReceived = date.toISOString().split('T')[0];
        }
      } catch (error) {
        throw new Error('Invalid date format for Date Received');
      }
      
      // Parse and validate numeric fields
      const received = parseInt(formData.received);
      const planted = parseInt(formData.planted);
      
      // Validate parsed values
      if (isNaN(received) || received <= 0) {
        throw new Error('Received seedlings must be a valid positive number');
      }
      if (isNaN(planted) || planted <= 0) {
        throw new Error('Planted seedlings must be a valid positive number');
      }
      if (planted > received) {
        throw new Error('Planted seedlings cannot exceed received seedlings');
      }
      
      // Prepare data for submission
      const submitData = {
        beneficiaryId: formData.beneficiaryId,
        received,
        dateReceived: formattedDateReceived,
        planted,
        plotId: formData.plotId.trim(),
        dateOfPlantingStart: formData.dateOfPlantingStart,
        dateOfPlantingEnd: formData.dateOfPlantingEnd || null
      };
      
      // Pass cleaned data to parent for creation
      if (onSubmit) {
        await onSubmit(submitData);
      }
      
      // Hide saving modal and show success modal
      setShowSavingModal(false);
      setShowSuccessModal(true);
      
      // Auto-close success modal and main modal after delay
      setTimeout(() => {
        setShowSuccessModal(false);
        onClose();
      }, 1200);
      
    } catch (error) {
      console.error('Error submitting seedling record:', error);
      setShowSavingModal(false);
      
      // Handle different types of errors
      let errorMessage = 'An error occurred while saving the record.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      
      setSubmitError(errorMessage);
      
      // Scroll to top to show error
      const modalContent = document.querySelector('.modal-content');
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { 
    if (!loading) {
      setSubmitError('');
      setErrors({});
      onClose(); 
    }
  };

  if (!isOpen) return null;

  return (
    <div style={MODAL_STYLES.overlay}>
      <div className="modal-content" style={MODAL_STYLES.modal}>
        {/* Modal Header */}
        <div style={MODAL_STYLES.header}>
          <h2 style={MODAL_STYLES.title}>
            Add New Seedling Record
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            style={{
              ...MODAL_STYLES.closeButton,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = 'var(--border-gray)')}
            onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = 'transparent')}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Error Message */}
        {submitError && (
          <div style={FIELD_STYLES.errorBox}>
            <strong style={{ fontSize: '12px' }}>Error:</strong> {submitError}
          </div>
        )}

        {/* Scrollable content area */}
        <div style={MODAL_STYLES.scrollArea}>
          <form onSubmit={handleSubmit} style={MODAL_STYLES.form}>
            {/* Beneficiary Name and ID */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={FIELD_STYLES.label}>
                  Beneficiary *
                </label>
                <select
                  name="beneficiaryName"
                  value={formData.beneficiaryName}
                  onChange={handleInputChange}
                  style={getInputStyle(errors.beneficiaryName)}
                  disabled={loading || beneficiariesLoading || (selectedBeneficiary && isOpen)}
                >
                  <option value="" style={{ fontSize: '13px' }}>
                    {beneficiariesLoading ? 'Loading...' : selectedBeneficiary ? getFullName(selectedBeneficiary) : 'Select Beneficiary'}
                  </option>
                  {beneficiaries && beneficiaries.length > 0 ? (
                    beneficiaries.map(beneficiary => (
                      <option key={beneficiary.beneficiaryId} value={getFullName(beneficiary)} style={{ fontSize: '13px' }}>
                        {getFullName(beneficiary)}
                      </option>
                    ))
                  ) : !beneficiariesLoading ? (
                    <option value="" disabled style={{ fontSize: '13px' }}>No beneficiaries found</option>
                  ) : null}
                </select>
                {errors.beneficiaryName && (
                  <span style={FIELD_STYLES.error}>
                    {errors.beneficiaryName}
                  </span>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <label style={FIELD_STYLES.label}>
                  Beneficiary ID
                </label>
                <input
                  type="text"
                  value={formData.beneficiaryId}
                  readOnly
                  style={FIELD_STYLES.readOnlyInput}
                  placeholder="Auto-populated"
                />
              </div>
            </div>

            {/* Received Seedlings and Date Received */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={FIELD_STYLES.label}>
                Received Seedlings *
              </label>
                <input
                  type="number"
                  name="received"
                  value={formData.received}
                  onChange={handleInputChange}
                  min="1"
                  style={getInputStyle(errors.received)}
                  disabled={loading}
                  placeholder="Enter number"
                />
                {errors.received && (
                  <span style={FIELD_STYLES.error}>
                    {errors.received}
                  </span>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <label style={FIELD_STYLES.label}>
                  Date Received *
                </label>
                <input
                  type="date"
                  name="dateReceived"
                  value={formData.dateReceived}
                  onChange={handleInputChange}
                  style={getDateInputStyle(errors.dateReceived, formData.dateReceived)}
                  disabled={loading}
                  placeholder="Select date"
                />
                {errors.dateReceived && (
                  <span style={FIELD_STYLES.error}>
                    {errors.dateReceived}
                  </span>
                )}
              </div>
            </div>

            {/* Planted */}
            <div style={FIELD_STYLES.wrapper}>
              <label style={FIELD_STYLES.label}>
                Planted Seedlings *
              </label>
              <input
                type="number"
                name="planted"
                value={formData.planted}
                onChange={handleInputChange}
                min="1"
                max={formData.received}
                style={getInputStyle(errors.planted)}
                disabled={loading}
                placeholder="Enter number"
              />
              {errors.planted && (
                <span style={FIELD_STYLES.error}>
                  {errors.planted}
                </span>
              )}
            </div>

            {/* Plot */}
            <div style={FIELD_STYLES.wrapper}>
              <label style={FIELD_STYLES.label}>
                Plot ID
              </label>
              <select
                name="plotId"
                value={formData.plotId}
                onChange={handleInputChange}
                style={getSelectStyle(errors.plotId, formData.plotId)}
                disabled={loading || plotsLoading || !formData.beneficiaryId}
              >
                <option value="" style={{ fontSize: '13px' }}>
                  {plotsLoading ? 'Loading plots...' : !formData.beneficiaryId ? 'Select beneficiary first' : plots.length === 0 ? 'No plots available' : 'Select Plot ID'}
                </option>
                {plots.map(plot => (
                  <option key={plot.id} value={plot.id} style={{ fontSize: '13px' }}>
                    {plot.id}
                  </option>
                ))}
              </select>
              {errors.plotId && (
                <span style={FIELD_STYLES.error}>
                  {errors.plotId}
                </span>
              )}
            </div>

            {/* Date of Planting (Range) */}
            <div>
              <label style={FIELD_STYLES.label}>
                Date of Planting *
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="date"
                    name="dateOfPlantingStart"
                    value={formData.dateOfPlantingStart}
                    onChange={handleInputChange}
                    style={getDateInputStyle(errors.dateOfPlantingStart, formData.dateOfPlantingStart)}
                    disabled={loading}
                    placeholder="Start date"
                  />
                  {errors.dateOfPlantingStart && (
                    <span style={FIELD_STYLES.error}>
                      {errors.dateOfPlantingStart}
                    </span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="date"
                    name="dateOfPlantingEnd"
                    value={formData.dateOfPlantingEnd}
                    onChange={handleInputChange}
                    style={getDateInputStyle(errors.dateOfPlantingEnd, formData.dateOfPlantingEnd)}
                    disabled={loading}
                    placeholder="End date (optional)"
                  />
                  {errors.dateOfPlantingEnd && (
                    <span style={FIELD_STYLES.error}>
                      {errors.dateOfPlantingEnd}
                    </span>
                  )}
                </div>
              </div>
              <p style={FIELD_STYLES.helpText}>
                If planting spanned multiple days, provide an end date.
              </p>
            </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div style={MODAL_STYLES.footer}>
          <CancelButton
            onClick={handleClose}
            disabled={loading}
            fontSize="13px"
            padding="10px 18px"
            borderRadius="5px"
          >
            Cancel
          </CancelButton>
          <SaveButton
            onClick={handleSubmit}
            disabled={loading}
            fontSize="13px"
            padding="10px 18px"
            borderRadius="5px"
          >
            {loading ? 'Saving...' : 'Save'}
          </SaveButton>
        </div>
      </div>
      
      {/* Loading Modal */}
      <LoadingModal
        isOpen={showSavingModal}
        title="Saving..."
        message="Saving seedling record. Please wait."
      />

      {/* Success Modal */}
      <AlertModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="success"
        title="Success"
        message="Seedling Record Added Successfully!"
        autoClose={true}
        autoCloseDelay={1000}
        hideButton={true}
      />
    </div>
  );
};

export default AddSeedlingRecordModal;