import React, { useState, useEffect, useRef } from 'react';
import { LuChevronUp } from 'react-icons/lu';

const FilterDropdown = ({
  isOpen,
  onClose,
  title,
  options = [],
  selectedOptions = [],
  onSelectionChange,
  onApply,
  position = "left"
}) => {
  const [localSelectedOptions, setLocalSelectedOptions] = useState(selectedOptions);
  const dropdownRef = useRef(null);

  // Update local state when props change
  useEffect(() => {
    setLocalSelectedOptions(selectedOptions);
  }, [selectedOptions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle checkbox change
  const handleCheckboxChange = (option) => {
    const newSelected = localSelectedOptions.includes(option)
      ? localSelectedOptions.filter(item => item !== option)
      : [...localSelectedOptions, option];
    
    setLocalSelectedOptions(newSelected);
  };

  // Handle "Select All" toggle
  const handleSelectAll = () => {
    if (localSelectedOptions.length === options.length) {
      setLocalSelectedOptions([]);
    } else {
      setLocalSelectedOptions(options);
    }
  };

  // Handle apply button
  const handleApply = () => {
    onSelectionChange(localSelectedOptions);
    onApply();
    onClose();
  };

  // Handle clear all
  const handleClearAll = () => {
    setLocalSelectedOptions([]);
  };

  // Calculate width based on longest option text
  const getContainerWidth = () => {
    if (options.length === 0) return '200px';
    
    const longestOption = options.reduce((longest, current) => 
      current.length > longest.length ? current : longest
    );
    
    // Base width for "Select All" + longest option + padding + checkbox space
    const baseWidth = Math.max(longestOption.length * 7, 120); // 7px per character
    const totalWidth = baseWidth + 60; // Add padding and checkbox space
    
    return `${Math.min(Math.max(totalWidth, 180), 300)}px`; // Min 180px, Max 300px
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: '100%',
        left: position === 'left' ? '0' : 'auto',
        right: position === 'right' ? '0' : 'auto',
        zIndex: 1000,
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: '1px solid #e5e7eb',
        width: getContainerWidth(),
        minHeight: 'fit-content',
        height: 'auto',
        maxHeight: 'none',
        overflow: 'visible',
        display: 'block'
      }}
    >
      {/* Header with selection count and collapse icon */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <span style={{
          fontSize: '7px',
          fontWeight: '400',
          color: '#374151'
        }}>
          {localSelectedOptions.length} of {options.length} selected
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            padding: '1px',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => e.target.style.color = '#374151'}
          onMouseOut={(e) => e.target.style.color = '#6b7280'}
        >
          <LuChevronUp size={10} />
        </button>
      </div>

      {/* Options List */}
      <div style={{
        minHeight: 'fit-content',
        height: 'auto',
        maxHeight: 'none',
        overflowY: 'visible',
        overflowX: 'visible',
        padding: '6px 0',
        display: 'block'
      }}>
        {/* Select All Option */}
        {options.length > 0 && (
          <div style={{
            padding: '3px 6px',
            borderBottom: '1px solid #f3f4f6',
            marginBottom: '2px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              fontSize: '7px',
              color: '#374151'
            }}>
              <input
                type="checkbox"
                checked={localSelectedOptions.length === options.length && options.length > 0}
                onChange={handleSelectAll}
                style={{
                  marginRight: '6px',
                  width: '10px',
                  height: '10px',
                  accentColor: '#3b82f6'
                }}
              />
              Select All
            </label>
          </div>
        )}

        {/* Individual Options */}
        {options.length > 0 ? (
          options.map((option, index) => (
            <div
              key={index}
              style={{
                padding: '3px 6px',
                cursor: 'pointer',
                backgroundColor: localSelectedOptions.includes(option) ? '#f3f4f6' : 'transparent',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                if (!localSelectedOptions.includes(option)) {
                  e.target.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseOut={(e) => {
                if (!localSelectedOptions.includes(option)) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
              onClick={() => handleCheckboxChange(option)}
            >
              <label style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: '7px',
                color: '#374151',
                width: '100%'
              }}>
                <input
                  type="checkbox"
                  checked={localSelectedOptions.includes(option)}
                  onChange={() => handleCheckboxChange(option)}
                  style={{
                    marginRight: '6px',
                    width: '10px',
                    height: '10px',
                    accentColor: '#3b82f6'
                  }}
                />
                {option}
              </label>
            </div>
          ))
        ) : (
          <div style={{
            padding: '12px',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '7px'
          }}>
            No status options available
          </div>
        )}
      </div>

      {/* Footer with Apply Button */}
      <div style={{
        padding: '3px 6px',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: '#f9fafb',
        minHeight: 'fit-content'
      }}>
        <button
          onClick={handleClearAll}
          style={{
            padding: '3px 6px',
            border: '1px solid #d1d5db',
            borderRadius: '3px',
            backgroundColor: 'transparent',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: '7px',
            fontWeight: '400'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#f3f4f6';
            e.target.style.color = '#374151';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#6b7280';
          }}
        >
          Clear All
        </button>
        <button
          onClick={handleApply}
          style={{
            padding: '3px 6px',
            border: 'none',
            borderRadius: '3px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '7px',
            fontWeight: '400',
            letterSpacing: '0.5px'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default FilterDropdown;


