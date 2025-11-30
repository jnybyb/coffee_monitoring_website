import React, { memo } from "react";

// Shared form styles utility
const getFormStyles = () => ({
  label: {
    display: 'block',
    marginBottom: '0.1rem',
    fontWeight: '500',
    color: 'var(--dark-green)',
    fontSize: '11px'
  },
  input: {
    width: '100%',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
    height: '32px'
  },
  select: {
    width: '100%',
    padding: '8px 32px 8px 12px',
    borderRadius: '6px',
    fontSize: '11px',
    boxSizing: 'border-box',
    backgroundColor: 'white',
    height: '32px',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    transition: 'border-color 0.2s ease'
  },
  error: {
    color: 'var(--danger-red)',
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

// Reusable input field component
export const InputField = memo(({ 
  name, 
  label, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  error,
  type = 'text',
  labelFontSize,
  labelMarginBottom
}) => {
  const styles = getFormStyles();
  
  return (
    <div>
      <label style={{
        ...styles.label,
        fontSize: labelFontSize || styles.label.fontSize,
        marginBottom: labelMarginBottom || styles.label.marginBottom
      }}>
        {label} {required && '*'}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        min={type === 'number' ? 0 : undefined}
        style={{
          ...styles.input,
          border: `1px solid ${error ? 'var(--danger-red)' : 'var(--border-gray)'}`
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
export const SelectField = memo(({ 
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
  const styles = getFormStyles();
  
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
            border: `1px solid ${error ? 'var(--danger-red)' : 'var(--border-gray)'}`,
            color: value ? 'var(--dark-text)' : 'var(--placeholder-text)',
            backgroundColor: disabled ? 'var(--light-gray)' : 'var(--white)',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
          className="custom-select-dropdown"
        >
          <option value="" disabled style={{ color: 'var(--placeholder-text)' }}>
            {placeholder || `Select ${label.toLowerCase()}`}
          </option>
          {options.map(option => (
            <option key={option.value || option} value={option.value || option} style={{ color: 'var(--dark-text)' }}>
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
          fontSize: '11px',
          color: disabled ? 'var(--placeholder-text)' : 'var(--text-gray)'
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

// Reusable date field with age calculation
export const DateField = memo(({ 
  name, 
  label, 
  value, 
  onChange, 
  required = false, 
  error,
  calculateAge,
  styles
}) => {
  const formStyles = styles || getFormStyles();
  const age = value && calculateAge ? calculateAge(value) : null;
  
  return (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
      <div style={{ flex: 1 }}>
        <label style={formStyles.label}>
          {label} {required && '*'}
        </label>
        <input
          type="date"
          name={name}
          value={value}
          onChange={onChange}
          style={{
            ...formStyles.input,
            border: `1px solid ${error ? 'var(--red)' : 'var(--border-gray)'}`,
            color: value ? 'var(--black)' : '#adb5bd',
            backgroundColor: 'white'
          }}
          placeholder="Select birth date"
        />
        {error && (
          <span style={formStyles.error}>{error}</span>
        )}
      </div>
      {calculateAge && (
        <div style={{ flex: 1 }}>
          <label style={formStyles.label}>
            Age
          </label>
          <input
            type="text"
            value={age !== null ? age : '—'}
            readOnly
            style={{
              ...formStyles.input,
              border: `1px solid ${error ? 'var(--red)' : 'var(--border-gray)'}`,
              backgroundColor: 'rgba(0, 0, 0, 0.03)',
              color: 'var(--dark-text)',
              cursor: 'not-allowed'
            }}
            tabIndex={-1}
          />
        </div>
      )}
    </div>
  );
});

// Reusable beneficiary display card component
export const BeneficiaryCard = memo(({ beneficiary, picture, name, id }) => {
  const resolveImageUrl = (pic) => {
    if (!pic) return null;
    if (typeof pic === 'string' && pic.startsWith('http')) return pic;
    if (typeof pic === 'string' && !pic.startsWith('http') && !pic.startsWith('/')) {
      return `http://localhost:5000/uploads/${pic}`;
    }
    if (typeof pic === 'string') return `http://localhost:5000${pic.startsWith('/') ? pic : '/' + pic}`;
    return null;
  };

  const imgSrc = resolveImageUrl(picture);

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.75rem', 
      padding: '0.5rem', 
      backgroundColor: '#f8f9fa', 
      borderRadius: '4px', 
      border: '1px solid #e8f5e8' 
    }}>
      {imgSrc ? (
        <img 
          src={imgSrc} 
          alt="Beneficiary" 
          style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            objectFit: 'cover', 
            border: '2px solid #e8f5e8' 
          }} 
        />
      ) : (
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '50%', 
          backgroundColor: '#e8f5e8', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '1rem', 
          color: '#6c757d' 
        }}>
          👤
        </div>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#2c5530' }}>{name}</div>
        <div style={{ fontSize: '0.625rem', color: '#6c757d' }}>ID: {id}</div>
      </div>
    </div>
  );
});

export default { InputField, SelectField, DateField, BeneficiaryCard };