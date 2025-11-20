import React, { useState, useEffect } from 'react';
import { beneficiariesAPI, handleAPIError } from '../../../../services/api';
import { 
  FaUserFriends, 
  FaSeedling, 
  FaLeaf,
  FaClipboardList 
} from 'react-icons/fa';
import { LuArrowDownUp, LuArrowUpAZ, LuArrowDownZA, LuArrowDown, LuArrowUp, LuArrowUp01, LuArrowDown10 } from "react-icons/lu";
// Removed dropdown icons as expand/collapse is no longer used
import Pagination from '../../../ui/Pagination';

// Inline NoDataIcon component
const NoDataIcon = ({ type = 'default', size = '48px', color = '#6c757d' }) => {
  const getIcon = () => {
    switch (type) {
      case 'beneficiaries':
      case 'personal':
        return <FaUserFriends size={size} color={color} />;
      case 'seedlings':
      case 'seedling':
        return <FaSeedling size={size} color={color} />;
      case 'crops':
      case 'crop':
        return <FaLeaf size={size} color={color} />;
      default:
        return <FaClipboardList size={size} color={color} />;
    }
  };

  return (
    <div style={{ 
      fontSize: size, 
      marginBottom: '1rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {getIcon()}
    </div>
  );
};

// Table column headers
const columns = [
  'Beneficiary ID',
  'Name',
  'Address',
  'Gender',
  'Birth Date',
  'Age',
  'Status',
  'Cellphone'
];

// Common styles (updated to match requested UI)
const getCommonStyles = () => ({
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    borderRadius: '5px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    tableLayout: 'fixed',
  },
  tableHeader: {
    padding: '8px 12px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#2c5530',
    borderBottom: '2px solid #2c5530',
    fontSize: '0.65rem',
    height: '32px'
  },
  tableCell: {
    padding: '6px 16px',
    fontSize: '0.6rem',
    color: '#495057',
    height: '28px',
    verticalAlign: 'middle'
  },
  actionsCell: {
    display: 'flex',
    gap: '8px'
  },
  actionButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    borderRadius: '3px',
    transition: 'color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '3rem',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: '1px solid #f5c6cb',
    fontSize: '0.875rem'
  }
});

const PersonalDetailsTable = () => {
  const styles = getCommonStyles();
  // State management (table + pagination only)
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'default' // 'default', 'asc', 'desc'
  });

  // Format address for display
  const formatAddress = (beneficiary) => {
    const parts = [
      beneficiary.purok,
      beneficiary.barangay,
      beneficiary.municipality,
      beneficiary.province
    ].filter(Boolean);
    return parts.join(', ');
  };

  // Format name for display
  const formatName = (beneficiary) => {
    const parts = [
      beneficiary.firstName,
      beneficiary.middleName,
      beneficiary.lastName
    ].filter(Boolean);
    return parts.join(' ');
  };

  const totalRecords = filteredBeneficiaries.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  // Get unique addresses and statuses for filter options
  const uniqueAddresses = [...new Set(beneficiaries.map(b => formatAddress(b)).filter(Boolean))];
  const uniqueStatuses = [...new Set(beneficiaries.map(b => b.maritalStatus).filter(Boolean))];

  useEffect(() => {
    // Ensure current page stays in range when data/pageSize changes
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  // Load existing beneficiaries from the database on mount
  useEffect(() => {
    const fetchBeneficiaries = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await beneficiariesAPI.getAll();
        const records = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setBeneficiaries(records);
        setFilteredBeneficiaries(records);
      } catch (err) {
        setError(err?.message || 'Failed to load beneficiaries.');
      } finally {
        setLoading(false);
      }
    };
    fetchBeneficiaries();
  }, []);

  // Expanded content removed; keep table rows only

  // Sorting function
  const handleSort = (key) => {
    let direction = 'default';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'default') {
        direction = 'asc';
      } else if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else {
        direction = 'default';
      }
    } else {
      direction = 'asc';
    }

    setSortConfig({ key, direction });

    if (direction === 'default') {
      setFilteredBeneficiaries([...beneficiaries]);
    } else {
      const sorted = [...beneficiaries].sort((a, b) => {
        let aValue, bValue;

        if (key === 'beneficiaryId') {
          aValue = a.beneficiaryId || '';
          bValue = b.beneficiaryId || '';
        } else if (key === 'name') {
          aValue = formatName(a).toLowerCase();
          bValue = formatName(b).toLowerCase();
        } else if (key === 'birthDate') {
          aValue = a.birthDate ? new Date(a.birthDate).getTime() : 0;
          bValue = b.birthDate ? new Date(b.birthDate).getTime() : 0;
          if (direction === 'asc') {
            return aValue - bValue;
          } else {
            return bValue - aValue;
          }
        } else if (key === 'gender') {
          aValue = a.gender || '';
          bValue = b.gender || '';
        } else if (key === 'age') {
          aValue = parseInt(a.age) || 0;
          bValue = parseInt(b.age) || 0;
          if (direction === 'asc') {
            return aValue - bValue;
          } else {
            return bValue - aValue;
          }
        } else {
          aValue = a[key] || '';
          bValue = b[key] || '';
        }

        if (direction === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
      setFilteredBeneficiaries(sorted);
    }
  };

  // Get sort icon for a column
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      if (columnKey === 'gender') {
        return <LuArrowDownUp size={12} />;
      } else if (columnKey === 'age') {
        return <LuArrowDownUp size={12} />;
      } else {
        return <LuArrowDownUp size={12} />;
      }
    }
    
    switch (sortConfig.direction) {
      case 'asc':
        if (columnKey === 'gender') {
          return <LuArrowUp size={12} />;
        } else if (columnKey === 'age') {
          return <LuArrowUp01 size={12} />;
        } else {
          return <LuArrowUpAZ size={12} />;
        }
      case 'desc':
        if (columnKey === 'gender') {
          return <LuArrowDown size={12} />;
        } else if (columnKey === 'age') {
          return <LuArrowDown10 size={12} />;
        } else {
          return <LuArrowDownZA size={12} />;
        }
      default:
        if (columnKey === 'gender') {
          return <LuArrowDownUp size={12} />;
        } else if (columnKey === 'age') {
          return <LuArrowDownUp size={12} />;
        } else {
          return <LuArrowDownUp size={12} />;
        }
    }
  };

  // Apply filters
  const applyFilters = () => {
    // No filters to apply, just use all beneficiaries
    setFilteredBeneficiaries([...beneficiaries]);
    setCurrentPage(1); // Reset to first page
  };

  // Render table content
  const renderTableContent = () => {
    if (loading) {
      return (
        <div style={styles.emptyState}>
          <div style={{ width: '35px', height: '35px', border: '3px solid #f3f3f3', borderTop: '3px solid var(--dark-green)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#6c757d', margin: '1rem 0 0 0', fontSize: '0.875rem' }}>
            Loading beneficiaries...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div style={styles.emptyState}>
          <div style={styles.errorMessage}>
            <strong>Error:</strong> {error}
          </div>
        </div>
      );
    }

    if (filteredBeneficiaries.length === 0) {
      return (
        <div style={styles.emptyState}>
          <NoDataIcon type="beneficiaries" size="48px" color="#6c757d" />
          <h3 style={{ color: '#6c757d', marginBottom: '0.5rem', fontSize: '1.125rem' }}>No Data Available</h3>
          <p style={{ color: '#6c757d', margin: '0', fontSize: '0.875rem' }}>No beneficiary records found. Click "Add Beneficiary" to add new records.</p>
        </div>
      );
    }

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageItems = filteredBeneficiaries.slice(start, end);

    return (
      <>
        <table style={styles.table}>
          <thead>
            <tr style={{ backgroundColor: '#e8f5e8' }}>
              {columns.map((column, index) => {
                // Define column widths
                const getColumnWidth = (index) => {
                  switch (index) {
                    case 0: return '9%';    // Beneficiary ID - reduced
                    case 1: return '18%';   // Name - increased
                    case 2: return '27%';   // Address
                    case 3: return '8%';    // Gender
                    case 4: return '12%';   // Birth Date
                    case 5: return '6%';    // Age
                    case 6: return '10%';   // Status
                    case 7: return '10%';   // Cellphone
                    default: return 'auto';
                  }
                };

                return (
                  <th
                    key={index}
                    style={{
                      ...styles.tableHeader,
                      paddingLeft: index === 1 ? '20px' : '12px',
                      userSelect: 'none',
                      position: 'relative',
                      width: getColumnWidth(index)
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {column}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageItems.map((beneficiary, rowIndex) => (
              <tr key={beneficiary.id}
                style={{
                  borderBottom: '1px solid #e8f5e8',
                  transition: 'background-color 0.2s',
                  height: '28px',
                  backgroundColor: rowIndex % 2 === 0 ? '#fbfdfb' : '#ffffff'
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f0f8f0')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? '#fbfdfb' : '#ffffff')}
              >
                {/* Beneficiary ID */}
                <td style={{ ...styles.tableCell, width: '8%' }}>{beneficiary.beneficiaryId}</td>

                {/* Name with avatar */}
                <td style={{ ...styles.tableCell, padding: '6px 8px 6px 16px', width: '25%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {beneficiary.picture ? (
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#f8f9fa',
                          border: '2px solid #e8f5e8'
                        }}
                      >
                        <img
                          src={`http://localhost:5000${beneficiary.picture}`}
                          alt="Profile"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: '#f8f9fa',
                          border: '2px solid #e8f5e8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px'
                        }}
                      >
                        👤
                      </div>
                    )}
                    <span>
                      {[beneficiary.firstName, beneficiary.middleName, beneficiary.lastName]
                        .filter(Boolean)
                        .join(' ')}
                    </span>
                  </div>
                </td>

                {/* Address */}
                <td style={{ ...styles.tableCell, width: '20%' }}>{formatAddress(beneficiary)}</td>

                {/* Gender */}
                <td style={{ ...styles.tableCell, width: '8%' }}>{beneficiary.gender}</td>

                {/* Birth Date (formatted) */}
                <td style={{ ...styles.tableCell, width: '12%' }}>
                  {beneficiary.birthDate
                    ? new Date(beneficiary.birthDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : ''}
                </td>

                {/* Age */}
                <td style={{ ...styles.tableCell, width: '6%' }}>{beneficiary.age}</td>

                {/* Status */}
                <td style={{ ...styles.tableCell, width: '10%' }}>{beneficiary.maritalStatus}</td>

                {/* Cellphone */}
                <td style={{ ...styles.tableCell, width: '11%' }}>{beneficiary.cellphone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  };

  return (
    <div style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 63px)', overflow: 'hidden' }}>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
      
      {/* Header removed as requested */}
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '60vh' }}>
        <div style={{ padding: '0 1rem 0 1rem', overflowX: 'auto', overflowY: 'auto', flex: 1 }}>
          {renderTableContent()}
        </div>
      </div>

      {filteredBeneficiaries.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalRecords={totalRecords}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      )}

      {/* Modals and alerts will be handled by parent component */}
    </div>
  );
};

export default PersonalDetailsTable; 