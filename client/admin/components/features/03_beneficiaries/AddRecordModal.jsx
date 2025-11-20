import React, { useState, useEffect, memo } from 'react';
import { useAddressData } from '../../../hooks/useAddressData';
import { calculateAge } from '../../../utils/age';
import LoadingModal from '../../ui/LoadingModal';
import { CancelButton, SaveButton } from '../../ui/BeneficiaryButtons';
import { InputField, SelectField } from '../../ui/FormFields';
import { beneficiariesAPI } from '../../../services/api';

// Common styles utility (reusing the one from FormFields)
const getFormStyles = () => ({
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: 'var(--black)',
    fontSize: '11px'
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
    height: '36px'
  },
  select: {
    width: '100%',
    padding: '10px 32px 10px 12px',
    borderRadius: '6px',
    fontSize: '11px',
    boxSizing: 'border-box',
    backgroundColor: 'white',
    height: '36px',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    transition: 'border-color 0.2s ease'
  },
  error: {
    color: 'var(--red)',
    fontSize: '10px',
    marginTop: '4px',
    display: 'block'
  },
  sectionTitle: {
    color: 'var(--black)',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    fontWeight: '600'
  }
});

// Common styles for elements not covered by FormFields
const getCommonStyles = () => {
  const sharedStyles = getFormStyles();
  return {
    ...sharedStyles,
    button: {
      padding: '10px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '10px',
      fontWeight: '500',
      transition: 'all 0.2s ease'
    }
  };
};

// Form data structure
const getInitialFormData = () => ({
  beneficiaryId: '',
  firstName: '',
  middleName: '',
  lastName: '',
  purok: '',
  barangay: '',
  municipality: '',
  province: '',
  gender: '',
  birthDate: '',
  maritalStatus: '',
  cellphone: '',
  picture: null
});

// Data options (static)
const getDataOptions = () => ({
  genderOptions: [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' }
  ],
  maritalStatusOptions: [
    { value: 'Single', label: 'Single' },
    { value: 'Married', label: 'Married' },
    { value: 'Widowed', label: 'Widowed' },
    { value: 'Divorced', label: 'Divorced' },
    { value: 'Separated', label: 'Separated' }
  ]
});

const AddRecord = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [selectedCropFiles, setSelectedCropFiles] = useState([]);
  const [selectedFarmPlotFiles, setSelectedFarmPlotFiles] = useState([]);

  const styles = getCommonStyles();
  const options = getDataOptions();
  const {
    provinces,
    municipalities,
    barangays,
    loading: addressLoading,
    loadMunicipalities,
    loadBarangays,
    resetMunicipalities,
    resetBarangays
  } = useAddressData();

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setErrors({});
      setSubmitting(false);
      setSubmitError('');
      setSelectedCropFiles([]);
      setSelectedFarmPlotFiles([]);
    }
  }, [isOpen]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'picture' && files) {
      const file = files[0];
      if (file && file.type.startsWith('image/')) {
        setFormData(prev => ({
          ...prev,
          [name]: file
        }));
      }
    } else if (name === 'province') {
      // When province changes, reset municipality and barangay, then load municipalities
      setFormData(prev => ({
        ...prev,
        province: value,
        municipality: '',
        barangay: ''
      }));
      resetMunicipalities();
      resetBarangays();
      loadMunicipalities(value);
    } else if (name === 'municipality') {
      // When municipality changes, reset barangay, then load barangays
      setFormData(prev => ({
        ...prev,
        municipality: value,
        barangay: ''
      }));
      resetBarangays();
      const provinceValue = formData.province;
      if (provinceValue) {
        loadBarangays(provinceValue, value);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    // Personal Information
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    
    if (!formData.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    }
    
    if (formData.cellphone && formData.cellphone.trim() && !/^09\d{9}$/.test(formData.cellphone)) {
      newErrors.cellphone = 'Please enter a valid Philippine mobile number (09XXXXXXXXX)';
    }

    // Address Information
    if (!formData.province) {
      newErrors.province = 'Province is required';
    }
    
    if (!formData.municipality) {
      newErrors.municipality = 'Municipality is required';
    }
    
    if (!formData.barangay) {
      newErrors.barangay = 'Barangay is required';
    }
    
    if (!formData.purok.trim()) {
      newErrors.purok = 'Purok is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Resolve preview URL for crop pictures
  const resolveCropPreviewUrl = (file) => {
    if (!file) return '';
    if (file instanceof File) return URL.createObjectURL(file);
    if (typeof file === 'string' && file.startsWith('http')) return file;
    if (typeof file === 'string' && !file.startsWith('http') && !file.startsWith('/')) {
      return `http://localhost:5000/uploads/${file}`;
    }
    if (typeof file === 'string') return `http://localhost:5000${file.startsWith('/') ? file : '/' + file}`;
    return '';
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData(getInitialFormData());
    setErrors({});
    setSubmitError('');
    setSelectedCropFiles([]);
    setSelectedFarmPlotFiles([]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (submitting) return;
    
    try {
      setSubmitting(true);
      setSubmitError('');

      // Calculate accurate age
      const age = calculateAge(formData.birthDate) ?? 0;

      const payload = {
        beneficiaryId: formData.beneficiaryId?.trim() || null,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        purok: formData.purok,
        barangay: formData.barangay,
        municipality: formData.municipality,
        province: formData.province,
        gender: formData.gender,
        birthDate: formData.birthDate,
        age,
        maritalStatus: formData.maritalStatus || null,
        cellphoneNumber: formData.cellphone || null,
        picture: formData.picture
      };

      // Create beneficiary using the API
      const result = await beneficiariesAPI.create(payload);
      
      // Call the onSubmit callback with the result if provided
      if (typeof onSubmit === 'function') {
        await onSubmit(result);
      }
      
      resetForm();
      onClose && onClose();
    } catch (err) {
      console.error('Failed to add record:', err);
      setSubmitError(err?.message || 'Failed to add record.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
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
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '7px',
        padding: '0',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        position: 'relative'
      }}
      className="hide-scrollbar-modal"
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '.5px solid #e9ecef',
          padding: '1.1rem 1.5rem',
          background: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <h2 style={{ color: 'var(--black)', margin: 0, fontSize: '1.2rem' }}>Add Beneficiary Record</h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '36px',
              fontWeight: '600',
              cursor: 'pointer',
              color: '#6c757d',
              padding: '0',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.2s ease',
              lineHeight: 1
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {/* Personal Information Section */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={styles.sectionTitle}>
              Personal Information
            </h3>
            
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
              {/* Name Fields */}
              <div style={{ width: '60%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <InputField
                  name="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  required
                  error={errors.firstName}
                />
                <InputField
                  name="middleName"
                  label="Middle Name"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  placeholder="Enter middle name (optional)"
                  error={errors.middleName}
                />
                <InputField
                  name="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  required
                  error={errors.lastName}
                />
              </div>

              {/* Profile Picture Container */}
              <div style={{
                minWidth: '200px',
                maxWidth: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '.5rem',
                marginTop: '1rem',
                padding: '1.5rem .6rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  border: '2px dashed #ced4da',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease'
                }}>
                  {formData.picture ? (
                    <img
                      src={URL.createObjectURL(formData.picture)}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%'
                      }}
                    />
                  ) : (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="#6c757d">
                      <circle cx="12" cy="8" r="4"/>
                      <path d="M12 14c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z"/>
                    </svg>
                  )}
                </div>
                
                <div style={{ width: '100%', textAlign: 'center' }}>
                  <input
                    type="file"
                    name="picture"
                    accept="image/*"
                    onChange={handleInputChange}
                    style={{
                      width: '70%',
                      display: 'block',
                      margin: '0 auto 1rem auto',
                      border: '1px solid var(--gray)',
                      borderRadius: '4px',
                      fontSize: '8px',
                      background: 'white',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      textAlign: 'center',
                      padding: '4px'
                    }}
                  />
                  <p style={{ fontSize: '8px', color: '#6c757d', marginBottom: '1rem' }}>
                    Upload profile picture
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <SelectField
                name="gender"
                label="Gender"
                value={formData.gender}
                onChange={handleInputChange}
                options={options.genderOptions}
                required
                error={errors.gender}
              />
              <SelectField
                name="maritalStatus"
                label="Marital Status"
                value={formData.maritalStatus}
                onChange={handleInputChange}
                options={options.maritalStatusOptions}
                error={errors.maritalStatus}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={styles.label}>
                  Birth Date *
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  style={{
                    ...styles.input,
                    border: `1px solid ${errors.birthDate ? 'var(--red)' : 'var(--gray)'}`,
                    color: formData.birthDate ? 'var(--black)' : '#adb5bd',
                    backgroundColor: 'white'
                  }}
                  placeholder="Select birth date"
                />
                {errors.birthDate && (
                  <span style={styles.error}>{errors.birthDate}</span>
                )}
              </div>
              <div>
                <label style={styles.label}>
                  Age *
                </label>
                <input
                  type="text"
                  value={formData.birthDate ? (calculateAge(formData.birthDate) ?? '—') : '—'}
                  readOnly
                  style={{
                    ...styles.input,
                    border: `1px solid ${errors.birthDate ? 'var(--red)' : 'var(--gray)'}`,
                    backgroundColor: '#f8f9fa',
                    color: 'var(--black)',
                    cursor: 'not-allowed'
                  }}
                  tabIndex={-1}
                />
              </div>
            </div>
            
            <InputField
              name="cellphone"
              label="Cellphone Number"
              value={formData.cellphone}
              onChange={handleInputChange}
              placeholder="09XXXXXXXXX"
              error={errors.cellphone}
            />
          </div>

          {/* Address Section */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={styles.sectionTitle}>
              Address Information
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <SelectField
                name="province"
                label="Province"
                value={formData.province}
                onChange={handleInputChange}
                options={provinces.map(p => ({ value: p, label: p }))}
                required
                error={errors.province}
              />
              <SelectField
                name="municipality"
                label="Municipality"
                value={formData.municipality}
                onChange={handleInputChange}
                options={municipalities.map(m => ({ value: m, label: m }))}
                required
                error={errors.municipality}
                disabled={!formData.province || addressLoading}
              />
              <SelectField
                name="barangay"
                label="Barangay"
                value={formData.barangay}
                onChange={handleInputChange}
                options={barangays.map(b => ({ value: b, label: b }))}
                required
                error={errors.barangay}
                disabled={!formData.municipality || addressLoading}
              />
              <InputField
                name="purok"
                label="Purok"
                value={formData.purok}
                onChange={handleInputChange}
                placeholder="Enter purok"
                required
                error={errors.purok}
              />
            </div>
          </div>

          {/* Action Buttons */}
          {submitError && (
            <div style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '1rem', textAlign: 'center' }}>
              {submitError}
            </div>
          )}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
            paddingTop: '1rem',
            borderTop: '1px solid #e9ecef'
          }}>
            <CancelButton
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </CancelButton>
            <SaveButton
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save'}
            </SaveButton>
          </div>
        </form>
      </div>
      <LoadingModal isOpen={submitting} title="Saving" message="Adding beneficiary record..." />
      <style>{`
        .hide-scrollbar-modal::-webkit-scrollbar {
          display: none;
        }
        .custom-select-dropdown option {
          font-size: 12px;
        }
        .custom-select-dropdown {
          max-height: 44px;
          overflow-y: auto;
        }
        .custom-select-dropdown:focus {
          outline: 2px solid var(--emerald-green);
        }
        .modal-input-field::placeholder {
          color: #adb5bd;
        }
        .modal-input-field:focus {
          outline: 2px solid var(--emerald-green);
          border-color: var(--emerald-green);
        }
        /* Fix dropdown overflow */
        select.custom-select-dropdown {
          max-height: 44px;
        }
        select.custom-select-dropdown:focus {
          max-height: 200px;
          overflow-y: auto;
        }
        select.custom-select-dropdown::-webkit-scrollbar {
          width: 6px;
        }
        select.custom-select-dropdown::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        select.custom-select-dropdown::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        select.custom-select-dropdown::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        /* Hide scrollbar for Firefox */
        select.custom-select-dropdown {
          scrollbar-width: thin;
          scrollbar-color: #c1c1c1 #f1f1f1;
        }
      `}</style>
    </div>
  );
};

export default AddRecord;