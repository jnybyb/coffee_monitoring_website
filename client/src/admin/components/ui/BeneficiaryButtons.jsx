import React from 'react';
import { CiImport } from 'react-icons/ci';

// Button component that matches the interface expected by the importing components
const Button = ({ 
  children,
  onClick,
  disabled = false,
  type = 'primary',
  size = 'medium',
  icon,
  style = {}
}) => {
  // Button size configurations
  const buttonSizes = {
    small: {
      padding: '4px 8px',
      fontSize: '0.7rem',
      borderRadius: '4px'
    },
    medium: {
      padding: '8px 16px',
      fontSize: '0.75rem',
      borderRadius: '6px'
    },
    large: {
      padding: '12px 24px',
      fontSize: '0.875rem',
      borderRadius: '8px'
    },
    pagination: {
      padding: '4px 8px',
      fontSize: '0.7rem',
      borderRadius: '4px',
      minWidth: '28px'
    }
  };

  const sizeConfig = buttonSizes[size] || buttonSizes.medium;

  // Get button styles based on type
  const getButtonStyles = () => {
    const baseStyles = {
      ...sizeConfig,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      transition: 'all 0.2s',
      opacity: disabled ? 0.6 : 1,
      border: 'none',
      ...style
    };

    switch (type) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: 'var(--primary-green)',
          color: 'var(--white)'
        };
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: 'var(--white)',
          color: 'var(--primary-green)',
          border: '2px solid var(--primary-green)'
        };
      case 'danger':
        return {
          ...baseStyles,
          backgroundColor: 'var(--red)',
          color: 'var(--white)'
        };
      case 'success':
        return {
          ...baseStyles,
          backgroundColor: 'var(--success)',
          color: 'var(--white)'
        };
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: 'var(--primary-green)',
          border: '1px solid var(--primary-green)'
        };
      case 'pagination':
        return {
          ...baseStyles,
          backgroundColor: 'var(--white)',
          color: 'var(--primary-green)',
          border: '1px solid #e8f5e8'
        };
      case 'paginationActive':
        return {
          ...baseStyles,
          backgroundColor: 'var(--primary-green)',
          color: 'var(--white)',
          border: '1px solid var(--primary-green)'
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: 'var(--primary-green)',
          color: 'var(--white)'
        };
    }
  };

  const handleMouseOver = (e) => {
    if (!disabled) {
      switch (type) {
        case 'primary':
          e.target.style.backgroundColor = '#1e7e34';
          break;
        case 'secondary':
        case 'outline':
          e.target.style.backgroundColor = '#f8f9fa';
          break;
        case 'pagination':
          e.target.style.backgroundColor = '#e8f5e8';
          break;
        case 'paginationActive':
          e.target.style.backgroundColor = '#1e7e34';
          break;
        default:
          e.target.style.backgroundColor = '#1e7e34';
      }
    }
  };

  const handleMouseOut = (e) => {
    if (!disabled) {
      const styles = getButtonStyles();
      e.target.style.backgroundColor = styles.backgroundColor;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={getButtonStyles()}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

// BeneficiaryButtons component for common button patterns in beneficiary features
const BeneficiaryButtons = ({ 
  buttonType = 'add',
  onClick,
  disabled = false,
  customText,
  customIcon = '+',
  customType = 'primary',
  customSize = 'medium',
  style = {}
}) => {
  // Button configurations for different types
  const buttonConfigs = {
    add: {
      text: 'Add Record',
      icon: '+',
      type: 'mintGreen',
      size: 'medium'
    },
    addBeneficiary: {
      text: 'Add Beneficiary',
      icon: '+',
      type: 'mintGreen',
      size: 'medium'
    },
    addSeedling: {
      text: 'Add Record',
      icon: '+',
      type: 'mintGreen',
      size: 'medium'
    },
    addCropStatus: {
      text: 'Add Record',
      icon: '+',
      type: 'mintGreen',
      size: 'medium'
    },
    edit: {
      text: 'Edit',
      type: 'oliveGreen',
      size: 'small'
    },
    delete: {
      text: 'Delete',
      type: 'danger',
      size: 'small'
    },
    view: {
      text: 'View',
      type: 'info',
      size: 'small'
    },
    update: {
      text: 'Update',
      type: 'success',
      size: 'medium'
    },
    save: {
      text: 'Save',
      type: 'success',
      size: 'medium'
    },
    cancel: {
      text: 'Cancel',
      icon: '✕',
      type: 'outline',
      size: 'medium'
    },
    close: {
      text: 'Close',
      icon: '✕',
      type: 'outline',
      size: 'medium'
    },
    submit: {
      text: 'Submit',
      type: 'primary',
      size: 'medium'
    },
    confirm: {
      text: 'Confirm',
      type: 'danger',
      size: 'medium'
    }
  };

  // Get button configuration
  const config = buttonConfigs[buttonType] || buttonConfigs.add;
  
  // Use custom values if provided, otherwise use config values
  const finalText = customText || config.text;
  const finalIcon = customIcon || config.icon;
  const finalType = customType || config.type;
  const finalSize = customSize || config.size;

  // Button size configurations
  const buttonSizes = {
    small: {
      padding: '4px 8px',
      fontSize: '0.7rem',
      borderRadius: '4px'
    },
    medium: {
      padding: '8px 16px',
      fontSize: '0.75rem',
      borderRadius: '6px'
    },
    large: {
      padding: '12px 24px',
      fontSize: '0.875rem',
      borderRadius: '8px'
    }
  };

  const sizeConfig = buttonSizes[finalSize] || buttonSizes.medium;

  // Get button styles based on type
  const getButtonStyles = () => {
    const baseStyles = {
      ...sizeConfig,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      transition: 'all 0.2s',
      opacity: disabled ? 0.6 : 1,
      ...style
    };

    switch (finalType) {
      case 'mintGreen':
        return {
          ...baseStyles,
          backgroundColor: 'var(--mint-green)',
          color: 'var(--dark-brown)',
          border: 'none'
        };
      case 'oliveGreen':
        return {
          ...baseStyles,
          backgroundColor: 'var(--olive-green)',
          color: 'var(--white)',
          border: 'none'
        };
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: 'var(--primary-green)',
          color: 'var(--white)',
          border: 'none'
        };
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: 'var(--white)',
          color: 'var(--primary-green)',
          border: '2px solid var(--primary-green)'
        };
      case 'danger':
        return {
          ...baseStyles,
          backgroundColor: 'var(--red)',
          color: 'var(--white)',
          border: 'none'
        };
      case 'success':
        return {
          ...baseStyles,
          backgroundColor: 'var(--success)',
          color: 'var(--white)',
          border: 'none'
        };
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: 'var(--primary-green)',
          border: '1px solid var(--primary-green)'
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: 'var(--primary-green)',
          color: 'var(--white)',
          border: 'none'
        };
    }
  };

  const handleMouseOver = (e) => {
    if (!disabled) {
      switch (finalType) {
        case 'mintGreen':
          e.target.style.backgroundColor = '#7dd4a8';
          break;
        case 'oliveGreen':
          e.target.style.backgroundColor = '#5a6a2e';
          break;
        case 'primary':
          e.target.style.backgroundColor = '#1e3a22';
          break;
        case 'secondary':
          e.target.style.backgroundColor = 'var(--primary-green)';
          e.target.style.color = 'var(--white)';
          break;
        case 'outline':
          e.target.style.backgroundColor = 'var(--primary-green)';
          e.target.style.color = 'var(--white)';
          break;
        default:
          e.target.style.backgroundColor = '#1e3a22';
      }
    }
  };

  const handleMouseOut = (e) => {
    if (!disabled) {
      switch (finalType) {
        case 'mintGreen':
          e.target.style.backgroundColor = 'var(--mint-green)';
          e.target.style.color = 'var(--dark-brown)';
          break;
        case 'oliveGreen':
          e.target.style.backgroundColor = 'var(--olive-green)';
          e.target.style.color = 'var(--white)';
          break;
        case 'primary':
          e.target.style.backgroundColor = 'var(--primary-green)';
          e.target.style.color = 'var(--white)';
          break;
        case 'secondary':
          e.target.style.backgroundColor = 'var(--white)';
          e.target.style.color = 'var(--primary-green)';
          break;
        case 'outline':
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = 'var(--primary-green)';
          break;
        default:
          e.target.style.backgroundColor = 'var(--primary-green)';
          e.target.style.color = 'var(--white)';
      }
    }
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={getButtonStyles()}
      disabled={disabled}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      {finalIcon && <span style={{ fontSize: '0.875rem' }}>{finalIcon}</span>}
      {finalText}
    </button>
  );
};

// Specialized button components for common use cases
export const AddBeneficiaryButton = ({ onClick, disabled, style }) => (
  <BeneficiaryButtons
    buttonType="addBeneficiary"
    onClick={onClick}
    disabled={disabled}
    style={style}
  />
);

export const AddRecordButton = ({ onClick, disabled, style }) => (
  <BeneficiaryButtons
    buttonType="add"
    onClick={onClick}
    disabled={disabled}
    style={style}
  />
);

export const EditButton = ({ onClick, disabled, style }) => (
  <BeneficiaryButtons
    buttonType="edit"
    onClick={onClick}
    disabled={disabled}
    style={style}
  />
);

export const DeleteButton = ({ onClick, disabled, style }) => (
  <BeneficiaryButtons
    buttonType="delete"
    onClick={onClick}
    disabled={disabled}
    style={style}
  />
);

export const ViewButton = ({ onClick, disabled, style }) => (
  <BeneficiaryButtons
    buttonType="view"
    onClick={onClick}
    disabled={disabled}
    style={style}
  />
);

export const UpdateButton = ({ onClick, disabled, style }) => (
  <BeneficiaryButtons
    buttonType="update"
    onClick={onClick}
    disabled={disabled}
    style={style}
  />
);

export const SaveButton = ({ onClick, disabled, style }) => (
  <BeneficiaryButtons
    buttonType="save"
    onClick={onClick}
    disabled={disabled}
    style={style}
  />
);

export const CancelButton = ({ onClick, disabled, style }) => (
  <BeneficiaryButtons
    buttonType="cancel"
    onClick={onClick}
    disabled={disabled}
    style={style}
  />
);

export const CloseButton = ({ onClick, disabled, style }) => (
  <BeneficiaryButtons
    buttonType="close"
    onClick={onClick}
    disabled={disabled}
    style={style}
  />
);

export const SubmitButton = ({ onClick, disabled, style }) => (
  <BeneficiaryButtons
    buttonType="submit"
    onClick={onClick}
    disabled={disabled}
    style={style}
  />
);

export const ConfirmButton = ({ onClick, disabled, style }) => (
  <BeneficiaryButtons
    buttonType="confirm"
    onClick={onClick}
    disabled={disabled}
    style={style}
  />
);

// New: Import button used in Map Monitoring (white background, green outline)
export const ImportButton = ({ onClick, disabled, style, text = 'Import Excel' }) => (
  <BeneficiaryButtons
    buttonType="custom"
    customText={text}
    customIcon={<CiImport size={16} />}
    customType="outline"
    customSize="medium"
    onClick={onClick}
    disabled={disabled}
    style={{ fontWeight: '500', ...style }}
  />
);

export default BeneficiaryButtons;
export { Button };
