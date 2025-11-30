import React from 'react';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa6';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import { LuFilter, LuFilterX } from 'react-icons/lu';
import { CiExport } from 'react-icons/ci';
import { IoSearchOutline } from 'react-icons/io5';

const TableTabs = ({
  activeTab,
  onTabChange,
  isFilterActive,
  onToggleFilter,
  isExportDropdownOpen,
  onExportClick,
  onExportExcel,
  onExportPDF,
  searchQuery,
  onSearchChange
}) => {
  const tabs = ['Beneficiary List', 'Farm Location', 'Seedling Record', 'Crop Survey Status', 'Recent Activities'];

  return (
    <div style={{
      padding: '0rem',
      marginBottom: '0.5rem',
      backgroundColor: 'transparent',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              if (activeTab === tab) {
                onTabChange(null);
              } else {
                onTabChange(tab);
              }
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--dark-green)' : 'none',
              color: activeTab === tab ? 'var(--dark-green)' : '#666',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontWeight: activeTab === tab ? 600 : 500,
              transition: 'all 0.1s ease',
              borderRadius: '4px 4px 0 0',
              whiteSpace: 'nowrap',
              transform: 'scale(1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f9f0';
              e.currentTarget.style.color = 'var(--dark-green)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = activeTab === tab ? 'var(--dark-green)' : '#666';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Search Bar */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <IoSearchOutline
            size={14}
            style={{
              position: 'absolute',
              left: '0.5rem',
              color: '#666',
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              padding: '0.4rem 0.7rem 0.4rem 2rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '0.6rem',
              width: '280px',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--dark-green)';
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(44, 85, 48, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
        
        {/* Add/Clear Filter Button */}
        {!isFilterActive ? (
          <button
            onClick={onToggleFilter}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.4rem 0.7rem',
              backgroundColor: 'var(--white)',
              color: 'var(--dark-green)',
              border: '1px solid var(--dark-green)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.6rem',
              fontWeight: 500,
              transition: 'all 0.1s ease',
              transform: 'scale(1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <LuFilter size={12} />
            <span>Add Filter</span>
          </button>
        ) : (
          <button
            onClick={onToggleFilter}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.4rem 0.7rem',
              backgroundColor: 'var(--dark-green)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.6rem',
              fontWeight: 500,
              transition: 'all 0.1s ease',
              transform: 'scale(1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <LuFilterX size={12} />
            <span>Clear Filter</span>
          </button>
        )}

        {/* Export Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={onExportClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.4rem 0.7rem',
              backgroundColor: 'var(--white)',
              color: 'var(--dark-green)',
              border: '1px solid var(--dark-green)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.6rem',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--dark-green)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--white)';
              e.currentTarget.style.color = 'var(--dark-green)';
            }}
          >
            <CiExport size={12} />
            <span>Export</span>
            {isExportDropdownOpen ? <MdKeyboardArrowUp size={14} /> : <MdKeyboardArrowDown size={14} />}
          </button>
          
          {/* Export Dropdown Menu */}
          {isExportDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.25rem',
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                minWidth: '150px',
              }}
            >
              <button
                onClick={onExportExcel}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: 'none',
                  background: 'white',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#333',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <FaFileExcel size={14} color="#107C41" />
                <span>Export as Excel</span>
              </button>
              <button
                onClick={onExportPDF}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: 'none',
                  background: 'white',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#333',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <FaFilePdf size={14} color="#DC3545" />
                <span>Export as PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableTabs;
