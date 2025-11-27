import React, { useState, useEffect } from 'react';
import { useAddressData } from '../../../hooks/useAddressData';
import { calculateAge } from '../../../utils/age';
import LoadingModal from '../../ui/LoadingModal';
import AlertModal from '../../ui/AlertModal';
import { CancelButton, SaveButton } from '../../ui/BeneficiaryButtons';
import { InputField, SelectField, DateField } from '../../ui/FormFields';
import { beneficiariesAPI } from '../../../services/api';
import { 
  GENDER_OPTIONS, 
  MARITAL_STATUS_OPTIONS, 
  INITIAL_BENEFICIARY_FORM_DATA,
  BENEFICIARY_MODAL_STYLES 
} from '../../../utils/formConstants';



const AddRecord = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(INITIAL_BENEFICIARY_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);


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

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL_BENEFICIARY_FORM_DATA);
      setErrors({});
      setSubmitting(false);
      setSubmitError('');
      setShowSuccessModal(false);
      loadMunicipalities('Davao Oriental');
    }
  }, [isOpen, loadMunicipalities]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'picture' && files) {
      const file = files[0];
      if (file && file.type.startsWith('image/')) {
        setFormData(prev => ({ ...prev, [name]: file }));
      }
    } else if (name === 'province') {
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
      setFormData(prev => ({
        ...prev,
        municipality: value,
        barangay: ''
      }));
      resetBarangays();
      if (formData.province) {
        loadBarangays(formData.province, value);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Only First Name, Last Name, and Purok are required
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.purok.trim()) newErrors.purok = 'Purok is required';
    
    // Optional field validations
    if (formData.cellphone && formData.cellphone.trim() && !/^09\d{9}$/.test(formData.cellphone)) {
      newErrors.cellphone = 'Please enter a valid Philippine mobile number (09XXXXXXXXX)';
    }
    
    // Address cascading validation (only if filled)
    if (formData.province && !formData.municipality) {
      newErrors.municipality = 'Municipality is required when province is selected';
    }
    if (formData.municipality && !formData.barangay) {
      newErrors.barangay = 'Barangay is required when municipality is selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (submitting) return;
    
    try {
      setSubmitting(true);
      setSubmitError('');

      const age = calculateAge(formData.birthDate) ?? 0;

      const payload = {
        beneficiaryId: formData.beneficiaryId?.trim() || null,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        purok: formData.purok,
        barangay: formData.barangay || 'Unknown',
        municipality: formData.municipality || 'Unknown',
        province: formData.province || 'Unknown',
        gender: formData.gender || null,
        birthDate: formData.birthDate || null,
        age,
        maritalStatus: formData.maritalStatus || null,
        cellphoneNumber: formData.cellphone || null,
        picture: formData.picture
      };

      const result = await beneficiariesAPI.create(payload);
      
      if (typeof onSubmit === 'function') {
        await onSubmit(result);
      }
      
      setFormData(INITIAL_BENEFICIARY_FORM_DATA);
      setErrors({});
      setSubmitError('');
      
      // Show success modal for 2.5 seconds
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Failed to add record:', err);
      setSubmitError(err?.message || 'Failed to add record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(INITIAL_BENEFICIARY_FORM_DATA);
    setErrors({});
    setSubmitError('');
    onClose();
  };

  if (!isOpen && !showSuccessModal) return null;

  return (
    <>
    {isOpen && (
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
        backgroundColor: 'var(--white)',
        borderRadius: '5px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
      className="hide-scrollbar-modal"
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '.5px solid var(--border-gray)',
          padding: '1.4rem 1rem',
          background: 'var(--white)',
          position: 'sticky',
          borderRadius: '5px',
          top: 0,
          zIndex: 10
        }}>
          <h2 style={{ color: 'var(--dark-green)', margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Add Beneficiary Record</h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 30,
              color: 'var(--gray-icon)',
              cursor: 'pointer',
              padding: 0,
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--border-gray)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Scrollable content area */}
        <div style={{
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          msOverflowStyle: 'none',
          padding: '0 0.75rem',
          flex: 1,
        }}>
          <form onSubmit={handleSubmit} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <h3 style={BENEFICIARY_MODAL_STYLES.sectionTitle}>Personal Information</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch', marginBottom: '12px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '7px' }}>
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

                <div style={{
                  minWidth: '150px',
                  maxWidth: '150px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '.5rem',
                  padding: '12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  borderRadius: '4px',
                  border: '1px solid var(--border-gray)',
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
                    border: '1px solid var(--border-gray)',
                    overflow: 'hidden',
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
                        width: '100%',
                        display: 'block',
                        margin: '0 auto 6px auto',
                        border: '1px solid var(--border-gray)',
                        borderRadius: '4px',
                        fontSize: '8px',
                        background: 'white',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                        textAlign: 'center',
                        padding: '4px'
                      }}
                    />
                    <p style={{ fontSize: '8px', color: '#6c757d', margin: 0 }}>
                      Upload profile picture
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <SelectField
                    name="gender"
                    label="Gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    options={GENDER_OPTIONS}
                    error={errors.gender}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <SelectField
                    name="maritalStatus"
                    label="Marital Status"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    options={MARITAL_STATUS_OPTIONS}
                    error={errors.maritalStatus}
                  />
                </div>
              </div>
            
              <DateField
                name="birthDate"
                label="Birth Date"
                value={formData.birthDate}
                onChange={handleInputChange}
                error={errors.birthDate}
                calculateAge={calculateAge}
                styles={BENEFICIARY_MODAL_STYLES}
              />
            
              <InputField
                name="cellphone"
                label="Cellphone Number"
                value={formData.cellphone}
                onChange={handleInputChange}
                placeholder="09XXXXXXXXX"
                error={errors.cellphone}
              />
            </div>

            <div style={{ marginTop: '12px' }}>
              <h3 style={BENEFICIARY_MODAL_STYLES.sectionTitle}>Address Information</h3>
            
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 calc(50% - 3px)' }}>
                  <SelectField
                    name="province"
                    label="Province"
                    value={formData.province}
                    onChange={handleInputChange}
                    options={provinces.map(p => ({ value: p, label: p }))}
                    error={errors.province}
                  />
                </div>
                <div style={{ flex: '1 1 calc(50% - 3px)' }}>
                  <SelectField
                    name="municipality"
                    label="Municipality"
                    value={formData.municipality}
                    onChange={handleInputChange}
                    options={municipalities.map(m => ({ value: m, label: m }))}
                    error={errors.municipality}
                    disabled={!formData.province || addressLoading}
                  />
                </div>
                <div style={{ flex: '1 1 calc(50% - 3px)' }}>
                  <SelectField
                    name="barangay"
                    label="Barangay"
                    value={formData.barangay}
                    onChange={handleInputChange}
                    options={barangays.map(b => ({ value: b, label: b }))}
                    error={errors.barangay}
                    disabled={!formData.municipality || addressLoading}
                  />
                </div>
                <div style={{ flex: '1 1 calc(50% - 3px)' }}>
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
            </div>

            {submitError && (
              <div style={{ color: 'var(--red-error)', fontSize: '10px', marginTop: '6px', textAlign: 'center' }}>
                {submitError}
              </div>
            )}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end',
              paddingTop: '0.75rem',
              borderTop: 'rgba(0, 0, 0, 0.035)',
              marginTop: '12px'
            }}>
              <CancelButton
                onClick={handleClose}
                disabled={submitting}
                fontSize="11px"
                padding="10px 18px"
                borderRadius="5px"
              >
                Cancel
              </CancelButton>
              <SaveButton
                type="submit"
                disabled={submitting}
                fontSize="11px"
                padding="10px 18px"
                borderRadius="5px"
              >
                {submitting ? 'Saving...' : 'Save'}
              </SaveButton>
            </div>
          </form>
        </div>
      </div>
    </div>
    )}
      <LoadingModal isOpen={submitting} title="Saving" message="Adding beneficiary record..." />
      <AlertModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose && onClose();
        }}
        type="success"
        title="Success!"
        message="Beneficiary record has been added successfully."
        autoClose={true}
        autoCloseDelay={1500}
        buttonBorderRadius={4}
        hideButton={true}
      />
      <style>{`
        .hide-scrollbar-modal::-webkit-scrollbar {
          width: 6px;
        }
        .hide-scrollbar-modal::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .hide-scrollbar-modal::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .hide-scrollbar-modal::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        .modal-input-field::placeholder {
          color: #adb5bd;
        }
        .modal-input-field:focus {
          outline: 2px solid var(--emerald-green);
          border-color: var(--emerald-green);
        }
        .custom-select-dropdown {
          max-height: 44px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #c1c1c1 #f1f1f1;
        }
        .custom-select-dropdown option {
          font-size: 12px;
        }
        .custom-select-dropdown:focus {
          outline: 2px solid var(--emerald-green);
          max-height: 200px;
        }
        .custom-select-dropdown::-webkit-scrollbar {
          width: 6px;
        }
        .custom-select-dropdown::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-select-dropdown::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .custom-select-dropdown::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </>
  );
};

export default AddRecord;