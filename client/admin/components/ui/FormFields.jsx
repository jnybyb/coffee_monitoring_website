import React, { memo } from "react";

// Shared form styles utility
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

// Reusable input field component
export const InputField = memo(({ 
  name, 
  label, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  error,
  type = 'text'
}) => {
  const styles = getFormStyles();
  
  return (
    <div>
      <label style={styles.label}>
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
          fontSize: '11px',
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

export default { InputField, SelectField };