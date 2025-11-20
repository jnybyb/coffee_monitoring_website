import React, { useState, useEffect, useImperativeHandle } from 'react';
import { IoClose } from "react-icons/io5";
import { 
  FaUserFriends, 
  FaSeedling, 
  FaLeaf,
  FaClipboardList 
} from 'react-icons/fa';
import { PiFileXLight } from "react-icons/pi";
import { LuArrowDownUp, LuArrowUpAZ, LuArrowDownZA, LuArrowDown, LuArrowUp, LuArrowUp01, LuArrowDown10 } from "react-icons/lu";
import Pagination from '../../../ui/Pagination';
import AlertModal from '../../../ui/AlertModal';
import AddCropStatusModal from './AddCropStatusModal';
import EditCropStatusModal from './EditCropStatusModal';
import DeleteCropStatusModal from './DeleteCropStatusModal';
import ViewCropStatusModal from './ViewCropStatusModal';
import { cropStatusAPI, beneficiariesAPI, handleAPIError } from '../../../../services/api';

// Inline NoDataIcon component
const NoDataIcon = ({ type = 'default', size = '48px', color = '#6c757d' }) => {
  const getIcon = () => {
    switch (type) {
      case 'beneficiaries':
      case 'personal':
        return <PiFileXLight size={size} color={color} />;
      case 'seedlings':
      case 'seedling':
        return <PiFileXLight size={size} color={color} />;
      case 'crops':
      case 'crop':
        return <PiFileXLight size={size} color={color} />;
      default:
        return <PiFileXLight size={size} color={color} />;
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
  'Survey Date',
  'Surveyer',
  'Number of Alive Crops',
  'Number of Dead Crops',
  'Plot'
];

// Common styles (updated to match Personal_Details)
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

// Column width configuration
const getColumnWidth = (index) => {
  switch (index) {
    case 0: return '12%';    // Beneficiary ID
    case 1: return '20%';    // Name
    case 2: return '15%';    // Survey Date
    case 3: return '18%';    // Surveyer
    case 4: return '12%';    // Alive Crops
    case 5: return '12%';    // Dead Crops
    case 6: return '11%';    // Plot
    default: return 'auto';
  }
};

// Alert modal configuration
const getAlertConfig = (type, title, message) => ({
  isOpen: true,
  type,
  title,
  message
});

const CropStatusTable = React.forwardRef((props, ref) => {
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [cropStatusData, setCropStatusData] = useState([]);
  const [filteredCropStatusData, setFilteredCropStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [recordToView, setRecordToView] = useState(null);
  const [beneficiaries, setBeneficiaries] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'default' // 'default', 'asc', 'desc'
  });

  const styles = getCommonStyles();

  const fetchCropStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cropStatusAPI.getAll();
      setCropStatusData(data || []);
      setFilteredCropStatusData(data || []);
    } catch (err) {
      const e = handleAPIError(err);
      setError(e.message || 'Failed to fetch crop status records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadBeneficiaries = async () => {
    try {
      const data = await beneficiariesAPI.getAll();
      setBeneficiaries(data);
    } catch (error) {
      console.error('Error loading beneficiaries:', error);
    }
  };

  useEffect(() => { 
    fetchCropStatus(); 
    loadBeneficiaries();
  }, []);

  const totalRecords = filteredCropStatusData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  // Ensure current page stays in range when data/pageSize changes
  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const currentItems = filteredCropStatusData.slice(start, end);

  const handleApiOperation = async (operation, successMessage, errorMessage) => {
    try {
      await operation();
      await fetchCropStatus();
      setAlertModal(getAlertConfig('success', 'Success', successMessage));
    } catch (err) {
      const e = handleAPIError(err);
      setError(e.message || errorMessage);
      setAlertModal(getAlertConfig('error', 'Failed', e.message || errorMessage));
    }
  };

  const handleAddCropStatus = async (newRecord) => {
    await handleApiOperation(
      () => cropStatusAPI.create(newRecord),
      'Crop status record has been added successfully.',
      'Failed to add crop status record. Please try again.'
    );
  };

  const handleEditCropStatus = async (updatedRecord) => {
    if (!updatedRecord.id) {
      setAlertModal(getAlertConfig('error', 'Failed', 'Record ID is missing. Cannot update record.'));
      return;
    }
    await handleApiOperation(
      () => cropStatusAPI.update(updatedRecord.id, updatedRecord),
      'Crop status record has been updated successfully.',
      'Failed to update crop status record. Please try again.'
    );
  };

  const handleDeleteCropStatus = async (recordId) => {
    await handleApiOperation(
      () => cropStatusAPI.delete(recordId),
      'Crop status record has been deleted successfully.',
      'Failed to delete crop status record. Please try again.'
    );
  };

  const handleAddClick = () => setIsAddModalOpen(true);
  const handleAddModalClose = () => setIsAddModalOpen(false);
  const handleAddModalSubmit = async (formData) => {
    try {
      await handleAddCropStatus(formData);
      setIsAddModalOpen(false);
    } catch (error) {
      // handled
    }
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedRecord(null);
  };

  const handleEditModalSubmit = async (formData) => {
    try {
      await handleEditCropStatus(formData);
      setIsEditModalOpen(false);
      setSelectedRecord(null);
    } catch (error) {
      // handled
    }
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setRecordToDelete(null);
  };

  const handleDeleteConfirm = async (record) => {
    try {
      await handleDeleteCropStatus(record.id);
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
    } catch (error) {
      // handled
    }
  };

  const handleEditClick = (record) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (record) => {
    setRecordToDelete(record);
    setIsDeleteModalOpen(true);
  };

  const handleViewClick = (record) => {
    setRecordToView(record);
    setIsViewModalOpen(true);
  };

  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setRecordToView(null);
  };

  const handleViewEditClick = (record) => {
    setSelectedRecord(record);
    setIsViewModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleViewDeleteClick = (record) => {
    setRecordToDelete(record);
    setIsViewModalOpen(false);
    setIsDeleteModalOpen(true);
  };

  const formatCropStatusForDisplay = (record) => {
    // Find beneficiary for name and profile picture
    const beneficiary = beneficiaries.find(b => b.beneficiaryId === record.beneficiaryId);
    const beneficiaryName = beneficiary ? beneficiary.fullName || `${beneficiary.firstName} ${beneficiary.middleName ? beneficiary.middleName + ' ' : ''}${beneficiary.lastName}`.trim() : record.beneficiaryId;
    
    return {
      beneficiaryId: record.beneficiaryId,
      name: (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px' // Gap between picture and name
        }}>
          {beneficiary && beneficiary.picture ? (
            <div style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '50%', 
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8f9fa',
              border: '2px solid #e8f5e8'
            }}>
              <img 
                src={`http://localhost:5000${beneficiary.picture}`} 
                alt="Profile" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover'
                }}
              />
            </div>
          ) : (
            <div style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '50%', 
              backgroundColor: '#f8f9fa',
              border: '2px solid #e8f5e8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px'
            }}>
              👤
            </div>
          )}
          <span>{beneficiaryName}</span>
        </div>
      ),
      surveyDate: new Date(record.surveyDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      surveyer: record.surveyer,
      aliveCrops: (
        <div style={{ textAlign: 'center' }}>
          <span style={{ color: '#28a745', fontWeight: '600', fontSize: '0.6rem' }}>{record.aliveCrops.toLocaleString()}</span>
        </div>
      ),
      deadCrops: (
        <div style={{ textAlign: 'center' }}>
          <span style={{ color: '#dc3545', fontWeight: '600', fontSize: '0.6rem' }}>{record.deadCrops.toLocaleString()}</span>
        </div>
      ),
      plot: record.plot || 'N/A'
    };
  };

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
      setFilteredCropStatusData([...cropStatusData]);
    } else {
      const sorted = [...cropStatusData].sort((a, b) => {
        let aValue, bValue;

        if (key === 'beneficiaryId') {
          aValue = a.beneficiaryId || '';
          bValue = b.beneficiaryId || '';
        } else if (key === 'name') {
          const beneficiaryA = beneficiaries.find(b => b.beneficiaryId === a.beneficiaryId);
          const beneficiaryB = beneficiaries.find(b => b.beneficiaryId === b.beneficiaryId);
          aValue = beneficiaryA ? (beneficiaryA.fullName || `${beneficiaryA.firstName} ${beneficiaryA.middleName ? beneficiaryA.middleName + ' ' : ''}${beneficiaryA.lastName}`.trim()) : a.beneficiaryId;
          bValue = beneficiaryB ? (beneficiaryB.fullName || `${beneficiaryB.firstName} ${beneficiaryB.middleName ? beneficiaryB.middleName + ' ' : ''}${beneficiaryB.lastName}`.trim()) : b.beneficiaryId;
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        } else if (key === 'surveyDate') {
          aValue = a.surveyDate ? new Date(a.surveyDate).getTime() : 0;
          bValue = b.surveyDate ? new Date(b.surveyDate).getTime() : 0;
          if (direction === 'asc') {
            return aValue - bValue;
          } else {
            return bValue - aValue;
          }
        } else if (key === 'aliveCrops' || key === 'deadCrops') {
          aValue = parseInt(a[key]) || 0;
          bValue = parseInt(b[key]) || 0;
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
      setFilteredCropStatusData(sorted);
    }
  };

  // Get sort icon for a column
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      if (columnKey === 'aliveCrops' || columnKey === 'deadCrops') {
        return <LuArrowDownUp size={12} />;
      } else {
        return <LuArrowDownUp size={12} />;
      }
    }
    
    switch (sortConfig.direction) {
      case 'asc':
        if (columnKey === 'aliveCrops' || columnKey === 'deadCrops') {
          return <LuArrowUp01 size={12} />;
        } else {
          return <LuArrowUpAZ size={12} />;
        }
      case 'desc':
        if (columnKey === 'aliveCrops' || columnKey === 'deadCrops') {
          return <LuArrowDown10 size={12} />;
        } else {
          return <LuArrowDownZA size={12} />;
        }
      default:
        if (columnKey === 'aliveCrops' || columnKey === 'deadCrops') {
          return <LuArrowDownUp size={12} />;
        } else {
          return <LuArrowDownUp size={12} />;
        }
    }
  };

  // Expose imperative handlers for parent header buttons
  useImperativeHandle(ref, () => ({
    openAddModal: () => setIsAddModalOpen(true),
    openImport: () => { /* implement import flow here */ }
  }));

  return (
    <div style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 63px)', overflow: 'hidden' }}>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
      
      {error && (
        <div style={styles.errorMessage}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '60vh' }}>
        <div style={{ padding: '0 1rem 0 1rem', overflowX: 'auto', overflowY: 'auto', flex: 1 }}>
        {loading ? (
          <div style={styles.emptyState}>
            <div style={{ width: '35px', height: '35px', border: '3px solid #f3f3f3', borderTop: '3px solid #2c5530', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <h3 style={{ color: '#6c757d', marginBottom: '0.5rem', fontSize: '1.125rem' }}>Loading...</h3>
            <p style={{ color: '#6c757d', margin: '0', fontSize: '0.875rem' }}>Please wait while we fetch the crop status records.</p>
          </div>
        ) : filteredCropStatusData.length === 0 ? (
          <div style={styles.emptyState}>
            <NoDataIcon type="crops" size="48px" color="#6c757d" />
            <h3 style={{ color: '#6c757d', marginBottom: '0.5rem', fontSize: '1.125rem' }}>No Data Available</h3>
            <p style={{ color: '#6c757d', margin: '0', fontSize: '0.875rem' }}>No crop status records found. Click "Add Record" to add new records.</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={{ backgroundColor: '#e8f5e8' }}>
                {columns.map((column, index) => {
                  const columnKey = column === 'Beneficiary ID' ? 'beneficiaryId' : 
                                   column === 'Name' ? 'name' : 
                                   column === 'Survey Date' ? 'surveyDate' : 
                                   column === 'Surveyer' ? 'surveyer' :
                                   column === 'Number of Alive Crops' ? 'aliveCrops' :
                                   column === 'Number of Dead Crops' ? 'deadCrops' : 'plot';
                  
                  return (
                    <th
                      key={index}
                      style={{
                        ...styles.tableHeader,
                        paddingLeft: index === 1 ? '20px' : '12px',
                        userSelect: 'none',
                        position: 'relative',
                        width: getColumnWidth(index),
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSort(columnKey)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {getSortIcon(columnKey)}
                        {column}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((record, rowIndex) => {
                const displayData = formatCropStatusForDisplay(record);
                return (
                  <tr 
                    key={record.id || rowIndex} 
                    style={{ 
                      borderBottom: '1px solid #e8f5e8', 
                      transition: 'background-color 0.2s', 
                      height: '28px', 
                      backgroundColor: rowIndex % 2 === 0 ? '#fbfdfb' : '#ffffff',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleViewClick(record)}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f8f0'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? '#fbfdfb' : '#ffffff'}>
                    {Object.values(displayData).map((cell, cellIndex) => (
                      <td key={cellIndex} style={{ ...styles.tableCell, width: getColumnWidth(cellIndex) }}>{cell}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        </div>
      </div>

      {filteredCropStatusData.length > 0 && (
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

      <AlertModal isOpen={alertModal.isOpen} onClose={() => setAlertModal({ ...alertModal, isOpen: false })} type={alertModal.type} title={alertModal.title} message={alertModal.message} autoClose={true} autoCloseDelay={3000} />

      <AddCropStatusModal isOpen={isAddModalOpen} onClose={handleAddModalClose} onSubmit={handleAddModalSubmit} />

      {isEditModalOpen && selectedRecord && (
        <EditCropStatusModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          onSubmit={handleEditModalSubmit}
          record={selectedRecord}
        />
      )}

      <DeleteCropStatusModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        record={recordToDelete}
      />

      {isViewModalOpen && recordToView && (
        <ViewCropStatusModal
          isOpen={isViewModalOpen}
          onClose={handleViewModalClose}
          record={recordToView}
          onEdit={handleViewEditClick}
          onDelete={handleViewDeleteClick}
          beneficiary={beneficiaries.find(b => b.beneficiaryId === recordToView.beneficiaryId)}
        />
      )}
    </div>
  );
});

export default CropStatusTable; 