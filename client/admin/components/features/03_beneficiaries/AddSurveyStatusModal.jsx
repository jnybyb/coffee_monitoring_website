import React, { useState, useEffect } from 'react';
import { CancelButton, SaveButton } from '../../ui/BeneficiaryButtons';
import { BeneficiaryCard } from '../../ui/FormFields';
import LoadingModal from '../../ui/LoadingModal';
import AlertModal from '../../ui/AlertModal';
import { cropStatusAPI, farmPlotsAPI } from '../../../services/api';

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
    flexDirection: 'column',
    overflow: 'hidden'
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
    fontSize: '38px',
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
    marginTop: '1px',
    padding: '1rem 1.7rem 2rem 1rem'
  }
};

const FIELD_STYLES = {
  wrapper: { marginBottom: '1px' },
  label: {
    display: 'block',
    marginBottom: '0.1rem',
    fontWeight: '500',
    color: 'var(--dark-brown)',
    fontSize: '13px'
  },
  input: {
    width: '100%',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'var(--white)',
    color: 'var(--pagination-gray)',
    height: '36px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease'
  },
  error: {
    color: 'var(--red)',
    fontSize: '13px',
    marginTop: '4px',
    display: 'block'
  }
};

// Helper function to resolve image preview URLs
const resolvePreviewUrl = (p) => {
  if (!p) return '';
  if (p instanceof File) return URL.createObjectURL(p);
  if (typeof p === 'string' && p.startsWith('http')) return p;
  if (typeof p === 'string' && !p.startsWith('http') && !p.startsWith('/')) {
    return `http://localhost:5000/uploads/${p}`;
  }
  if (typeof p === 'string') return `http://localhost:5000${p.startsWith('/') ? p : '/' + p}`;
  return '';
};

// Helper function to construct full name
const getFullName = (beneficiary) => {
  if (beneficiary.fullName) return beneficiary.fullName;
  const firstName = beneficiary.firstName || '';
  const middleName = beneficiary.middleName || '';
  const lastName = beneficiary.lastName || '';
  return `${firstName} ${middleName} ${lastName}`.trim().replace(/\s+/g, ' ');
};

const AddSurveyStatusModal = ({ isOpen, onClose, onSubmit, record, isEdit = false, selectedBeneficiary = null }) => {
  const [formData, setFormData] = useState({
    id: '', // Add id field for edit operations
    surveyDate: '',
    surveyer: '',
    beneficiaryId: '',
    beneficiaryName: '',
    beneficiaryPicture: '',
    aliveCrops: '',
    deadCrops: '',
    plot: '',
    pictures: []
  });
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [beneficiariesLoading, setBeneficiariesLoading] = useState(false);
  const [plots, setPlots] = useState([]);
  const [plotsLoading, setPlotsLoading] = useState(false);
  const [showSaveLoading, setShowSaveLoading] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showSaveError, setShowSaveError] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState('');

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

  // Fetch beneficiaries from database
  useEffect(() => {
    const fetchBeneficiaries = async () => {
      if (!isOpen) return;
      setBeneficiariesLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/beneficiaries');
        if (!response.ok) throw new Error('Failed to fetch beneficiaries');
        const data = await response.json();
        setBeneficiaries(data);
      } catch (error) {
        console.error('Error fetching beneficiaries:', error);
        setBeneficiaries([]);
      } finally {
        setBeneficiariesLoading(false);
      }
    };
    fetchBeneficiaries();
  }, [isOpen]);

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

  const getFullName = (beneficiary) => {
    if (beneficiary.fullName) return beneficiary.fullName;
    const firstName = beneficiary.firstName || '';
    const middleName = beneficiary.middleName || '';
    const lastName = beneficiary.lastName || '';
    return `${firstName} ${middleName} ${lastName}`.trim().replace(/\s+/g, ' ');
  };

  // Load record data when editing OR pre-populate with selectedBeneficiary
  useEffect(() => {
    if (isEdit && record && isOpen) {
      setFormData({
        id: record.id || '',
        surveyDate: record.surveyDate ? new Date(record.surveyDate).toISOString().split('T')[0] : '',
        surveyer: record.surveyer || '',
        beneficiaryId: record.beneficiaryId || '',
        beneficiaryName: record.beneficiaryName || '',
        beneficiaryPicture: record.beneficiaryPicture || '',
        aliveCrops: record.aliveCrops?.toString() || '',
        deadCrops: record.deadCrops?.toString() || '0',
        plot: record.plot || '',
        pictures: record.pictures || []
      });
      
      // Handle existing pictures properly for edit mode
      if (record.pictures && Array.isArray(record.pictures) && record.pictures.length > 0) {
        setSelectedFiles(record.pictures);
        setFormData(prev => ({ ...prev, pictures: record.pictures }));
      } else {
        setSelectedFiles([]);
      }
    } else if (!isEdit && isOpen) {
      // Check if we have a selectedBeneficiary to pre-populate
      const initialBeneficiaryId = selectedBeneficiary?.beneficiaryId || '';
      const initialBeneficiaryName = selectedBeneficiary 
        ? `${selectedBeneficiary.firstName} ${selectedBeneficiary.middleName || ''} ${selectedBeneficiary.lastName}`.trim().replace(/\s+/g, ' ')
        : '';
      const initialBeneficiaryPicture = selectedBeneficiary?.picture || '';
      
      // Reset form when opening in add mode
      setFormData({
        id: '',
        surveyDate: '',
        surveyer: '',
        beneficiaryId: initialBeneficiaryId,
        beneficiaryName: initialBeneficiaryName,
        beneficiaryPicture: initialBeneficiaryPicture,
        aliveCrops: '',
        deadCrops: '',
        plot: '',
        pictures: []
      });
      setSelectedFiles([]);
      setErrors({});
    }
    
    // Reset success/error states when modal opens
    if (isOpen) {
      setShowSaveSuccess(false);
      setShowSaveError(false);
      setSaveErrorMessage('');
    }
  }, [isEdit, record, isOpen, selectedBeneficiary]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.surveyDate) newErrors.surveyDate = 'Survey date is required';
    if (!formData.surveyer) newErrors.surveyer = 'Surveyer name is required';
    if (!formData.beneficiaryName) newErrors.beneficiaryName = 'Beneficiary is required';
    if (isEdit && !formData.id) newErrors.id = 'Record ID is required for updates';
    if (!formData.aliveCrops || formData.aliveCrops <= 0) newErrors.aliveCrops = 'Number of alive crops must be greater than 0';
    if (formData.deadCrops === '' || formData.deadCrops < 0) newErrors.deadCrops = 'Number of dead crops cannot be negative';
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
        beneficiaryId: beneficiary ? beneficiary.beneficiaryId : '',
        beneficiaryPicture: beneficiary ? beneficiary.picture : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    setSelectedFiles(prev => {
      // Filter out any existing files that are not File objects (i.e., existing image URLs)
      const existingImages = prev.filter(item => !(item instanceof File));
      const newFiles = [...existingImages, ...files];
      return newFiles.slice(0, 10);
    });
    
    setFormData(prev => {
      const existingImages = (prev.pictures || []).filter(item => !(item instanceof File));
      const newFiles = [...existingImages, ...files];
      return { ...prev, pictures: newFiles.slice(0, 10) };
    });
    
    try { e.target.value = null; } catch (_) {}
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setFormData(prev => ({ ...prev, pictures: newFiles }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const submitData = { 
        ...formData, 
        aliveCrops: parseInt(formData.aliveCrops), 
        deadCrops: parseInt(formData.deadCrops || 0) 
      };
      
      // Handle pictures properly for edit mode
      if (isEdit) {
        // For edit mode, we need to separate existing images (filenames) from new files
        const existingImages = selectedFiles.filter(item => typeof item === 'string' && !(item instanceof File));
        const newFiles = selectedFiles.filter(item => item instanceof File);
        
        // Send existing image filenames as a separate field and new files as pictures
        submitData.existingPictures = existingImages;
        submitData.pictures = newFiles;
      } else {
        // For add mode, send selected files
        submitData.pictures = selectedFiles;
      }
      
      // Show loading modal
      setShowSaveLoading(true);
      
      // Save to database
      if (isEdit) {
        await cropStatusAPI.update(formData.id, submitData);
      } else {
        await cropStatusAPI.create(submitData);
      }
      
      // Call parent onSubmit if provided (for additional actions like refreshing data)
      if (onSubmit) {
        await onSubmit(submitData);
      }
      
      // Hide loading modal after a short delay
      setTimeout(() => {
        setShowSaveLoading(false);
        // Show success modal
        setShowSaveSuccess(true);
      }, 1000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setShowSaveLoading(false);
      setSaveErrorMessage(error.message || 'Failed to save survey status record');
      setShowSaveError(true);
    }
  };

  const handleClose = () => {
    setShowSaveLoading(false);
    setShowSaveSuccess(false);
    setShowSaveError(false);
    setSaveErrorMessage('');
    onClose();
  };
  
  const handleSaveSuccessClose = () => {
    setShowSaveSuccess(false);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div style={MODAL_STYLES.overlay}>
      <div className="modal-content" style={MODAL_STYLES.modal}>
        {/* Modal Header */}
        <div style={MODAL_STYLES.header}>
          <h2 style={MODAL_STYLES.title}>
            {isEdit ? 'Edit Survey Status Record' : 'Add New Survey Status'}
          </h2>
          <button
            onClick={handleClose}
            disabled={showSaveLoading}
            style={{
              ...MODAL_STYLES.closeButton,
              cursor: showSaveLoading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => !showSaveLoading && (e.target.style.backgroundColor = 'var(--border-gray)')}
            onMouseLeave={(e) => !showSaveLoading && (e.target.style.backgroundColor = 'transparent')}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Scrollable content area */}
        <div style={MODAL_STYLES.scrollArea}>
          <form onSubmit={handleSubmit} style={MODAL_STYLES.form}>
              <div style={FIELD_STYLES.wrapper}>
                <label style={FIELD_STYLES.label}>
                  Beneficiary *
                </label>
                {selectedBeneficiary ? (
                  <BeneficiaryCard
                    picture={formData.beneficiaryPicture}
                    name={formData.beneficiaryName}
                    id={formData.beneficiaryId}
                  />
                ) : (
                  <>
                    <select
                      name="beneficiaryName"
                      value={formData.beneficiaryName}
                      onChange={handleInputChange}
                      disabled={beneficiariesLoading}
                      style={getInputStyle(errors.beneficiaryName)}
                    >
                      <option value="" style={{ fontSize: '14px' }}>
                        {beneficiariesLoading ? 'Loading beneficiaries...' : 'Select Beneficiary'}
                      </option>
                      {beneficiaries && beneficiaries.length > 0 ? (
                        beneficiaries.map(beneficiary => (
                          <option key={beneficiary.beneficiaryId} value={getFullName(beneficiary)} style={{ fontSize: '14px' }}>
                            {getFullName(beneficiary)}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled style={{ fontSize: '14px' }}>No beneficiaries available</option>
                      )}
                    </select>
                    {formData.beneficiaryId && (
                      <BeneficiaryCard
                        picture={formData.beneficiaryPicture}
                        name={formData.beneficiaryName}
                        id={formData.beneficiaryId}
                      />
                    )}
                  </>
                )}
                {errors.beneficiaryName && (
                  <span style={FIELD_STYLES.error}>
                    {errors.beneficiaryName}
                  </span>
                )}
              </div>

              <div style={FIELD_STYLES.wrapper}>
                <label style={FIELD_STYLES.label}>
                  Survey Date *
                </label>
                <input
                  type="date"
                  name="surveyDate"
                  value={formData.surveyDate}
                  onChange={handleInputChange}
                  style={getDateInputStyle(errors.surveyDate, formData.surveyDate)}
                  placeholder="Select date"
                />
                {errors.surveyDate && (
                  <span style={FIELD_STYLES.error}>
                    {errors.surveyDate}
                  </span>
                )}
              </div>

              <div style={FIELD_STYLES.wrapper}>
                <label style={FIELD_STYLES.label}>
                  Surveyer *
                </label>
                <input
                  type="text"
                  name="surveyer"
                  value={formData.surveyer}
                  onChange={handleInputChange}
                  style={getInputStyle(errors.surveyer)}
                  placeholder="Enter surveyer name"
                />
                {errors.surveyer && (
                  <span style={FIELD_STYLES.error}>
                    {errors.surveyer}
                  </span>
                )}
              </div>

              <div style={FIELD_STYLES.wrapper}>
                <label style={FIELD_STYLES.label}>
                  Number of Alive Crops *
                </label>
                <input
                  type="number"
                  name="aliveCrops"
                  value={formData.aliveCrops}
                  onChange={handleInputChange}
                  min="1"
                  style={getInputStyle(errors.aliveCrops)}
                  placeholder="Enter number"
                />
                {errors.aliveCrops && (
                  <span style={FIELD_STYLES.error}>
                    {errors.aliveCrops}
                  </span>
                )}
              </div>

              <div style={FIELD_STYLES.wrapper}>
                <label style={FIELD_STYLES.label}>
                  Number of Dead Crops *
                </label>
                <input
                  type="number"
                  name="deadCrops"
                  value={formData.deadCrops}
                  onChange={handleInputChange}
                  min="0"
                  style={getInputStyle(errors.deadCrops)}
                  placeholder="Enter number"
                />
                {errors.deadCrops && (
                  <span style={FIELD_STYLES.error}>
                    {errors.deadCrops}
                  </span>
                )}
              </div>

              <div style={FIELD_STYLES.wrapper}>
                <label style={FIELD_STYLES.label}>
                  Plot ID
                </label>
                <select
                  name="plot"
                  value={formData.plot || ''}
                  onChange={handleInputChange}
                  style={getSelectStyle(errors.plot, formData.plot)}
                  disabled={plotsLoading || !formData.beneficiaryId}
                >
                  <option value="" style={{ fontSize: '14px' }}>
                    {plotsLoading ? 'Loading plots...' : !formData.beneficiaryId ? 'Select beneficiary first' : plots.length === 0 ? 'No plots available' : 'Select Plot ID (Optional)'}
                  </option>
                  {plots.map(plot => (
                    <option key={plot.id} value={plot.id} style={{ fontSize: '14px' }}>
                      {plot.id}
                    </option>
                  ))}
                </select>
                {errors.plot && (
                  <span style={FIELD_STYLES.error}>
                    {errors.plot}
                  </span>
                )}
              </div>

              <div>
                <label style={FIELD_STYLES.label}>
                  Pictures (Optional)
                </label>
                <input id="crop-pictures-input" type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {selectedFiles.map((file, index) => {
                    const src = resolvePreviewUrl(file);
                    return (
                      <div key={index} style={{ position: 'relative', width: '100%', paddingBottom: '100%', backgroundColor: 'var(--pagination-hover)', border: '1px solid var(--pagination-hover)', borderRadius: '6px', overflow: 'hidden' }}>
                        {src ? (
                          <img src={src} alt={`Selected ${index + 1}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--placeholder-text)' }}>
                            {typeof file === 'string' ? 'Image' : 'File'}
                          </div>
                        )}
                        <button type="button" onClick={() => removeFile(index)} title="Remove"
                          style={{ position: 'absolute', top: '4px', right: '4px', width: '18px', height: '18px', borderRadius: '50%', background: 'var(--shadow-dark)', color: 'var(--white)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', lineHeight: 1 }}>×</button>
                      </div>
                    );
                  })}
                  {selectedFiles.length < 10 && (
                    <label htmlFor="crop-pictures-input" style={{ cursor: 'pointer', display: 'block', paddingBottom: '100%', position: 'relative', backgroundColor: 'var(--white)', border: '1px dashed var(--gray)', borderRadius: '6px', color: 'var(--placeholder-text)', fontSize: '13px' }}>
                      <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>+ Add</span>
                    </label>
                  )}
                </div>
                {selectedFiles.length > 0 && (
                  <div style={{ fontSize: '11px', color: 'var(--placeholder-text)', marginTop: '0.25rem' }}>{selectedFiles.length}/10 selected</div>
                )}
              </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div style={MODAL_STYLES.footer}>
          <CancelButton
            onClick={handleClose}
            disabled={showSaveLoading}
            fontSize="14px"
            padding="10px 18px"
            borderRadius="5px"
          >
            Cancel
          </CancelButton>
          <SaveButton
            onClick={handleSubmit}
            disabled={showSaveLoading}
            fontSize="14px"
            padding="10px 18px"
            borderRadius="5px"
          >
            {showSaveLoading ? 'Saving...' : isEdit ? 'Update Record' : 'Add Record'}
          </SaveButton>
        </div>
      </div>
      
      {/* Loading Modal */}
      <LoadingModal
        isOpen={showSaveLoading}
        title="Saving..."
        message={isEdit ? "Updating survey status record... Please wait." : "Saving survey status record... Please wait."}
      />
      
      {/* Success Modal */}
      <AlertModal
        isOpen={showSaveSuccess}
        onClose={handleSaveSuccessClose}
        type="success"
        title="Success"
        message={isEdit ? "Survey Status Record Updated Successfully!" : "Survey Status Record Saved Successfully!"}
        autoClose={true}
        autoCloseDelay={1500}
        hideButton={true}
      />
      
      {/* Error Modal */}
      <AlertModal
        isOpen={showSaveError}
        onClose={() => setShowSaveError(false)}
        type="error"
        title="Error"
        message={saveErrorMessage}
        confirmText="OK"
        showCancel={false}
        onConfirm={() => setShowSaveError(false)}
      />
    </div>
  );
};

export default AddSurveyStatusModal;