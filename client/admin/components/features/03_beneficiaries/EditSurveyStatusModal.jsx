import React, { useState, useEffect } from 'react';
import { CancelButton, SaveButton } from '../../ui/BeneficiaryButtons';
import { BeneficiaryCard } from '../../ui/FormFields';
import LoadingModal from '../../ui/LoadingModal';
import AlertModal from '../../ui/AlertModal';
import { cropStatusAPI, farmPlotsAPI, seedlingsAPI } from '../../../services/api';

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

// Helper function to resolve image preview URLs from multiple formats: File objects, full URLs, filenames, or absolute paths
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

const EditCropStatusModal = ({ isOpen, onClose, onSubmit, record }) => {
  const [formData, setFormData] = useState({
    id: '',
    surveyDate: '',
    surveyer: '',
    beneficiaryId: '',
    beneficiaryName: '',
    beneficiaryPicture: '',
    aliveCrops: '',
    deadCrops: '',
    plotId: '',
    pictures: []
  });
  const [errors, setErrors] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [plots, setPlots] = useState([]);
  const [plotsLoading, setPlotsLoading] = useState(false);
  const [minSurveyDate, setMinSurveyDate] = useState('');
  const [originalFormData, setOriginalFormData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveLoading, setShowSaveLoading] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showSaveError, setShowSaveError] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState('');

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

  // Fetch and filter plots whenever beneficiary changes to populate Plot ID dropdown
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

  useEffect(() => {
    const fetchSeedlings = async () => {
      if (formData.beneficiaryId) {
        try {
          const allSeedlings = await seedlingsAPI.getAll();
          const beneficiarySeedlings = allSeedlings.filter(
            s => s.beneficiaryId === formData.beneficiaryId
          );
          const releaseDates = beneficiarySeedlings
            .map(s => s.dateReceived)
            .filter(Boolean)
            .map(d => d.split('T')[0]);

          if (releaseDates.length > 0) {
            const earliest = releaseDates.reduce(
              (min, d) => (d < min ? d : min),
              releaseDates[0]
            );
            setMinSurveyDate(earliest);
          } else {
            setMinSurveyDate('');
          }
        } catch (error) {
          console.error('Error fetching seedlings:', error);
          setMinSurveyDate('');
        }
      } else {
        setMinSurveyDate('');
      }
    };

    fetchSeedlings();
  }, [formData.beneficiaryId]);

  // Pre-populate form with record data when editing, parsing ISO dates without timezone conversion
  useEffect(() => {
    if (record && isOpen) {
      const initialData = {
        id: record.id || '',
        surveyDate: record.surveyDate ? new Date(record.surveyDate).toISOString().split('T')[0] : '',
        surveyer: record.surveyer || '',
        beneficiaryId: record.beneficiaryId || '',
        beneficiaryName: record.beneficiaryName || '',
        beneficiaryPicture: record.beneficiaryPicture || '',
        aliveCrops: record.aliveCrops?.toString() || '',
        deadCrops: record.deadCrops?.toString() || '0',
        plotId: record.plotId || record.plot || '',
        pictures: record.pictures || []
      };
      
      setFormData(initialData);
      setOriginalFormData(initialData);
      
      // Handle existing pictures properly for edit mode (filenames or URLs from database)
      if (record.pictures && Array.isArray(record.pictures) && record.pictures.length > 0) {
        setSelectedFiles(record.pictures);
      } else {
        setSelectedFiles([]);
      }
      
      setHasChanges(false);
    }
    
    // Reset success/error states when modal opens
    if (isOpen) {
      setShowSaveSuccess(false);
      setShowSaveError(false);
      setSaveErrorMessage('');
    }
  }, [record, isOpen]);

  // Track changes by comparing current data with original, handling pictures separately to enable/disable save button
  useEffect(() => {
    if (originalFormData) {
      const formChanged = Object.keys(formData).some(key => {
        if (key === 'pictures') return false; // Handle pictures separately
        return formData[key] !== originalFormData[key];
      });
      
      const picturesChanged = JSON.stringify(selectedFiles) !== JSON.stringify(originalFormData.pictures);
      
      setHasChanges(formChanged || picturesChanged);
    }
  }, [formData, selectedFiles, originalFormData]);

  const validateForm = () => {
    const newErrors = {};
    // Required fields: survey date, surveyer, beneficiary, and record ID for edit operations
    if (!formData.surveyDate) {
      newErrors.surveyDate = 'Survey date is required';
    } else if (minSurveyDate) {
      const surveyDateObj = new Date(formData.surveyDate);
      const minSurveyDateObj = new Date(minSurveyDate);
      if (!isNaN(surveyDateObj.getTime()) && !isNaN(minSurveyDateObj.getTime()) && surveyDateObj < minSurveyDateObj) {
        newErrors.surveyDate = 'Survey date cannot be before the first seedling release date';
      }
    }
    if (!formData.surveyer) newErrors.surveyer = 'Surveyer name is required';
    if (!formData.beneficiaryName) newErrors.beneficiaryName = 'Beneficiary is required';
    if (!formData.id) newErrors.id = 'Record ID is required for updates';
    // Validate crop counts: alive crops must be positive, dead crops cannot be negative
    if (!formData.aliveCrops || formData.aliveCrops <= 0) newErrors.aliveCrops = 'Number of alive crops must be greater than 0';
    if (formData.deadCrops === '' || formData.deadCrops < 0) newErrors.deadCrops = 'Number of dead crops cannot be negative';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    // Preserve existing images (from database) and add new File objects, limiting to 10 total
    setSelectedFiles(prev => {
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
      const selectedPlotId = formData.plotId ? formData.plotId : null;
      const submitData = { 
        ...formData,
        plotId: selectedPlotId,
        aliveCrops: parseInt(formData.aliveCrops), 
        deadCrops: parseInt(formData.deadCrops || 0) 
      };
      
      submitData.id = formData.id;
      
      // Separate existing images (filenames from database) from new File objects for proper backend handling
      const existingImages = selectedFiles.filter(item => typeof item === 'string' && !(item instanceof File));
      const newFiles = selectedFiles.filter(item => item instanceof File);
      
      // Send existing image filenames as a separate field and new files as pictures
      submitData.existingPictures = existingImages;
      submitData.pictures = newFiles;
      
      // Execute sequential modal display: loading → success (1s delay)
      setShowSaveLoading(true);
      
      // Save to database
      await cropStatusAPI.update(formData.id, submitData);
      
      // Call parent onSubmit if provided (for additional actions like refreshing data)
      if (onSubmit) {
        await onSubmit(submitData);
      }
      
      // Hide loading modal after a short delay, then show success modal
      setTimeout(() => {
        setShowSaveLoading(false);
        setShowSaveSuccess(true);
      }, 1000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setShowSaveLoading(false);
      setSaveErrorMessage(error.message || 'Failed to update survey status record');
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
            Edit Survey Status Record
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
                <BeneficiaryCard
                  picture={formData.beneficiaryPicture}
                  name={formData.beneficiaryName}
                  id={formData.beneficiaryId}
                />
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
                  min={minSurveyDate}
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
                  name="plotId"
                  value={formData.plotId || ''}
                  onChange={handleInputChange}
                  style={getSelectStyle(errors.plotId, formData.plotId)}
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
                {errors.plotId && (
                  <span style={FIELD_STYLES.error}>
                    {errors.plotId}
                  </span>
                )}
              </div>

              <div>
                <label style={FIELD_STYLES.label}>
                  Pictures (Optional)
                </label>
                <input id="edit-crop-pictures-input" type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
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
                    <label htmlFor="edit-crop-pictures-input" style={{ cursor: 'pointer', display: 'block', paddingBottom: '100%', position: 'relative', backgroundColor: 'var(--white)', border: '1.5px dashed var(--dark-green)', borderRadius: '6px', color: 'var(--dark-green)', fontSize: '13px' }}>
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
            disabled={showSaveLoading || !hasChanges}
            fontSize="14px"
            padding="10px 18px"
            borderRadius="5px"
          >
            {showSaveLoading ? 'Saving...' : 'Update Record'}
          </SaveButton>
        </div>
      </div>
      
      {/* Loading Modal */}
      <LoadingModal
        isOpen={showSaveLoading}
        title="Saving..."
        message="Updating survey status record... Please wait."
      />
      
      {/* Success Modal */}
      <AlertModal
        isOpen={showSaveSuccess}
        onClose={handleSaveSuccessClose}
        type="success"
        title="Success"
        message="Survey Status Record Updated Successfully!"
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

export default EditCropStatusModal;
