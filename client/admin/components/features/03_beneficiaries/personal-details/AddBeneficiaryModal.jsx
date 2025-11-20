import React, { useState, memo } from 'react';
import { useAddressData } from '../../../../hooks/useAddressData';
import { calculateAge } from '../../../../utils/age';
import { beneficiariesAPI } from '../../../../services/api';
import LoadingModal from '../../../ui/LoadingModal';

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

// Form data structure
const getInitialFormData = () => ({
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

const AddBeneficiaryModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

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
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
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
    
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    
    if (!formData.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    }
    
    if (!formData.maritalStatus) {
      newErrors.maritalStatus = 'Marital status is required';
    }
    
    if (!formData.cellphone.trim()) {
      newErrors.cellphone = 'Cellphone number is required';
    } else if (!/^09\d{9}$/.test(formData.cellphone)) {
      newErrors.cellphone = 'Please enter a valid Philippine mobile number (09XXXXXXXXX)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData(getInitialFormData());
    setErrors({});
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setSubmitting(true);
        setSubmitError('');

        // Calculate accurate age
        const age = calculateAge(formData.birthDate) ?? 0;

        // Generate beneficiary ID from server
        let generatedBeneficiaryId;
        try {
          const idResponse = await beneficiariesAPI.generateId();
          generatedBeneficiaryId = idResponse?.beneficiaryId;
          
          if (!generatedBeneficiaryId) {
            throw new Error('Failed to generate beneficiary ID from server');
          }
        } catch (error) {
          console.error('Error generating beneficiary ID:', error);
          throw new Error(error?.message || 'Failed to generate beneficiary ID from server');
        }

        const payload = {
          beneficiaryId: generatedBeneficiaryId,
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

        // Save to database
        const createResponse = await beneficiariesAPI.create(payload);
        const createdData = createResponse?.data || {};

        // Return created record to parent for UI update
        onSubmit({
          id: createdData.id,
          beneficiaryId: createdData.beneficiaryId || generatedBeneficiaryId,
          ...payload
        });

        resetForm();
      } catch (error) {
        console.error('Error saving beneficiary:', error);
        setSubmitError(error?.message || 'Failed to save beneficiary.');
      } finally {
        setSubmitting(false);
      }
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
          <h2 style={{ color: 'var(--black)', margin: 0, fontSize: '1rem', fontWeight: '600' }}>Add New Beneficiary</h2>
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
            {submitError && (
              <div style={{ color: 'var(--red)', fontSize: '12px', marginTop: '.5rem' }}>
                {submitError}
              </div>
            )}
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
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                ...styles.button,
                border: 'none',
                backgroundColor: 'var(--dark-green)',
                color: 'white'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--emerald-green)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--dark-green)'}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Add Beneficiary'}
            </button>
          </div>
        </form>
      </div>
      <LoadingModal isOpen={submitting} title="Saving" message="Adding new beneficiary..." />
    </div>
  );
};

export default AddBeneficiaryModal;

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
