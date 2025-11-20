import React, { useState, useEffect, memo } from 'react';
import { useAddressData } from '../../../../hooks/useAddressData';
import { calculateAge } from '../../../../utils/age';

// Common styles
const getCommonStyles = () => ({
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: 'var(--black)',
    fontSize: '12px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
    height: '44px'
  },
  select: {
    width: '100%',
    padding: '10px 32px 10px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    boxSizing: 'border-box',
    backgroundColor: 'white',
    height: '44px',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    transition: 'border-color 0.2s ease'
  },
  error: {
    color: 'var(--red)',
    fontSize: '11px',
    marginTop: '4px',
    display: 'block'
  },
  sectionTitle: {
    color: 'var(--black)',
    marginBottom: '1.5rem',
    fontSize: '1rem',
    fontWeight: '600'
  },
  button: {
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  }
});

// Reusable input field component
const InputField = memo(({ 
  name, 
  label, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  error 
}) => {
  const styles = getCommonStyles();
  
  return (
    <div>
      <label style={styles.label}>
        {label} {required && '*'}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        style={{
          ...styles.input,
          border: `1px solid ${error ? 'var(--red)' : 'var(--gray)'}`
        }}
        placeholder={placeholder}
        className="modal-input-field"
      />
      {error && (
        <span style={styles.error}>{error}</span>
      )}
    </div>
  );
});

// Reusable select field component
const SelectField = memo(({ 
  name, 
  label, 
  value, 
  onChange, 
  options, 
  required = false, 
  error,
  disabled = false,
  placeholder
}) => {
  const styles = getCommonStyles();
  
  return (
    <div>
      <label style={styles.label}>
        {label} {required && '*'}
      </label>
      <div style={{ position: 'relative' }}>
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          style={{
            ...styles.select,
            border: `1px solid ${error ? 'var(--red)' : 'var(--gray)'}`,
            color: value ? 'var(--black)' : '#adb5bd',
            backgroundColor: disabled ? '#f8f9fa' : 'white',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
          className="custom-select-dropdown"
        >
          <option value="" disabled style={{ color: '#adb5bd' }}>
            {placeholder || `Select ${label.toLowerCase()}`}
          </option>
          {options.map(option => (
            <option key={option.value || option} value={option.value || option} style={{ color: 'var(--black)' }}>
              {option.label || option}
            </option>
          ))}
        </select>
        {/* Custom arrow icon */}
        <span style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          fontSize: '12px',
          color: disabled ? '#adb5bd' : '#adb5bd'
        }}>
          ▼
        </span>
      </div>
      {error && (
        <span style={styles.error}>{error}</span>
      )}
    </div>
  );
});

// Data options
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

const EditBeneficiaryModal = ({ isOpen, onClose, onSubmit, beneficiary }) => {
  const [formData, setFormData] = useState({
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
    age: '',
    picture: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const styles = getCommonStyles();
  const options = getDataOptions();
  
  // Address data hook
  const {
    provinces,
    municipalities,
    barangays,
    loading: addressLoading,
    error: addressError,
    loadMunicipalities,
    loadBarangays,
    resetMunicipalities,
    resetBarangays
  } = useAddressData();

  // Initialize form data when beneficiary prop changes
  useEffect(() => {
    if (beneficiary) {
      setFormData({
        beneficiaryId: beneficiary.beneficiaryId || '',
        firstName: beneficiary.firstName || '',
        middleName: beneficiary.middleName || '',
        lastName: beneficiary.lastName || '',
        purok: beneficiary.purok || '',
        barangay: beneficiary.barangay || '',
        municipality: beneficiary.municipality || '',
        province: beneficiary.province || '',
        gender: beneficiary.gender || '',
        birthDate: beneficiary.birthDate ? beneficiary.birthDate.split('T')[0] : '',
        maritalStatus: beneficiary.maritalStatus || '',
        cellphone: beneficiary.cellphone || '',
        age: beneficiary.age || '',
        picture: null,
        existingPicture: beneficiary.picture || null
      });
      setErrors({});
      
      // Load municipalities and barangays for the existing address
      if (beneficiary.province) {
        loadMunicipalities(beneficiary.province);
        if (beneficiary.municipality) {
          loadBarangays(beneficiary.province, beneficiary.municipality);
        }
      }
    }
  }, [beneficiary, loadMunicipalities, loadBarangays]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'picture' && files) {
      setFormData(prev => ({
        ...prev,
        picture: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Handle cascading dropdowns
      if (name === 'province') {
        resetMunicipalities();
        resetBarangays();
        if (value) {
          loadMunicipalities(value);
        }
      } else if (name === 'municipality') {
        resetBarangays();
        if (value && formData.province) {
          loadBarangays(formData.province, value);
        }
      }
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Auto-calculate age when birth date changes
    if (name === 'birthDate') {
      const computedAge = value ? calculateAge(value) : null;
      setFormData(prev => ({
        ...prev,
        age: computedAge == null ? '' : String(computedAge)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation (excluding non-editable fields)
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.province) newErrors.province = 'Province is required';
    if (!formData.municipality) newErrors.municipality = 'Municipality is required';
    if (!formData.barangay) newErrors.barangay = 'Barangay is required';
    if (!formData.purok.trim()) newErrors.purok = 'Purok is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.birthDate) newErrors.birthDate = 'Birth date is required';
    if (!formData.maritalStatus) newErrors.maritalStatus = 'Marital status is required';
    if (!formData.cellphone.trim()) newErrors.cellphone = 'Cellphone number is required';

    // Age validation
    if (formData.age && (isNaN(formData.age) || formData.age < 0 || formData.age > 120)) {
      newErrors.age = 'Age must be a valid number between 0 and 120';
    }

    // Phone number validation
    if (formData.cellphone && !/^\d{11}$/.test(formData.cellphone.replace(/\s/g, ''))) {
      newErrors.cellphone = 'Please enter a valid 11-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate age
      const age = calculateAge(formData.birthDate);
      
      const updateData = {
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
        maritalStatus: formData.maritalStatus,
        cellphone: formData.cellphone,
        picture: formData.picture
      };
      await onSubmit(updateData);
      handleClose();
    } catch (error) {
      console.error('Error updating beneficiary:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
          setFormData({
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
        age: '',
        picture: null,
        existingPicture: null
      });
    setErrors({});
    setIsSubmitting(false);
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
        borderRadius: '8px',
        padding: '0',
        maxWidth: '550px',
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
          padding: '1.5rem 1.5rem',
          background: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <h2 style={{ color: 'var(--black)', margin: 0, fontSize: '1rem', fontWeight: '600' }}>Edit Beneficiary</h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6c757d',
              padding: '0',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          {/* Personal Information Section */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={styles.sectionTitle}>
              Personal Information
            </h3>
            
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
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
                padding: '.6rem',
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
                  ) : formData.existingPicture ? (
                    <img
                      src={`http://localhost:5000${formData.existingPicture}`}
                      alt="Profile"
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
                      margin: '0 auto 0.2rem auto',
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
                  <p style={{ fontSize: '8px', color: '#6c757d', marginBottom: '.5rem' }}>
                    {formData.existingPicture ? 'Upload new picture (optional)' : 'Upload new picture'}
                  </p>
                </div>
                
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontWeight: '500',
                  fontSize: '11px',
                  color: 'var(--black)',
                  width: '100%',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ marginBottom: '0.25rem', fontSize: '10px' }}>Current ID</div>
                  <span style={{ 
                    fontWeight: '700', 
                    color: 'var(--emerald-green)', 
                    letterSpacing: '1px', 
                    fontSize: '16px' 
                  }}>
                    {formData.beneficiaryId}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={styles.sectionTitle}>
              Address Information
            </h3>
            
            {/* Address Error Display */}
            {addressError && (
              <div style={{
                backgroundColor: '#f8d7da',
                color: '#721c24',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '1rem',
                border: '1px solid #f5c6cb',
                fontSize: '11px'
              }}>
                {addressError}
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <SelectField
                name="province"
                label="Province"
                value={formData.province}
                onChange={handleInputChange}
                options={provinces}
                required
                error={errors.province}
                disabled={addressLoading}
              />
              <SelectField
                name="municipality"
                label="Municipality"
                value={formData.municipality}
                onChange={handleInputChange}
                options={municipalities}
                required
                error={errors.municipality}
                disabled={addressLoading || !formData.province}
                placeholder={formData.province ? 'Select municipality' : 'Select province first'}
              />
              <SelectField
                name="barangay"
                label="Barangay"
                value={formData.barangay}
                onChange={handleInputChange}
                options={barangays}
                required
                error={errors.barangay}
                disabled={addressLoading || !formData.municipality}
                placeholder={formData.municipality ? 'Select barangay' : 'Select municipality first'}
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

          {/* Personal Details Section */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={styles.sectionTitle}>
              Personal Details
            </h3>
            
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
                required
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
                  Age
                </label>
                <input
                  type="text"
                  value={formData.birthDate ? (calculateAge(formData.birthDate) ?? '—') : '—'}
                  readOnly
                  style={{
                    ...styles.input,
                    border: '1px solid var(--gray)',
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
              required
              error={errors.cellphone}
            />
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
            paddingTop: '1rem',
            borderTop: '1px solid #e9ecef'
          }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                ...styles.button,
                border: '1px solid var(--gray)',
                backgroundColor: 'white',
                color: 'var(--black)'
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
              type="submit"
              disabled={isSubmitting}
              style={{
                ...styles.button,
                border: 'none',
                backgroundColor: isSubmitting ? '#6c757d' : 'var(--dark-green)',
                color: 'white',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = 'var(--emerald-green)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = 'var(--dark-green)';
                }
              }}
            >
              {isSubmitting ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  Updating...
                </div>
              ) : (
                'Update Beneficiary'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBeneficiaryModal;

<style>
{`
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
`}
</style> 