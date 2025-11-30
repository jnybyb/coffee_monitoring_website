import React, { useState, useEffect, useRef } from "react";
import { useAddressData } from '../../hooks/useAddressData';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';

const FilterSection = ({
  onApplyFilters,
  onResetFilters,
  activeTab,
}) => {
  
  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedMaritalStatus, setSelectedMaritalStatus] = useState('');
  const [plotIdSearch, setPlotIdSearch] = useState('');
  const [hectaresMin, setHectaresMin] = useState('');
  const [hectaresMax, setHectaresMax] = useState('');
  const [seedlingSearch, setSeedlingSearch] = useState('');
  const [cropSearch, setCropSearch] = useState('');
  const [recentSearch, setRecentSearch] = useState('');
  const [beneficiarySearch, setBeneficiarySearch] = useState('');
  
  // Multi-select dropdown states
  const [isAttributeDropdownOpen, setIsAttributeDropdownOpen] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const dropdownRef = useRef(null);
  
  // Get address data
  const { provinces, municipalities, loadMunicipalities } = useAddressData();
  
  // Available attributes from different tables
  const availableAttributes = [
    // Beneficiary List attributes
    { id: 'ben_id', label: 'Beneficiary ID', table: 'Beneficiary List' },
    { id: 'ben_fullname', label: 'Full Name', table: 'Beneficiary List' },
    { id: 'ben_gender', label: 'Gender', table: 'Beneficiary List' },
    { id: 'ben_birthdate', label: 'Birth Date', table: 'Beneficiary List' },
    { id: 'ben_age', label: 'Age', table: 'Beneficiary List' },
    { id: 'ben_cellphone', label: 'Cellphone', table: 'Beneficiary List' },
    { id: 'ben_address', label: 'Address', table: 'Beneficiary List' },
    { id: 'ben_marital', label: 'Marital Status', table: 'Beneficiary List' },
    
    // Farm Location attributes
    { id: 'farm_plot_id', label: 'Plot ID', table: 'Farm Location' },
    { id: 'farm_beneficiary', label: 'Farm Beneficiary', table: 'Farm Location' },
    { id: 'farm_hectares', label: 'Hectares', table: 'Farm Location' },
    { id: 'farm_address', label: 'Address', table: 'Farm Location' },
    { id: 'farm_coordinates', label: 'Coordinates', table: 'Farm Location' },
    
    // Seedling Record attributes
    { id: 'seed_id', label: 'Seedling ID', table: 'Seedling Record' },
    { id: 'seed_ben_id', label: 'Seedling Beneficiary ID', table: 'Seedling Record' },
    { id: 'seed_received', label: 'Seedlings Received', table: 'Seedling Record' },
    { id: 'seed_date_received', label: 'Date Received', table: 'Seedling Record' },
    { id: 'seed_planted', label: 'Seedlings Planted', table: 'Seedling Record' },
    { id: 'seed_plot_id', label: 'Seedling Plot ID', table: 'Seedling Record' },
    { id: 'seed_planting_date', label: 'Planting Date', table: 'Seedling Record' },
    
    // Crop Survey Status attributes
    { id: 'crop_id', label: 'Survey ID', table: 'Crop Survey Status' },
    { id: 'crop_ben_id', label: 'Beneficiary ID', table: 'Crop Survey Status' },
    { id: 'crop_survey_date', label: 'Survey Date', table: 'Crop Survey Status' },
    { id: 'crop_surveyer', label: 'Surveyer', table: 'Crop Survey Status' },
    { id: 'crop_beneficiary', label: 'Crop Beneficiary', table: 'Crop Survey Status' },
    { id: 'crop_alive', label: 'Alive Crops', table: 'Crop Survey Status' },
    { id: 'crop_dead', label: 'Dead Crops', table: 'Crop Survey Status' },
    { id: 'crop_plot', label: 'Crop Plot', table: 'Crop Survey Status' },
    
    // Recent Activities attributes
    { id: 'act_id', label: 'Activity ID', table: 'Recent Activities' },
    { id: 'act_type', label: 'Activity Type', table: 'Recent Activities' },
    { id: 'act_action', label: 'Action', table: 'Recent Activities' },
    { id: 'act_timestamp', label: 'Timestamp', table: 'Recent Activities' },
    { id: 'act_user', label: 'User', table: 'Recent Activities' },
  ];
  
  // Load municipalities when province changes
  useEffect(() => {
    if (selectedProvince) {
      loadMunicipalities(selectedProvince);
    }
  }, [selectedProvince, loadMunicipalities]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAttributeDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Use municipalities from the hook
  const availableMunicipalities = municipalities;

  const handleClearFilter = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedProvince('');
    setSelectedMunicipality('');
    setSelectedStatus('');
    setSelectedGender('');
    setSelectedMaritalStatus('');
    setSelectedAttributes([]);
    setPlotIdSearch('');
    setHectaresMin('');
    setHectaresMax('');
    setSeedlingSearch('');
    setCropSearch('');
    setRecentSearch('');
    setBeneficiarySearch('');
    
    if (onResetFilters) {
      onResetFilters();
    }
  };
  
  const handleAttributeToggle = (attributeId) => {
    setSelectedAttributes(prev => {
      if (prev.includes(attributeId)) {
        return prev.filter(id => id !== attributeId);
      } else {
        return [...prev, attributeId];
      }
    });
  };
  
  const toggleAttributeDropdown = () => {
    setIsAttributeDropdownOpen(!isAttributeDropdownOpen);
  };
  
  const handleSelectAllAttributes = () => {
    if (selectedAttributes.length === availableAttributes.length) {
      setSelectedAttributes([]);
    } else {
      setSelectedAttributes(availableAttributes.map(attr => attr.id));
    }
  };
  
  const handleClearAllAttributes = () => {
    setSelectedAttributes([]);
  };
  
  const handleToggleTableAttributes = (table) => {
    const tableAttributes = availableAttributes.filter(attr => attr.table === table);
    const tableAttrIds = tableAttributes.map(attr => attr.id);
    const allTableAttrsSelected = tableAttrIds.every(id => selectedAttributes.includes(id));
    
    if (allTableAttrsSelected) {
      // Deselect all attributes from this table
      setSelectedAttributes(prev => prev.filter(id => !tableAttrIds.includes(id)));
    } else {
      // Select all attributes from this table
      setSelectedAttributes(prev => {
        const newIds = tableAttrIds.filter(id => !prev.includes(id));
        return [...prev, ...newIds];
      });
    }
  };
  
  const isTableFullySelected = (table) => {
    const tableAttributes = availableAttributes.filter(attr => attr.table === table);
    const tableAttrIds = tableAttributes.map(attr => attr.id);
    return tableAttrIds.length > 0 && tableAttrIds.every(id => selectedAttributes.includes(id));
  };

  const handleApplyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters({
        dateFrom,
        dateTo,
        selectedProvince,
        selectedMunicipality,
        selectedStatus,
        selectedGender,
        selectedMaritalStatus,
        selectedAttributes,
        plotIdSearch,
        hectaresMin,
        hectaresMax,
        seedlingSearch,
        cropSearch,
        recentSearch,
        beneficiarySearch
      });
    }
  };

  // Render filters based on active tab
  const renderTabSpecificFilters = () => {
    switch (activeTab) {
      case 'Beneficiary List':
        return (
          <>
            {/* Gender Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <label style={{ fontSize: '0.6rem', color: '#666', fontWeight: 500 }}>Gender</label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                style={{
                  padding: '0.3rem 0.4rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.65rem',
                  width: '110px',
                  cursor: 'pointer',
                  backgroundColor: 'white',
                  color: selectedGender ? '#1f2937' : '#9ca3af'
                }}
              >
                <option value="">All gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            
            {/* Marital Status Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <label style={{ fontSize: '0.6rem', color: '#666', fontWeight: 500 }}>Marital Status</label>
              <select
                value={selectedMaritalStatus}
                onChange={(e) => setSelectedMaritalStatus(e.target.value)}
                style={{
                  padding: '0.3rem 0.4rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.65rem',
                  width: '120px',
                  cursor: 'pointer',
                  backgroundColor: 'white',
                  color: selectedMaritalStatus ? '#1f2937' : '#9ca3af'
                }}
              >
                <option value="">All status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Separated">Separated</option>
              </select>
            </div>
            
            {/* Birthdate Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <label style={{ fontSize: '0.6rem', color: '#666', fontWeight: 500 }}>Birthdate</label>
              <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  style={{
                    padding: '0.3rem 0.4rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    width: '120px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '0.6rem', color: '#666' }}>-</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  style={{
                    padding: '0.3rem 0.4rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    width: '120px',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
          </>
        );
      
      case 'Farm Location':
        return (
          <>
            {/* Hectares Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <label style={{ fontSize: '0.6rem', color: '#666', fontWeight: 500 }}>Hectares</label>
              <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Min"
                  value={hectaresMin}
                  onChange={(e) => setHectaresMin(e.target.value)}
                  style={{
                    padding: '0.3rem 0.4rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    width: '70px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '0.6rem', color: '#666' }}>-</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Max"
                  value={hectaresMax}
                  onChange={(e) => setHectaresMax(e.target.value)}
                  style={{
                    padding: '0.3rem 0.4rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    width: '70px',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
          </>
        );
      
      case 'Seedling Record':
        return (
          <>
            {/* Date Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <label style={{ fontSize: '0.6rem', color: '#666', fontWeight: 500 }}>Date Range</label>
              <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  style={{
                    padding: '0.3rem 0.4rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    width: '120px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '0.6rem', color: '#666' }}>-</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  style={{
                    padding: '0.3rem 0.4rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    width: '120px',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
          </>
        );
      
      case 'Crop Survey Status':
        return (
          <>
            {/* Date Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <label style={{ fontSize: '0.6rem', color: '#666', fontWeight: 500 }}>Date Range</label>
              <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  style={{
                    padding: '0.3rem 0.4rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    width: '120px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '0.6rem', color: '#666' }}>-</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  style={{
                    padding: '0.3rem 0.4rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    width: '120px',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
          </>
        );
      
      case 'Recent Activities':
        return (
          <>
            {/* Date Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <label style={{ fontSize: '0.6rem', color: '#666', fontWeight: 500 }}>Date Range</label>
              <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  style={{
                    padding: '0.3rem 0.4rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    width: '120px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '0.6rem', color: '#666' }}>-</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  style={{
                    padding: '0.3rem 0.4rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    width: '120px',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };


  return (
    <div style={{
      padding: '1rem 0.7rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      flexWrap: 'wrap',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      marginBottom: '0.5rem'  
    }}>
      {/* Multi-select Attribute Dropdown - Hidden for Recent Activities */}
      {activeTab !== 'Recent Activities' && (
        <div ref={dropdownRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', position: 'relative' }}>
        <label style={{ fontSize: '0.6rem', color: '#666', fontWeight: 500 }}>All Attributes</label>
        <button
          onClick={toggleAttributeDropdown}
          style={{
            padding: '0.3rem 0.4rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '0.65rem',
            width: '150px',
            cursor: 'pointer',
            backgroundColor: 'white',
            color: selectedAttributes.length > 0 ? '#1f2937' : '#9ca3af',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: 'left'
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedAttributes.length > 0 ? `${selectedAttributes.length} selected` : 'Select attributes'}
          </span>
          {isAttributeDropdownOpen ? <MdKeyboardArrowUp size={14} /> : <MdKeyboardArrowDown size={14} />}
        </button>
        
        {/* Dropdown Menu */}
        {isAttributeDropdownOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '0.25rem',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            width: '280px',
            maxHeight: '400px',
            overflow: 'auto'
          }}>
            {/* Group attributes by table */}
            {['Beneficiary List', 'Farm Location', 'Seedling Record', 'Crop Survey Status', 'Recent Activities'].map((table) => {
              const tableAttributes = availableAttributes.filter(attr => attr.table === table);
              return (
                <div key={table}>
                  {/* Table header with checkbox */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#f3f4f6',
                      fontSize: '0.6rem',
                      fontWeight: 600,
                      color: '#4b5563',
                      borderBottom: '1px solid #e5e7eb',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isTableFullySelected(table)}
                      onChange={() => handleToggleTableAttributes(table)}
                      style={{
                        marginRight: '0.5rem',
                        cursor: 'pointer',
                        accentColor: 'var(--dark-green)'
                      }}
                    />
                    <span>{table}</span>
                  </label>
                  {/* Table attributes with indentation */}
                  {tableAttributes.map((attr) => (
                    <label
                      key={attr.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.5rem 0.75rem',
                        paddingLeft: '2rem',
                        cursor: 'pointer',
                        fontSize: '0.65rem',
                        color: '#374151',
                        backgroundColor: selectedAttributes.includes(attr.id) ? '#f0f9f0' : 'white',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!selectedAttributes.includes(attr.id)) {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!selectedAttributes.includes(attr.id)) {
                          e.currentTarget.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAttributes.includes(attr.id)}
                        onChange={() => handleAttributeToggle(attr.id)}
                        style={{
                          marginRight: '0.5rem',
                          cursor: 'pointer',
                          accentColor: 'var(--dark-green)'
                        }}
                      />
                      <span>{attr.label}</span>
                    </label>
                  ))}
                </div>
              );
            })}
            
            {/* Footer with Select/Clear All */}
            <div style={{
              padding: '0.5rem 0.75rem',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f9fafb',
              position: 'sticky',
              bottom: 0,
              zIndex: 1
            }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleSelectAllAttributes}
                  style={{
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.6rem',
                    backgroundColor: 'transparent',
                    color: 'var(--dark-green)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'all 0.1s ease',
                    transform: 'scale(1)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {selectedAttributes.length === availableAttributes.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={handleClearAllAttributes}
                  style={{
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.6rem',
                    backgroundColor: 'transparent',
                    color: '#dc3545',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'all 0.1s ease',
                    transform: 'scale(1)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Clear
                </button>
              </div>
              <button
                onClick={() => setIsAttributeDropdownOpen(false)}
                style={{
                  padding: '0.3rem 0.8rem',
                  fontSize: '0.6rem',
                  backgroundColor: 'var(--dark-green)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.1s ease',
                  transform: 'scale(1)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
      )}
      
      {/* Tab-specific filters - moved here for Beneficiary List ordering */}
      {renderTabSpecificFilters()}
      
      {/* Province Filter (Address) - Hidden for Seedling Record, Crop Survey Status, and Recent Activities */}
      {activeTab !== 'Seedling Record' && activeTab !== 'Crop Survey Status' && activeTab !== 'Recent Activities' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <label style={{ fontSize: '0.6rem', color: '#666', fontWeight: 500 }}>Province</label>
          <select
            value={selectedProvince}
            onChange={(e) => {
              setSelectedProvince(e.target.value);
              setSelectedMunicipality(''); // Reset municipality when province changes
            }}
            style={{
              padding: '0.3rem 0.4rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '0.65rem',
              width: '130px',
              cursor: 'pointer',
              backgroundColor: 'white',
              color: selectedProvince ? '#1f2937' : '#9ca3af'
            }}
          >
            <option value="">All province</option>
            {provinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Municipality Filter (Address) - Hidden for Seedling Record, Crop Survey Status, and Recent Activities */}
      {activeTab !== 'Seedling Record' && activeTab !== 'Crop Survey Status' && activeTab !== 'Recent Activities' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <label style={{ fontSize: '0.6rem', color: '#666', fontWeight: 500 }}>Municipality</label>
          <select
            value={selectedMunicipality}
            onChange={(e) => setSelectedMunicipality(e.target.value)}
            disabled={!selectedProvince}
            style={{
              padding: '0.3rem 0.4rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '0.65rem',
              width: '130px',
              cursor: selectedProvince ? 'pointer' : 'not-allowed',
              backgroundColor: selectedProvince ? 'white' : '#f3f4f6',
              color: selectedMunicipality ? '#1f2937' : '#9ca3af'
            }}
          >
            <option value="">All municipality</option>
            {availableMunicipalities.map((municipality) => (
              <option key={municipality} value={municipality}>
                {municipality}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        <label style={{ fontSize: '0.6rem', color: 'transparent', fontWeight: 500, userSelect: 'none' }}>.</label>
        <button
          onClick={handleApplyFilters}
          style={{
            padding: '0.4rem 1rem',
            backgroundColor: 'var(--dark-green)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.65rem',
            fontWeight: 500,
            width: 'auto',
            transition: 'all 0.1s ease',
            transform: 'scale(1)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default FilterSection;
