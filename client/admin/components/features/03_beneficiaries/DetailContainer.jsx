import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaVenusMars, FaRing, FaBirthdayCake, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { LuLandPlot } from 'react-icons/lu';
import { GiSeedling } from 'react-icons/gi';
import { MdOutlineAssignment } from 'react-icons/md';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { RiAddLargeFill, RiArrowRightDoubleLine } from 'react-icons/ri';
import { CiEdit, CiImport } from "react-icons/ci";
import { PiTrashLight } from "react-icons/pi";
import { ActionButton } from '../../ui/BeneficiaryButtons';
import AddFarmPlotModal from '../../features/02_farm-monitoring/AddFarmPlotModal';
import AddSeedlingRecordModal from './AddSeedlingRecordModal';
import EditSeedlingRecordModal from './EditSeedlingRecordModal';
import EditBeneficiaryModal from './EditBeneficiaryModal';
import AddSurveyStatusModal from './AddSurveyStatusModal';
import EditCropStatusModal from './EditSurveyStatusModal';
import AlertModal from '../../ui/AlertModal';
import LoadingModal from '../../ui/LoadingModal';
import { beneficiariesAPI, seedlingsAPI, cropStatusAPI, farmPlotsAPI } from '../../../services/api';

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.6rem' }}>
    <div style={{ color: 'var(--dark-gray)', fontSize: '0.7rem', fontWeight: 700, minWidth: '100px' }}>
      {label}:
    </div>
    <div style={{ color: 'var(--dark-green)', fontSize: '0.7rem', fontWeight: 500, flex: 1 }}>{value || '-'}</div>
  </div>
);

const DetailContainer = ({ selectedBeneficiary, onClose }) => {
  const navigate = useNavigate();
  const [showAddFarmPlot, setShowAddFarmPlot] = useState(false);
  const [showAddSeedling, setShowAddSeedling] = useState(false);
  const [showAddCropStatus, setShowAddCropStatus] = useState(false);
  const [showEditBeneficiary, setShowEditBeneficiary] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showDeleteLoading, setShowDeleteLoading] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const [importType, setImportType] = useState('');
  const [currentBeneficiary, setCurrentBeneficiary] = useState(selectedBeneficiary);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [seedlingRecords, setSeedlingRecords] = useState([]);
  const [loadingSeedlings, setLoadingSeedlings] = useState(false);
  const [expandedRecords, setExpandedRecords] = useState({});
  const [showEditSeedling, setShowEditSeedling] = useState(false);
  const [showDeleteSeedlingAlert, setShowDeleteSeedlingAlert] = useState(false);
  const [selectedSeedlingRecord, setSelectedSeedlingRecord] = useState(null);
  const [showSeedlingUpdateSuccess, setShowSeedlingUpdateSuccess] = useState(false);
  const [showDeleteSeedlingLoading, setShowDeleteSeedlingLoading] = useState(false);
  const [showDeleteSeedlingSuccess, setShowDeleteSeedlingSuccess] = useState(false);
  const [showAddSeedlingSuccess, setShowAddSeedlingSuccess] = useState(false);
  const [cropStatusRecords, setCropStatusRecords] = useState([]);
  const [loadingCropStatus, setLoadingCropStatus] = useState(false);
  const [expandedCropStatus, setExpandedCropStatus] = useState({});
  const [showEditCropStatus, setShowEditCropStatus] = useState(false);
  const [showDeleteCropStatusAlert, setShowDeleteCropStatusAlert] = useState(false);
  const [selectedCropStatusRecord, setSelectedCropStatusRecord] = useState(null);
  const [showCropStatusUpdateSuccess, setShowCropStatusUpdateSuccess] = useState(false);
  const [showDeleteCropStatusLoading, setShowDeleteCropStatusLoading] = useState(false);
  const [showDeleteCropStatusSuccess, setShowDeleteCropStatusSuccess] = useState(false);
  const [showAddCropStatusSuccess, setShowAddCropStatusSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [farmPlots, setFarmPlots] = useState([]);
  const [loadingFarmPlots, setLoadingFarmPlots] = useState(false);

  // Refs for file inputs
  const farmPlotFileInputRef = useRef(null);
  const seedlingFileInputRef = useRef(null);
  
  // Update local state when selectedBeneficiary prop changes
  useEffect(() => {
    if (selectedBeneficiary) {
      setCurrentBeneficiary(selectedBeneficiary);
      fetchSeedlingRecords(selectedBeneficiary.beneficiaryId);
      fetchCropStatusRecords(selectedBeneficiary.beneficiaryId);
      fetchFarmPlots(selectedBeneficiary.beneficiaryId);
    }
  }, [selectedBeneficiary]);
  
  // Fetch seedling records for the current beneficiary
  const fetchSeedlingRecords = async (beneficiaryId) => {
    if (!beneficiaryId) return;
    
    try {
      setLoadingSeedlings(true);
      const allSeedlings = await seedlingsAPI.getAll();
      const beneficiarySeedlings = allSeedlings.filter(
        record => record.beneficiaryId === beneficiaryId
      );
      // Sort by ID in ascending order (oldest first, newest last)
      beneficiarySeedlings.sort((a, b) => a.id - b.id);
      setSeedlingRecords(beneficiarySeedlings);
    } catch (error) {
      console.error('Error fetching seedling records:', error);
      setSeedlingRecords([]);
    } finally {
      setLoadingSeedlings(false);
    }
  };
  
  // Fetch crop status records for the current beneficiary
  const fetchCropStatusRecords = async (beneficiaryId) => {
    if (!beneficiaryId) return;
    
    try {
      setLoadingCropStatus(true);
      const allCropStatus = await cropStatusAPI.getAll();
      const beneficiaryCropStatus = allCropStatus.filter(
        record => record.beneficiaryId === beneficiaryId
      );
      // Sort by ID in ascending order (oldest first, newest last)
      beneficiaryCropStatus.sort((a, b) => a.id - b.id);
      setCropStatusRecords(beneficiaryCropStatus);
    } catch (error) {
      console.error('Error fetching crop status records:', error);
      setCropStatusRecords([]);
    } finally {
      setLoadingCropStatus(false);
    }
  };
  
  // Fetch farm plots for the current beneficiary
  const fetchFarmPlots = async (beneficiaryId) => {
    if (!beneficiaryId) return;
    
    try {
      setLoadingFarmPlots(true);
      const allFarmPlots = await farmPlotsAPI.getAll();
      const beneficiaryFarmPlots = allFarmPlots.filter(
        plot => plot.beneficiaryId === beneficiaryId
      );
      setFarmPlots(beneficiaryFarmPlots);
    } catch (error) {
      console.error('Error fetching farm plots:', error);
      setFarmPlots([]);
    } finally {
      setLoadingFarmPlots(false);
    }
  };
  
  // Fetch latest beneficiary data
  const refreshBeneficiaryData = async () => {
    if (!currentBeneficiary?.id) return;
    
    try {
      setIsRefreshing(true);
      const updatedData = await beneficiariesAPI.getById(currentBeneficiary.id);
      setCurrentBeneficiary(updatedData);
      // Also refresh seedling, crop status, and farm plot records
      await fetchSeedlingRecords(updatedData.beneficiaryId);
      await fetchCropStatusRecords(updatedData.beneficiaryId);
      await fetchFarmPlots(updatedData.beneficiaryId);
    } catch (error) {
      console.error('Error refreshing beneficiary data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  if (!currentBeneficiary) return null;

  const beneficiaries = [currentBeneficiary];

  const handleDeleteBeneficiary = async () => {
    try {
      // Close the confirmation modal
      setShowDeleteAlert(false);
      
      // Show loading indicator
      setShowDeleteLoading(true);
      
      // Call the API to delete the beneficiary
      await beneficiariesAPI.delete(currentBeneficiary.id);
      
      // Hide loading indicator after 1.5 seconds
      setTimeout(() => {
        setShowDeleteLoading(false);
        
        // Show success message
        setShowDeleteSuccess(true);
      }, 1500);
    } catch (error) {
      console.error('Error deleting beneficiary:', error);
      // Hide loading indicator
      setShowDeleteLoading(false);
      // Show error message to user
      alert('Failed to delete beneficiary: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDeleteSuccessClose = () => {
    setShowDeleteSuccess(false);
    // Close the detail container
    onClose();
    // Refresh the beneficiary list in the parent component
    window.dispatchEvent(new CustomEvent('beneficiaryDeleted'));
  };

  // Handle file import for farm plots
  const handleFarmPlotImport = () => {
    farmPlotFileInputRef.current?.click();
  };

  // Handle file import for seedlings
  const handleSeedlingImport = () => {
    seedlingFileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      // Show success message
      setImportType(type);
      setShowImportSuccess(true);
      
      // Reset file input
      event.target.value = '';
    }
  };

  const handleImportSuccessClose = () => {
    setShowImportSuccess(false);
    // In a real implementation, you would process the file here
    console.log(`File imported for ${importType}`);
  };

  // Handle seedling record added
  const handleSeedlingAdded = async () => {
    await fetchSeedlingRecords(currentBeneficiary.beneficiaryId);
    // Show success modal
    setShowAddSeedlingSuccess(true);
  };
  
  // Toggle record expansion
  const toggleRecordExpansion = (index) => {
    setExpandedRecords(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  // Handle edit seedling record
  const handleEditSeedlingClick = (record, e) => {
    e.stopPropagation();
    setSelectedSeedlingRecord(record);
    setShowEditSeedling(true);
  };
  
  // Handle delete seedling record
  const handleDeleteSeedlingClick = (record, e) => {
    e.stopPropagation();
    setSelectedSeedlingRecord(record);
    setShowDeleteSeedlingAlert(true);
  };
  
  // Confirm delete seedling record
  const handleDeleteSeedlingConfirm = async () => {
    try {
      setShowDeleteSeedlingAlert(false);
      // Show loading indicator
      setShowDeleteSeedlingLoading(true);
      
      await seedlingsAPI.delete(selectedSeedlingRecord.id);
      
      // Hide loading indicator and show success
      setTimeout(() => {
        setShowDeleteSeedlingLoading(false);
        setShowDeleteSeedlingSuccess(true);
        
        // Hide success modal after 1.5 seconds and refresh records
        setTimeout(() => {
          setShowDeleteSeedlingSuccess(false);
          fetchSeedlingRecords(currentBeneficiary.beneficiaryId);
          setSelectedSeedlingRecord(null);
        }, 1500);
      }, 1500);
    } catch (error) {
      console.error('Error deleting seedling record:', error);
      setShowDeleteSeedlingLoading(false);
      alert('Failed to delete seedling record: ' + (error.message || 'Unknown error'));
    }
  };
  
  // Handle seedling record updated
  const handleSeedlingUpdated = async () => {
    await fetchSeedlingRecords(currentBeneficiary.beneficiaryId);
    setShowEditSeedling(false);
    setSelectedSeedlingRecord(null);
    // Show success modal
    setShowSeedlingUpdateSuccess(true);
  };
  
  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Format date range for planting dates
  const formatDateRange = (start, end) => {
    if (!start) return 'N/A';
    const startDate = new Date(start);
    if (!end) return formatDate(start);
    const endDate = new Date(end);
    
    // Same month and year
    if (startDate.getFullYear() === endDate.getFullYear() && startDate.getMonth() === endDate.getMonth()) {
      const month = startDate.toLocaleDateString('en-US', { month: 'short' });
      return `${month} ${startDate.getDate()}-${endDate.getDate()}, ${startDate.getFullYear()}`;
    }
    // Different month or year
    return `${formatDate(start)} - ${formatDate(end)}`;
  };
  
  // Resolve image URL for crop status pictures
  const resolveImageUrl = (pic) => {
    if (!pic) return '';
    if (typeof pic === 'string' && pic.startsWith('http')) return pic;
    // Handle filenames from database
    if (typeof pic === 'string' && !pic.startsWith('http') && !pic.startsWith('/')) {
      return `http://localhost:5000/uploads/${pic}`;
    }
    if (typeof pic === 'string') return `http://localhost:5000${pic.startsWith('/') ? pic : '/' + pic}`;
    return '';
  };
  
  // Toggle crop status record expansion
  const toggleCropStatusExpansion = (index) => {
    setExpandedCropStatus(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  // Handle edit crop status record
  const handleEditCropStatusClick = (record, e) => {
    e.stopPropagation();
    // Close any success modals before opening edit modal
    setShowCropStatusUpdateSuccess(false);
    setShowAddCropStatusSuccess(false);
    setSelectedCropStatusRecord(record);
    setShowEditCropStatus(true);
  };
  
  // Handle delete crop status record
  const handleDeleteCropStatusClick = (record, e) => {
    e.stopPropagation();
    setSelectedCropStatusRecord(record);
    setShowDeleteCropStatusAlert(true);
  };
  
  // Confirm delete crop status record
  const handleDeleteCropStatusConfirm = async () => {
    try {
      setShowDeleteCropStatusAlert(false);
      // Show loading indicator
      setShowDeleteCropStatusLoading(true);
      
      await cropStatusAPI.delete(selectedCropStatusRecord.id);
      
      // Hide loading indicator and show success
      setTimeout(() => {
        setShowDeleteCropStatusLoading(false);
        setShowDeleteCropStatusSuccess(true);
        
        // Hide success modal after 1.5 seconds and refresh records
        setTimeout(() => {
          setShowDeleteCropStatusSuccess(false);
          fetchCropStatusRecords(currentBeneficiary.beneficiaryId);
          setSelectedCropStatusRecord(null);
        }, 1500);
      }, 1500);
    } catch (error) {
      console.error('Error deleting crop status record:', error);
      setShowDeleteCropStatusLoading(false);
      alert('Failed to delete crop status record: ' + (error.message || 'Unknown error'));
    }
  };
  
  // Handle crop status record updated
  const handleCropStatusUpdated = async (data) => {
    await cropStatusAPI.update(data.id, data);
    await fetchCropStatusRecords(currentBeneficiary.beneficiaryId);
    setShowEditCropStatus(false);
    setSelectedCropStatusRecord(null);
    // Show success modal (it will auto-close after delay)
    setShowCropStatusUpdateSuccess(true);
    // Auto-hide success modal after delay
    setTimeout(() => {
      setShowCropStatusUpdateSuccess(false);
    }, 1500);
  };
  
  // Handle crop status record added
  const handleCropStatusAdded = async () => {
    await fetchCropStatusRecords(currentBeneficiary.beneficiaryId);
    // Show success modal (it will auto-close after delay)
    setShowAddCropStatusSuccess(true);
    // Auto-hide success modal after delay
    setTimeout(() => {
      setShowAddCropStatusSuccess(false);
    }, 1500);
  };

  // Handle edit beneficiary
  const handleEditBeneficiary = async (updateData) => {
    try {
      await beneficiariesAPI.update(currentBeneficiary.id, updateData);
      
      // Refresh the current beneficiary data to show updated information
      await refreshBeneficiaryData();
      
      // Refresh the beneficiary list in the parent component
      window.dispatchEvent(new CustomEvent('beneficiaryDeleted'));
      
      // Don't close here - let the success modal in EditBeneficiaryModal handle it
      // The modal will close itself after showing the success message
    } catch (error) {
      console.error('Error updating beneficiary:', error);
      throw error;
    }
  };
  
  // Handle image click to open modal
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };
  
  // Handle close image modal
  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  return (
    <>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--white)',
          border: '1px solid var(--dark-green)',
          borderRadius: '5px',
          position: 'relative',
          overflowY: 'hidden',
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '1rem',
          borderBottom: '1px solid #e9ecef',
          position: 'sticky',
          top: 0,
          backgroundColor: 'var(--white)',
          zIndex: 10,
        }}>
          <h3 style={{
            fontSize: '0.85rem',
            fontWeight: '700',
            color: 'var(--dark-green)',
            margin: 0
          }}>
            Beneficiary Information
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.8rem',
              color: 'var(--dark-green)',
              cursor: 'pointer',
              padding: '0',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ 
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          flex: 1,
          padding: '2rem 1rem' 
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
                {currentBeneficiary.picture ? (
                  <img
                    src={currentBeneficiary.picture}
                    alt={`${currentBeneficiary.firstName} ${currentBeneficiary.lastName}`}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      border: '3px solid white',
                      objectFit: 'cover',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  style={{
                    display: currentBeneficiary.picture ? 'none' : 'flex',
                    justifyContent: 'center',
                    paddingTop: '1rem',
                    alignItems: 'center',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    border: '1px solid white',
                    backgroundColor: '#f1f3f5',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}
                >
                  <FaUserCircle size={70} />
                </div>
              </div>

            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '0.75rem', fontWeight: '600', color: '#2c3e50', margin: '0 0 0.3rem 0' }}>
                {`${currentBeneficiary.firstName} ${currentBeneficiary.middleName || ''} ${currentBeneficiary.lastName}`}
              </h2>
              <p style={{ fontSize: '0.65rem', color: '#6c757d', margin: '0 0 0.8rem 0' }}>
                {currentBeneficiary.beneficiaryId || 'Registered Beneficiary'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.7rem' }}>
                <ActionButton
                  icon={<CiEdit size={10} />}
                  onClick={() => setShowEditBeneficiary(true)}
                  size="small"
                  style={{
                    backgroundColor: 'white',
                    color: 'var(--dark-green)',
                    borderColor: 'var(--dark-green)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    fontSize: '0.6rem',
                    padding: '0.2rem 1rem',
                  }}
                >
                  Edit
                </ActionButton>
                <ActionButton
                  icon={<PiTrashLight size={10} />}
                  onClick={() => setShowDeleteAlert(true)}
                  size="small"
                  style={{
                    backgroundColor: 'white',
                    color: '#dc3545',
                    borderColor: '#dc3545',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    fontSize: '0.6rem',
                    padding: '0.2rem 1rem',
                  }}
                >
                  Delete
                </ActionButton>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ 
              fontSize: '0.8rem', 
              fontWeight: '600', 
              color: '#2c5530', 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              <FaUserCircle size={14} />
              <span>Personal Information</span>
            </div>
            <div style={{ marginLeft: '1.5rem' }}>
              <InfoRow label="Gender" value={currentBeneficiary.gender} />
              <InfoRow label="Marital Status" value={currentBeneficiary.maritalStatus} />
              <InfoRow
                label="Birth Date"
                value={
                  currentBeneficiary.birthDate
                    ? (() => {
                        // Parse date string directly without timezone conversion
                        const dateStr = currentBeneficiary.birthDate.split('T')[0];
                        const [year, month, day] = dateStr.split('-');
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
                      })()
                    : '-'
                }
              />
              <InfoRow label="Age" value={currentBeneficiary.age ? `${currentBeneficiary.age} years old` : '-'} />
              <InfoRow label="Cellphone Num." value={currentBeneficiary.cellphone} />
              <InfoRow
                label="Address"
                value={(() => {
                  const addressParts = [
                    currentBeneficiary.purok,
                    currentBeneficiary.barangay,
                    currentBeneficiary.municipality,
                    currentBeneficiary.province
                  ].filter(part => part && part.trim() !== '' && part.toLowerCase() !== 'unknown');
                  
                  return addressParts.length > 0 ? addressParts.join(', ') : '-';
                })()}
              />
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#e9ecef', margin: '1rem 0' }} />

          <div style={{ marginBottom: '1rem', minHeight: '200px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#2c5530',
                fontWeight: '600',
                fontSize: '0.8rem',
                marginBottom: '0.6rem',
              }}
            >
              <LuLandPlot size={14} />
              <span>Farm Plots</span>
            </div>
            {loadingFarmPlots ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '0.8rem',
                  color: '#6c757d',
                  fontSize: '0.65rem',
                }}
              >
                <p style={{ margin: 0 }}>Loading farm plots...</p>
              </div>
            ) : farmPlots.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '0.8rem',
                  color: '#6c757d',
                  fontSize: '0.65rem',
                  marginTop: '1.5rem',
                }}
              >
                <LuLandPlot size={20} color="#adb5bd" />
                <p style={{ margin: 0 }}>No farm plots available</p>
              </div>
            ) : (
              <div style={{ marginLeft: '0.8rem' }}>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    padding: '0.5rem',
                  }}
                >
                  {farmPlots.map((plot, index) => (
                    <div
                      key={plot.id || index}
                      onClick={() => {
                        // Store the selected plot data in sessionStorage
                        sessionStorage.setItem('selectedPlotId', plot.id || plot.plotId);
                        // Navigate to farm monitoring page
                        navigate('/farm-monitoring', { state: { selectedPlot: plot } });
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.4rem',
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          width: '80px',
                          height: '80px',
                          backgroundColor: '#f8fdf8',
                          border: '2px solid #e8f5e8',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#2c5530',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#e8f5e8';
                          e.currentTarget.style.border = '2px solid #2c5530';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8fdf8';
                          e.currentTarget.style.border = '2px solid #e8f5e8';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <LuLandPlot size={32} />
                      </div>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: '600',
                          color: '#2c5530',
                          textAlign: 'center',
                        }}
                      >
                        {plot.plotId || plot.id || `Plot ${index + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ height: '1px', backgroundColor: '#e9ecef', margin: '1rem 0' }} />

          <div style={{ marginBottom: '1rem', minHeight: '200px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.6rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#2c5530',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                }}
              >
                <GiSeedling size={14} />
                <span>Coffee Seedling Records</span>
              </div>
              <button
                onClick={() => setShowAddSeedling(true)}
                style={{
                  padding: '0.35rem 0.5rem',
                  backgroundColor: 'var(--dark-green)',
                  color: 'white',
                  border: '1px solid var(--dark-green)',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '0.6rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <RiAddLargeFill size={8} />
                <span>Add Seedling Record</span>
              </button>
            </div>
            {loadingSeedlings ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '0.8rem',
                  color: '#6c757d',
                  fontSize: '0.65rem',
                }}
              >
                <p style={{ margin: 0 }}>Loading seedling records...</p>
              </div>
            ) : seedlingRecords.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '0.8rem',
                  color: '#6c757d',
                  fontSize: '0.65rem',
                  marginTop: '2rem',
                }}
              >
                <GiSeedling size={20} color="#adb5bd" />
                <p style={{ marginBottom: '0' }}>No seedling records available</p>
              </div>
            ) : (
              <div style={{ marginLeft: '1.5rem', marginRight: '1rem' }}>
                {seedlingRecords.map((record, index) => (
                  <div
                    key={record.id || index}
                    style={{
                      backgroundColor: index % 2 === 0 ? '#f8fdf8' : 'white',
                      padding: '0.5rem 0.8rem',
                      borderRadius: '4px',
                      marginBottom: '0.6rem',
                      border: '1px solid #e8f5e8',
                    }}
                  >
                    <div 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        cursor: 'pointer',
                        marginBottom: '0.4rem'
                      }}
                      onClick={() => toggleRecordExpansion(index)}
                    >
                      <div style={{ color: '#2c5530', fontSize: '0.7rem', fontWeight: '600' }}>
                        Record #{index + 1}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {expandedRecords[index] ? (
                          <IoIosArrowUp size={16} color="#2c5530" />
                        ) : (
                          <IoIosArrowDown size={16} color="#2c5530" />
                        )}
                      </div>
                    </div>
                    <div style={{ height: '1px', backgroundColor: '#e8f5e8', marginBottom: expandedRecords[index] ? '0.6rem' : '0' }} />
                    {expandedRecords[index] && (
                      <>
                        <div style={{ fontSize: '0.4rem', color: '#495057', lineHeight: '1', marginLeft: '1rem', marginBottom: '0.6rem' }}>
                          <InfoRow label="Received" value={record.received ? record.received.toLocaleString() : '-'} />
                          <InfoRow label="Date Received" value={formatDate(record.dateReceived)} />
                          <InfoRow label="Planted" value={record.planted ? record.planted.toLocaleString() : '-'} />
                          <InfoRow label="Plot ID" value={record.plotId || '-'} />
                          <InfoRow label="Planting Start" value={formatDate(record.dateOfPlantingStart)} />
                          <InfoRow label="Planting End" value={formatDate(record.dateOfPlantingEnd)} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.4rem' }}>
                          <button
                            onClick={(e) => handleEditSeedlingClick(record, e)}
                            style={{
                              background: 'white',
                              border: '1px solid var(--dark-green)',
                              color: 'var(--dark-green)',
                              cursor: 'pointer',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '3px',
                              fontSize: '0.6rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}
                          >
                            <CiEdit size={10} />
                            Edit
                          </button>
                          <button
                            onClick={(e) => handleDeleteSeedlingClick(record, e)}
                            style={{
                              background: 'white',
                              border: '1px solid #dc3545',
                              color: '#dc3545',
                              cursor: 'pointer',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '3px',
                              fontSize: '0.6rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}
                          >
                            <PiTrashLight size={10} />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ height: '1px', backgroundColor: '#e9ecef', margin: '1rem 0' }} />

          <div style={{ marginBottom: '1rem', minHeight: '200px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.6rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#2c5530',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                }}
              >
                <MdOutlineAssignment size={14} />
                <span>Crop Survey Status</span>
              </div>
              <button
                onClick={() => {
                  // Close any success modals before opening add modal
                  setShowCropStatusUpdateSuccess(false);
                  setShowAddCropStatusSuccess(false);
                  setShowAddCropStatus(true);
                }}
                style={{
                  padding: '0.35rem 0.5rem',
                  backgroundColor: 'var(--dark-green)',
                  color: 'white',
                  border: '1px solid var(--dark-green)',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '0.6rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <RiAddLargeFill size={8} />
                <span>Add Survey Record</span>
              </button>
            </div>
            {loadingCropStatus ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '0.8rem',
                  color: '#6c757d',
                  fontSize: '0.65rem',
                }}
              >
                <p style={{ margin: 0 }}>Loading crop survey records...</p>
              </div>
            ) : cropStatusRecords.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '0.8rem',
                  color: '#6c757d',
                  fontSize: '0.65rem',
                  marginTop: '2rem',
                }}
              >
                <MdOutlineAssignment size={20} color="#adb5bd" />
                <p style={{ marginBottom: '0' }}>No crop survey data available</p>
              </div>
            ) : (
              <div style={{ marginLeft: '1rem', marginRight: '0.8rem' }}>
                {cropStatusRecords.map((record, index) => (
                  <div
                    key={record.id || index}
                    style={{
                      backgroundColor: index % 2 === 0 ? '#f8fdf8' : 'white',
                      padding: '0.5rem 0.8rem',
                      borderRadius: '4px',
                      marginBottom: '0.6rem',
                      border: '1px solid #e8f5e8',
                    }}
                  >
                    <div 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        cursor: 'pointer',
                        marginBottom: '0.4rem'
                      }}
                      onClick={() => toggleCropStatusExpansion(index)}
                    >
                      <div style={{ color: '#2c5530', fontSize: '0.7rem', fontWeight: '600' }}>
                        Record #{index + 1}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {expandedCropStatus[index] ? (
                          <IoIosArrowUp size={16} color="#2c5530" />
                        ) : (
                          <IoIosArrowDown size={16} color="#2c5530" />
                        )}
                      </div>
                    </div>
                    <div style={{ height: '1px', backgroundColor: '#e8f5e8', marginBottom: expandedCropStatus[index] ? '0.6rem' : '0' }} />
                    {expandedCropStatus[index] && (
                      <>
                        <div style={{ fontSize: '0.4rem', color: '#495057', lineHeight: '1', marginLeft: '1rem', marginBottom: '0.6rem' }}>
                          <InfoRow label="Survey Date" value={formatDate(record.surveyDate)} />
                          <InfoRow label="Surveyer" value={record.surveyer || '-'} />
                          <InfoRow label="Alive Crops" value={record.aliveCrops ? record.aliveCrops.toLocaleString() : '-'} />
                          <InfoRow label="Dead Crops" value={record.deadCrops !== undefined ? record.deadCrops.toLocaleString() : '-'} />
                          <InfoRow label="Plot" value={record.plot || '-'} />
                          
                          {/* Pictures Section */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.6rem' }}>
                            <div style={{ color: '#6c757d', fontSize: '0.7rem', fontWeight: 500, minWidth: '100px' }}>
                              Pictures:
                            </div>
                            <div style={{ flex: 1 }}>
                              {record.pictures && Array.isArray(record.pictures) && record.pictures.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                  {record.pictures.map((pic, picIndex) => (
                                    <img
                                      key={picIndex}
                                      src={resolveImageUrl(pic)}
                                      alt={`Survey photo ${picIndex + 1}`}
                                      style={{
                                        width: '70px',
                                        height: '70px',
                                        objectFit: 'cover',
                                        borderRadius: '4px',
                                        border: '1px solid #e0e0e0',
                                        cursor: 'pointer'
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleImageClick(resolveImageUrl(pic));
                                      }}
                                      onError={(e) => {
                                        console.error('Failed to load image:', pic);
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <div style={{ color: '#495057', fontSize: '0.7rem', fontWeight: 500 }}>No photos</div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.4rem' }}>
                          <button
                            onClick={(e) => handleEditCropStatusClick(record, e)}
                            style={{
                              background: 'white',
                              border: '1px solid var(--dark-green)',
                              color: 'var(--dark-green)',
                              cursor: 'pointer',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '3px',
                              fontSize: '0.6rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}
                          >
                            <CiEdit size={10} />
                            Edit
                          </button>
                          <button
                            onClick={(e) => handleDeleteCropStatusClick(record, e)}
                            style={{
                              background: 'white',
                              border: '1px solid #dc3545',
                              color: '#dc3545',
                              cursor: 'pointer',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '3px',
                              fontSize: '0.6rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}
                          >
                            <PiTrashLight size={10} />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={farmPlotFileInputRef}
        style={{ display: 'none' }}
        onChange={(e) => handleFileChange(e, 'farm plots')}
        accept=".csv,.xlsx,.xls,.json"
      />
      <input
        type="file"
        ref={seedlingFileInputRef}
        style={{ display: 'none' }}
        onChange={(e) => handleFileChange(e, 'seedling records')}
        accept=".csv,.xlsx,.xls,.json"
      />

      <AddFarmPlotModal
        isOpen={showAddFarmPlot}
        onClose={() => setShowAddFarmPlot(false)}
        onSubmit={async (data) => {
          console.log('Farm plot data:', data);
          setShowAddFarmPlot(false);
        }}
        beneficiaries={beneficiaries}
      />
      <AddSeedlingRecordModal
        isOpen={showAddSeedling}
        onClose={() => setShowAddSeedling(false)}
        onSubmit={async (data) => {
          try {
            await seedlingsAPI.create(data);
            await handleSeedlingAdded();
            setShowAddSeedling(false);
          } catch (error) {
            console.error('Error adding seedling record:', error);
            throw error;
          }
        }}
        selectedBeneficiary={currentBeneficiary}
      />
      <EditSeedlingRecordModal
        isOpen={showEditSeedling}
        onClose={() => {
          setShowEditSeedling(false);
          setSelectedSeedlingRecord(null);
        }}
        onSubmit={async (data) => {
          try {
            await seedlingsAPI.update(data.id, data);
            await handleSeedlingUpdated();
          } catch (error) {
            console.error('Error updating seedling record:', error);
            throw error;
          }
        }}
        record={selectedSeedlingRecord}
      />
      <AddSurveyStatusModal
        isOpen={showAddCropStatus}
        onClose={() => setShowAddCropStatus(false)}
        onSubmit={async (data) => {
          // Refresh crop status records after successful save
          await handleCropStatusAdded();
          setShowAddCropStatus(false);
        }}
        record={null}
        isEdit={false}
        selectedBeneficiary={currentBeneficiary}
      />
      <EditCropStatusModal
        isOpen={showEditCropStatus}
        onClose={() => {
          setShowEditCropStatus(false);
          setSelectedCropStatusRecord(null);
        }}
        onSubmit={async (data) => {
          try {
            await handleCropStatusUpdated(data);
          } catch (error) {
            console.error('Error updating crop status record:', error);
            throw error;
          }
        }}
        record={selectedCropStatusRecord}
      />
      {/* Delete Crop Status Record Alert */}
      <AlertModal
        isOpen={showDeleteCropStatusAlert}
        onClose={() => {
          setShowDeleteCropStatusAlert(false);
          setSelectedCropStatusRecord(null);
        }}
        type="delete"
        title="Confirm Deletion"
        message="Are you sure you want to delete this crop survey status record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        showCancel={true}
        onConfirm={handleDeleteCropStatusConfirm}
        onCancel={() => {
          setShowDeleteCropStatusAlert(false);
          setSelectedCropStatusRecord(null);
        }}
      />
      <EditBeneficiaryModal
        isOpen={showEditBeneficiary}
        onClose={() => setShowEditBeneficiary(false)}
        onSubmit={handleEditBeneficiary}
        beneficiary={currentBeneficiary}
      />
      <AlertModal
        isOpen={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        type="delete"
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${currentBeneficiary.firstName} ${currentBeneficiary.lastName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        showCancel={true}
        onConfirm={handleDeleteBeneficiary}
        onCancel={() => setShowDeleteAlert(false)}
      />
      
      {/* Delete Seedling Record Alert */}
      <AlertModal
        isOpen={showDeleteSeedlingAlert}
        onClose={() => {
          setShowDeleteSeedlingAlert(false);
          setSelectedSeedlingRecord(null);
        }}
        type="delete"
        title="Confirm Deletion"
        message="Are you sure you want to delete this seedling record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        showCancel={true}
        onConfirm={handleDeleteSeedlingConfirm}
        onCancel={() => {
          setShowDeleteSeedlingAlert(false);
          setSelectedSeedlingRecord(null);
        }}
      />
      
      {/* Delete Loading Modal */}
      <LoadingModal
        isOpen={showDeleteLoading}
        title="Deleting..."
        message="Deleting beneficiary data... Please wait."
      />
      
      {/* Delete Success Modal */}
      <AlertModal
        isOpen={showDeleteSuccess}
        onClose={handleDeleteSuccessClose}
        type="success"
        title="Success"
        message="Beneficiary Deleted Successfully!"
        autoClose={true}
        autoCloseDelay={1500}
        hideButton={true}
      />
      
      {/* Import Success Modal */}
      <AlertModal
        isOpen={showImportSuccess}
        onClose={handleImportSuccessClose}
        type="success"
        title="Import Successful"
        message={`File imported successfully for ${importType}!`}
        confirmText="OK"
        showCancel={false}
        onConfirm={handleImportSuccessClose}
        autoClose={true}
        autoCloseDelay={1500}
      />
      
      {/* Seedling Update Success Modal */}
      <AlertModal
        isOpen={showSeedlingUpdateSuccess}
        onClose={() => setShowSeedlingUpdateSuccess(false)}
        type="success"
        title="Success"
        message="Seedling Record Updated Successfully!"
        autoClose={true}
        autoCloseDelay={1500}
        hideButton={true}
      />
      
      {/* Delete Seedling Loading Modal */}
      <LoadingModal
        isOpen={showDeleteSeedlingLoading}
        title="Deleting..."
        message="Deleting seedling record... Please wait."
      />

      {/* Delete Seedling Success Modal */}
      <AlertModal
        isOpen={showDeleteSeedlingSuccess}
        onClose={() => setShowDeleteSeedlingSuccess(false)}
        type="success"
        title="Success"
        message="Seedling Record Deleted Successfully!"
        autoClose={true}
        autoCloseDelay={1500}
        hideButton={true}
      />
      
      {/* Add Seedling Success Modal */}
      <AlertModal
        isOpen={showAddSeedlingSuccess}
        onClose={() => setShowAddSeedlingSuccess(false)}
        type="success"
        title="Success"
        message="Seedling Record Added Successfully!"
        autoClose={true}
        autoCloseDelay={1500}
        hideButton={true}
      />
      
      {/* Crop Status Update Success Modal */}
      <AlertModal
        isOpen={showCropStatusUpdateSuccess}
        onClose={() => setShowCropStatusUpdateSuccess(false)}
        type="success"
        title="Success"
        message="Crop Status Record Updated Successfully!"
        autoClose={true}
        autoCloseDelay={1500}
        hideButton={true}
      />
      
      {/* Delete Crop Status Loading Modal */}
      <LoadingModal
        isOpen={showDeleteCropStatusLoading}
        title="Deleting..."
        message="Deleting crop status record... Please wait."
      />

      {/* Delete Crop Status Success Modal */}
      <AlertModal
        isOpen={showDeleteCropStatusSuccess}
        onClose={() => setShowDeleteCropStatusSuccess(false)}
        type="success"
        title="Success"
        message="Crop Status Record Deleted Successfully!"
        autoClose={true}
        autoCloseDelay={1500}
        hideButton={true}
      />
      
      {/* Add Crop Status Success Modal */}
      <AlertModal
        isOpen={showAddCropStatusSuccess}
        onClose={() => setShowAddCropStatusSuccess(false)}
        type="success"
        title="Success"
        message="Crop Status Record Added Successfully!"
        autoClose={true}
        autoCloseDelay={1500}
        hideButton={true}
      />
      
      {/* Image Viewer Modal */}
      {showImageModal && selectedImage && (
        <div
          onClick={handleCloseImageModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '2rem'
          }}
        >
          {/* Close button */}
          <button
            onClick={handleCloseImageModal}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#333',
              fontWeight: 'bold',
              zIndex: 10000,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ×
          </button>
          
          {/* Image */}
          <img
            src={selectedImage}
            alt="Full size preview"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
            }}
          />
        </div>
      )}
    </>
  );
};

export default DetailContainer;