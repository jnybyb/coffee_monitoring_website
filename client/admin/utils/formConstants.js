// Shared form data options and constants

export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' }
];

export const MARITAL_STATUS_OPTIONS = [
  { value: 'Single', label: 'Single' },
  { value: 'Married', label: 'Married' },
  { value: 'Widowed', label: 'Widowed' },
  { value: 'Divorced', label: 'Divorced' },
  { value: 'Separated', label: 'Separated' }
];

// Initial beneficiary form data structure
export const INITIAL_BENEFICIARY_FORM_DATA = {
  beneficiaryId: '',
  firstName: '',
  middleName: '',
  lastName: '',
  purok: '',
  barangay: '',
  municipality: '',
  province: 'Davao Oriental',
  gender: '',
  birthDate: '',
  maritalStatus: '',
  cellphone: '',
  picture: null
};

// Form field styles - specific to beneficiary modals
export const BENEFICIARY_MODAL_STYLES = {
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--dark-green)',
    marginTop: '8px',
    marginBottom: '12px'
  },
  label: {
    display: 'block',
    marginBottom: '0.1rem',
    fontWeight: '500',
    color: 'var(--dark-brown)',
    fontSize: '10px'
  },
  input: {
    width: '100%',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
    height: '30px'
  },
  error: {
    color: 'var(--red)',
    fontSize: '10px',
    marginTop: '4px',
    display: 'block'
  }
};
