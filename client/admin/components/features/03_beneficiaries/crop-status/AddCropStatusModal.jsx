import React, { useState, useEffect } from 'react';
import { IoClose } from "react-icons/io5";
import { CancelButton, SaveButton } from '../../../ui/BeneficiaryButtons';

const AddCropStatusModal = ({ isOpen, onClose, onSubmit, record, isEdit = false }) => {
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

  const getFullName = (beneficiary) => {
    if (beneficiary.fullName) return beneficiary.fullName;
    const firstName = beneficiary.firstName || '';
    const middleName = beneficiary.middleName || '';
    const lastName = beneficiary.lastName || '';
    return `${firstName} ${middleName} ${lastName}`.trim().replace(/\s+/g, ' ');
  };

  // Load record data when editing
  useEffect(() => {
    if (isEdit && record && isOpen) {
      setFormData({
        id: record.id || '',
        surveyDate: record.surveyDate ? new Date(record.surveyDate).toISOString().split('T')[0] : '',
        surveyer: record.surveyer || '',
        beneficiaryId: record.beneficiaryId || '',
        beneficiaryName: record.beneficiaryName || '', // Try to set from record first
        beneficiaryPicture: record.beneficiaryPicture || '',
        aliveCrops: record.aliveCrops?.toString() || '',
        deadCrops: record.deadCrops?.toString() || '0',
        plot: record.plot || '',
        pictures: record.pictures || []
      });
      
      // Handle existing pictures properly for edit mode
      if (record.pictures && Array.isArray(record.pictures) && record.pictures.length > 0) {
        // For existing pictures, we need to preserve them as they are (likely filenames)
        setSelectedFiles(record.pictures);
        // Also update formData.pictures to ensure synchronization
        setFormData(prev => ({ ...prev, pictures: record.pictures }));
      } else {
        setSelectedFiles([]);
      }
    }
  }, [isEdit, record, isOpen]);

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
      
      // Ensure ID is included for edit operations
      if (isEdit && formData.id) {
        submitData.id = formData.id;
      }
      
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
      
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleClose = () => { onClose(); };

  // Resolve preview URL
  const resolvePreviewUrl = (p) => {
    if (!p) return '';
    if (p instanceof File) return URL.createObjectURL(p);
    if (typeof p === 'string' && p.startsWith('http')) return p;
    // Handle existing images (filenames) from database
    if (typeof p === 'string' && !p.startsWith('http') && !p.startsWith('/')) {
      return `http://localhost:5000/uploads/${p}`;
    }
    if (typeof p === 'string') return `http://localhost:5000${p.startsWith('/') ? p : '/' + p}`;
    return '';
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', width: '90%', maxWidth: '500px', maxHeight: '85vh', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e8f5e8', paddingBottom: '0.75rem' }}>
          <h2 style={{ color: '#2c5530', margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>
            {isEdit ? 'Edit Crop Status Record' : 'Add New Crop Status Record'}
          </h2>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#6c757d', padding: '0.25rem', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseOver={(e) => (e.target.style.color = '#dc3545')} onMouseOut={(e) => (e.target.style.color = '#6c757d')}>
            <IoClose />
          </button>
        </div>

        {/* Form Content */}
        <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', color: '#2c5530', fontSize: '0.75rem', fontWeight: '500' }}>
                  Beneficiary *
                </label>
                <select name="beneficiaryName" value={formData.beneficiaryName} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', border: errors.beneficiaryName ? '1px solid #dc3545' : '1px solid #ced4da', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: 'white', color: '#495057', height: '36px' }}>
                  <option value="">Select Beneficiary</option>
                  {beneficiaries && beneficiaries.length > 0 ? (
                    beneficiaries.map(beneficiary => (
                      <option key={beneficiary.beneficiaryId} value={getFullName(beneficiary)}>
                        {getFullName(beneficiary)}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No beneficiaries available</option>
                  )}
                </select>
                {errors.beneficiaryName && (<p style={{ color: '#dc3545', fontSize: '0.625rem', marginTop: '0.125rem' }}>{errors.beneficiaryName}</p>)}
              </div>

              {formData.beneficiaryId && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e8f5e8' }}>
                  {formData.beneficiaryPicture ? (
                    <img src={resolvePreviewUrl(formData.beneficiaryPicture)} alt="Beneficiary" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e8f5e8' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e8f5e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: '#6c757d' }}>👤</div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#2c5530' }}>{formData.beneficiaryName}</div>
                    <div style={{ fontSize: '0.625rem', color: '#6c757d' }}>ID: {formData.beneficiaryId}</div>
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', color: '#2c5530', fontSize: '0.75rem', fontWeight: '500' }}>
                  Survey Date *
                </label>
                <input type="date" name="surveyDate" value={formData.surveyDate} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', border: errors.surveyDate ? '1px solid #dc3545' : '1px solid #ced4da', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: 'white', color: '#495057', height: '36px' }} />
                {errors.surveyDate && (<p style={{ color: '#dc3545', fontSize: '0.625rem', marginTop: '0.125rem' }}>{errors.surveyDate}</p>)}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', color: '#2c5530', fontSize: '0.75rem', fontWeight: '500' }}>
                  Surveyer *
                </label>
                <input type="text" name="surveyer" value={formData.surveyer} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', border: errors.surveyer ? '1px solid #dc3545' : '1px solid #ced4da', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: 'white', color: '#495057', height: '36px' }} placeholder="Enter surveyer name" />
                {errors.surveyer && (<p style={{ color: '#dc3545', fontSize: '0.625rem', marginTop: '0.125rem' }}>{errors.surveyer}</p>)}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', color: '#2c5530', fontSize: '0.75rem', fontWeight: '500' }}>
                  Number of Alive Crops *
                </label>
                <input type="number" name="aliveCrops" value={formData.aliveCrops} onChange={handleInputChange} min="1" style={{ width: '100%', padding: '0.5rem', border: errors.aliveCrops ? '1px solid #dc3545' : '1px solid #ced4da', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: 'white', color: '#495057', height: '36px' }} placeholder="Enter number" />
                {errors.aliveCrops && (<p style={{ color: '#dc3545', fontSize: '0.625rem', marginTop: '0.125rem' }}>{errors.aliveCrops}</p>)}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', color: '#2c5530', fontSize: '0.75rem', fontWeight: '500' }}>
                  Number of Dead Crops *
                </label>
                <input type="number" name="deadCrops" value={formData.deadCrops} onChange={handleInputChange} min="0" style={{ width: '100%', padding: '0.5rem', border: errors.deadCrops ? '1px solid #dc3545' : '1px solid #ced4da', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: 'white', color: '#495057', height: '36px' }} placeholder="Enter number" />
                {errors.deadCrops && (<p style={{ color: '#dc3545', fontSize: '0.625rem', marginTop: '0.125rem' }}>{errors.deadCrops}</p>)}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', color: '#2c5530', fontSize: '0.75rem', fontWeight: '500' }}>
                  Plot
                </label>
                <input type="text" name="plot" value={formData.plot || ''} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: 'white', color: '#495057', height: '36px' }} placeholder="Enter plot information (optional)" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', color: '#2c5530', fontSize: '0.75rem', fontWeight: '500' }}>
                  Pictures (Optional)
                </label>
                <input id="crop-pictures-input" type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {selectedFiles.map((file, index) => {
                    const src = resolvePreviewUrl(file);
                    return (
                      <div key={index} style={{ position: 'relative', width: '100%', paddingBottom: '100%', backgroundColor: '#f8f9fa', border: '1px solid #e8f5e8', borderRadius: '6px', overflow: 'hidden' }}>
                        {src ? (
                          <img src={src} alt={`Selected ${index + 1}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#6c757d' }}>
                            {typeof file === 'string' ? 'Image' : 'File'}
                          </div>
                        )}
                        <button type="button" onClick={() => removeFile(index)} title="Remove"
                          style={{ position: 'absolute', top: '4px', right: '4px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', lineHeight: 1 }}>×</button>
                      </div>
                    );
                  })}
                  {selectedFiles.length < 10 && (
                    <label htmlFor="crop-pictures-input" style={{ cursor: 'pointer', display: 'block', paddingBottom: '100%', position: 'relative', backgroundColor: '#ffffff', border: '1px dashed #cbd5c0', borderRadius: '6px', color: '#6c757d', fontSize: '12px' }}>
                      <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>+ Add</span>
                    </label>
                  )}
                </div>
                {selectedFiles.length > 0 && (
                  <div style={{ fontSize: '0.625rem', color: '#6c757d', marginTop: '0.25rem' }}>{selectedFiles.length}/10 selected</div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e8f5e8' }}>
          <CancelButton onClick={handleClose}>Cancel</CancelButton>
          <SaveButton onClick={handleSubmit}>
            {isEdit ? 'Update Record' : 'Add Record'}
          </SaveButton>
        </div>
      </div>
    </div>
  );
};

export default AddCropStatusModal;