import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaUsersSlash } from "react-icons/fa";
import { MdOutlineSearch } from "react-icons/md";
import { IoCloseCircle } from "react-icons/io5";

import { RiAddLargeFill } from 'react-icons/ri';
import { CiImport, CiExport } from "react-icons/ci";
import { IoChevronDown } from "react-icons/io5";
import { FaFilePdf, FaFileExcel } from "react-icons/fa6";
import AddRecord from './AddBeneficiaryModal';
import NoDataDisplay from '../../ui/NoDataDisplay';
import Pagination from '../../ui/Pagination';
import DetailContainer from './DetailContainer';
import { ActionButton } from '../../ui/BeneficiaryButtons';
import LoadingModal from '../../ui/LoadingModal';

import ExcelEditorPage from './ExcelEditorPage';
import { beneficiariesAPI, seedlingsAPI, importAPI, cropStatusAPI } from '../../../services/api';

const Coffee_Beneficiaries = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seedlingData, setSeedlingData] = useState({});
  const [seedlings, setSeedlings] = useState([]);
  const [cropStatusRecords, setCropStatusRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(13);
  const [selectedTableFilters, setSelectedTableFilters] = useState(null);
  const [showEditorPage, setShowEditorPage] = useState(false);
  const [cleanedData, setCleanedData] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState('');
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const fileInputRef = React.createRef();

  useEffect(() => {
    fetchBeneficiaries();
    fetchCropStatusRecords();
  }, []);

  useEffect(() => {
    const handleBeneficiaryDeleted = () => {
      fetchBeneficiaries();
    };

    window.addEventListener('beneficiaryDeleted', handleBeneficiaryDeleted);
    
    return () => {
      window.removeEventListener('beneficiaryDeleted', handleBeneficiaryDeleted);
    };
  }, []);

  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      const data = await beneficiariesAPI.getAll();
      
      // Fetch seedling data for all beneficiaries
      const seedlingsResponse = await seedlingsAPI.getAll();
      
      // Process seedling data to get total received per beneficiary
      const seedlingTotals = {};
      seedlingsResponse.forEach(seedling => {
        if (seedling.beneficiaryId) {
          if (!seedlingTotals[seedling.beneficiaryId]) {
            seedlingTotals[seedling.beneficiaryId] = 0;
          }
          seedlingTotals[seedling.beneficiaryId] += parseInt(seedling.received) || 0;
        }
      });
      
      setSeedlingData(seedlingTotals);
      setSeedlings(seedlingsResponse || []);
      setBeneficiaries(data || []);
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      setBeneficiaries([]);
      setSeedlings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCropStatusRecords = async () => {
    try {
      const cropStatusData = await cropStatusAPI.getAll();
      setCropStatusRecords(cropStatusData || []);
    } catch (error) {
      console.error('Error fetching crop status records:', error);
      setCropStatusRecords([]);
    }
  };

  const handleAddRecord = async () => {
    await fetchBeneficiaries();
    setShowAddRecord(false);
  };

  const handleImportClick = () => {
    // Trigger file input click
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/)) {
      alert('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    setUploading(true);
    setUploadStage('uploading');
    
    try {
      // Simulate uploading stage (can be removed if instant)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Change to cleansing stage
      setUploadStage('cleansing');
      
      // Upload file and get cleaned data
      const response = await importAPI.uploadAndClean(file);
      
      console.log('Import API response:', response);
      console.log('Preview data:', response.previewData);
      console.log('Errors:', response.errors);
      
      // Change to success stage
      setUploadStage('success');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set cleaned data and errors
      setCleanedData(response.previewData || []);
      setImportErrors(response.errors || []);
      
      console.log('cleanedData state set to:', response.previewData);
      console.log('importErrors state set to:', response.errors);
      
      // Close loading modal and show editor page
      setUploading(false);
      setUploadStage('');
      setShowEditorPage(true);
    } catch (error) {
      console.error('Import error:', error);
      setUploading(false);
      setUploadStage('');
      alert(error.message || 'Failed to process Excel file. Please try again.');
    } finally {
      // Reset file input
      event.target.value = '';
    }
  };

  const handleExcelSave = async (data) => {
    try {
      console.log('\n=== handleExcelSave called ===');
      console.log('Received data object:', data);
      console.log('Beneficiaries count:', data.beneficiaries?.length);
      console.log('Seedlings count:', data.seedlings?.length);
      console.log('Crop surveys count:', data.cropSurveys?.length);
      console.log('First seedling data:', data.seedlings?.[0]);
      
      // Prepare data for import (flatten the nested structure)
      const flattenedData = data.beneficiaries.map((beneficiary, index) => {
        const seedling = data.seedlings[index] || {};
        const cropSurvey = data.cropSurveys[index] || {};
        
        const flatRow = {
          ...beneficiary,
          // Add seedling data
          received: seedling.receivedSeedling || null,
          dateReceived: seedling.dateReceived || null,
          planted: seedling.plantedSeedling || null,
          plotId: seedling.plotId || null,
          plantingStartDate: seedling.plantingStartDate || null,
          plantingEndDate: seedling.plantingEndDate || null,
          // Add crop survey data
          surveyer: cropSurvey.surveyer || null,
          surveyDate: cropSurvey.surveyDate || null,
          aliveCrops: cropSurvey.aliveCrops || null,
          deadCrops: cropSurvey.deadCrops || null
        };
        
        // Log the first flattened row for debugging
        if (index === 0) {
          console.log('First flattened row:', flatRow);
          console.log('Seedling data in first row:', {
            received: flatRow.received,
            dateReceived: flatRow.dateReceived,
            planted: flatRow.planted,
            plotId: flatRow.plotId,
            plantingStartDate: flatRow.plantingStartDate,
            plantingEndDate: flatRow.plantingEndDate
          });
        }
        
        return flatRow;
      });

      console.log('Flattened data count:', flattenedData.length);
      console.log('Sending to backend...');
      
      // Send to backend for confirmation and import
      const result = await importAPI.confirmImport(flattenedData);
      
      console.log('Backend response:', result);
      
      // Refresh beneficiaries list
      await fetchBeneficiaries();
    } catch (error) {
      console.error('Save error:', error);
      throw error; // Re-throw error so ExcelEditorPage can handle it
    }
  };

  const handleExportClick = () => {
    setIsExportDropdownOpen(!isExportDropdownOpen);
  };

  const handleExportExcel = () => {
    let dataToExport = [];
    let filename = 'export.csv';
    let headers = [];

    if (selectedTableFilters === 'Coffee Seedling Record') {
      filename = 'seedling_records.csv';
      headers = ['Beneficiary ID', 'Full Name', 'Received', 'Date Received', 'Planted', 'Plot ID', 'Planting Start', 'Planting End'];
      dataToExport = filteredSeedlings.map(s => {
        const beneficiary = beneficiaries.find(b => b.beneficiaryId === s.beneficiaryId);
        const fullName = beneficiary 
          ? `${beneficiary.firstName} ${beneficiary.middleName || ''} ${beneficiary.lastName}`.trim()
          : '-';
        
        return [
          s.beneficiaryId || '',
          fullName,
          s.received || 0,
          s.dateReceived ? new Date(s.dateReceived).toLocaleDateString('en-US') : '',
          s.planted || 0,
          s.plotId || '',
          s.dateOfPlantingStart ? new Date(s.dateOfPlantingStart).toLocaleDateString('en-US') : '',
          s.dateOfPlantingEnd ? new Date(s.dateOfPlantingEnd).toLocaleDateString('en-US') : ''
        ];
      });
    } else if (selectedTableFilters === 'Crop Survey Status') {
      filename = 'crop_survey_status.csv';
      headers = ['Beneficiary ID', 'Full Name', 'Survey Date', 'Surveyer', 'Alive Crops', 'Dead Crops', 'Plot'];
      dataToExport = filteredCropStatus.map(cs => {
        const beneficiary = beneficiaries.find(b => b.beneficiaryId === cs.beneficiaryId);
        const fullName = beneficiary 
          ? `${beneficiary.firstName} ${beneficiary.middleName || ''} ${beneficiary.lastName}`.trim()
          : '-';
        
        return [
          cs.beneficiaryId || '',
          fullName,
          cs.surveyDate ? new Date(cs.surveyDate).toLocaleDateString('en-US') : '',
          cs.surveyer || '',
          cs.aliveCrops || 0,
          cs.deadCrops || 0,
          cs.plotId || ''
        ];
      });
    } else if (selectedTableFilters === 'Beneficiary List') {
      filename = 'beneficiary_list.csv';
      headers = ['ID', 'Full Name', 'Address', 'Gender', 'Birth Date', 'Age', 'Cellphone'];
      dataToExport = filteredBeneficiaries.map(b => {
        const addressParts = [
          b.purok,
          b.barangay,
          b.municipality,
          b.province
        ].filter(part => part && part.trim() !== '' && part.toLowerCase() !== 'unknown');
        
        return [
          b.beneficiaryId || '',
          `${b.firstName} ${b.middleName || ''} ${b.lastName}`.trim(),
          addressParts.join(', '),
          b.gender || '',
          b.birthDate ? new Date(b.birthDate).toLocaleDateString('en-US') : '',
          b.age || '',
          b.cellphone || ''
        ];
      });
    } else {
      // Default export (no filter selected)
      filename = 'beneficiaries.csv';
      headers = ['Beneficiary ID', 'Full Name', 'Address', 'Number of Farms', 'Total Seedling Received'];
      dataToExport = filteredBeneficiaries.map(b => {
        const addressParts = [
          b.purok,
          b.barangay,
          b.municipality,
          b.province
        ].filter(part => part && part.trim() !== '' && part.toLowerCase() !== 'unknown');
        
        return [
          b.beneficiaryId || '',
          `${b.firstName} ${b.middleName || ''} ${b.lastName}`.trim(),
          addressParts.join(', '),
          '-',
          seedlingData[b.beneficiaryId] || 0
        ];
      });
    }

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row => 
        row.map(cell => 
          typeof cell === 'string' && cell.includes(',') 
            ? `"${cell}"` 
            : cell
        ).join(',')
      )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportDropdownOpen(false);
  };

  const handleExportPDF = () => {
    let dataToExport = [];
    let title = '';
    let headers = [];

    if (selectedTableFilters === 'Coffee Seedling Record') {
      title = 'Coffee Seedling Records';
      headers = ['Beneficiary ID', 'Full Name', 'Received', 'Date Received', 'Planted', 'Plot ID', 'Planting Start', 'Planting End'];
      dataToExport = filteredSeedlings.map(s => {
        const beneficiary = beneficiaries.find(b => b.beneficiaryId === s.beneficiaryId);
        const fullName = beneficiary 
          ? `${beneficiary.firstName} ${beneficiary.middleName || ''} ${beneficiary.lastName}`.trim()
          : '-';
        
        return [
          s.beneficiaryId || '',
          fullName,
          s.received || 0,
          s.dateReceived ? new Date(s.dateReceived).toLocaleDateString('en-US') : '',
          s.planted || 0,
          s.plotId || '',
          s.dateOfPlantingStart ? new Date(s.dateOfPlantingStart).toLocaleDateString('en-US') : '',
          s.dateOfPlantingEnd ? new Date(s.dateOfPlantingEnd).toLocaleDateString('en-US') : ''
        ];
      });
    } else if (selectedTableFilters === 'Crop Survey Status') {
      title = 'Crop Survey Status';
      headers = ['Beneficiary ID', 'Full Name', 'Survey Date', 'Surveyer', 'Alive Crops', 'Dead Crops', 'Plot'];
      dataToExport = filteredCropStatus.map(cs => {
        const beneficiary = beneficiaries.find(b => b.beneficiaryId === cs.beneficiaryId);
        const fullName = beneficiary 
          ? `${beneficiary.firstName} ${beneficiary.middleName || ''} ${beneficiary.lastName}`.trim()
          : '-';
        
        return [
          cs.beneficiaryId || '',
          fullName,
          cs.surveyDate ? new Date(cs.surveyDate).toLocaleDateString('en-US') : '',
          cs.surveyer || '',
          cs.aliveCrops || 0,
          cs.deadCrops || 0,
          cs.plotId || ''
        ];
      });
    } else if (selectedTableFilters === 'Beneficiary List') {
      title = 'Beneficiary List';
      headers = ['ID', 'Full Name', 'Address', 'Gender', 'Birth Date', 'Age', 'Cellphone'];
      dataToExport = filteredBeneficiaries.map(b => {
        const addressParts = [
          b.purok,
          b.barangay,
          b.municipality,
          b.province
        ].filter(part => part && part.trim() !== '' && part.toLowerCase() !== 'unknown');
        
        return [
          b.beneficiaryId || '',
          `${b.firstName} ${b.middleName || ''} ${b.lastName}`.trim(),
          addressParts.join(', '),
          b.gender || '',
          b.birthDate ? new Date(b.birthDate).toLocaleDateString('en-US') : '',
          b.age || '',
          b.cellphone || ''
        ];
      });
    } else {
      title = 'Beneficiaries';
      headers = ['Beneficiary ID', 'Full Name', 'Address', 'Number of Farms', 'Total Seedling Received'];
      dataToExport = filteredBeneficiaries.map(b => {
        const addressParts = [
          b.purok,
          b.barangay,
          b.municipality,
          b.province
        ].filter(part => part && part.trim() !== '' && part.toLowerCase() !== 'unknown');
        
        return [
          b.beneficiaryId || '',
          `${b.firstName} ${b.middleName || ''} ${b.lastName}`.trim(),
          addressParts.join(', '),
          '-',
          seedlingData[b.beneficiaryId] || 0
        ];
      });
    }

    // Store data for PDF generation in sessionStorage
    const pdfData = {
      title,
      headers,
      data: dataToExport,
      generatedAt: new Date().toLocaleString()
    };
    
    sessionStorage.setItem('pdfReportData', JSON.stringify(pdfData));
    
    // Dispatch custom event to notify that PDF data is ready
    window.dispatchEvent(new CustomEvent('openPDFReport', { detail: pdfData }));
    
    setIsExportDropdownOpen(false);
    
    // Navigate to Reports page
    navigate('/reports');
  };

  const filteredBeneficiaries = beneficiaries.filter(ben => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${ben.firstName} ${ben.middleName || ''} ${ben.lastName}`.toLowerCase();
    
    const addressParts = [
      ben.purok,
      ben.barangay,
      ben.municipality,
      ben.province
    ].filter(part => part && part.trim() !== '' && part.toLowerCase() !== 'unknown');
    const address = addressParts.join(', ').toLowerCase();
    
    const matchesSearch = (
      ben.beneficiaryId?.toLowerCase().includes(searchLower) ||
      fullName.includes(searchLower) ||
      address.includes(searchLower)
    );
    
    return matchesSearch;
  });

  const filteredSeedlings = seedlings.filter(seedling => {
    const searchLower = searchTerm.toLowerCase();
    
    // Find beneficiary for this seedling
    const beneficiary = beneficiaries.find(b => b.beneficiaryId === seedling.beneficiaryId);
    const fullName = beneficiary 
      ? `${beneficiary.firstName} ${beneficiary.middleName || ''} ${beneficiary.lastName}`.toLowerCase()
      : '';
    
    const matchesSearch = (
      seedling.beneficiaryId?.toLowerCase().includes(searchLower) ||
      seedling.plotId?.toLowerCase().includes(searchLower) ||
      fullName.includes(searchLower)
    );
    
    return matchesSearch;
  });

  const filteredCropStatus = cropStatusRecords.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    
    // Find beneficiary for this crop status record
    const beneficiary = beneficiaries.find(b => b.beneficiaryId === record.beneficiaryId);
    const fullName = beneficiary 
      ? `${beneficiary.firstName} ${beneficiary.middleName || ''} ${beneficiary.lastName}`.toLowerCase()
      : '';
    
    const matchesSearch = (
      record.beneficiaryId?.toLowerCase().includes(searchLower) ||
      record.surveyer?.toLowerCase().includes(searchLower) ||
      fullName.includes(searchLower)
    );
    
    return matchesSearch;
  });



  const totalRecords = selectedTableFilters === 'Coffee Seedling Record' 
    ? filteredSeedlings.length
    : selectedTableFilters === 'Crop Survey Status'
    ? filteredCropStatus.length
    : filteredBeneficiaries.length;
  
  const paginatedBeneficiaries = filteredBeneficiaries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const paginatedSeedlings = filteredSeedlings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const paginatedCropStatus = filteredCropStatus.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // If showing editor page, render it instead
  if (showEditorPage) {
    return (
      <ExcelEditorPage
        initialData={cleanedData}
        errors={importErrors}
        onSave={handleExcelSave}
        onCancel={() => setShowEditorPage(false)}
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minWidth: 0,
        }}
      >
        <div
          style={{
            padding: '1.6rem 1rem 1.4rem 1rem',
            backgroundColor: 'var(--white)', 
          }}
        >
          <h2
            style={{
              color: 'var(--dark-green)',
              fontSize: '1.5rem',
              fontWeight: 600,
              margin: 0,
            }}
          >
            Coffee Beneficiaries
          </h2>
          <div style={{
            color: 'var(--dark-brown)',
            fontSize: '0.7rem',
            marginTop: '0.2rem',
            fontWeight: 500
          }}>
            View and manage coffee farmer beneficiaries
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '0 1rem 1rem 1rem',
            minHeight: 0,
          }}
        >
          <div
            style={{
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{ position: 'relative' }}>
              <MdOutlineSearch 
                size={16} 
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6c757d',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="text"
                placeholder="Search beneficiaries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '260px',
                  padding: '0.5rem 2.5rem 0.5rem 2rem',
                  border: '1px solid var(--dark-green)',
                  borderRadius: '4px',
                  fontSize: '.63rem',
                  outline: 'none',
                }}
              />
              {searchTerm && (
                <IoCloseCircle
                  size={16}
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-gray)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--dark-green)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-gray)'}
                />
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              
              <ActionButton
                onClick={handleImportClick}
                disabled={uploading}
                icon={<CiImport size={14} />}
                backgroundColor='var(--white)'
                color='var(--dark-green)'
                borderColor='var(--dark-green)'
                padding='0.45rem 1.25rem'
                fontSize='0.65rem'
                borderRadius='5px'
                style={{
                  transition: 'all 0.1s ease',
                  opacity: uploading ? 0.6 : 1,
                  cursor: uploading ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => !uploading && (e.currentTarget.style.transform = 'scale(1.04)')}
                onMouseLeave={(e) => !uploading && (e.currentTarget.style.transform = 'scale(1)')}
                onMouseDown={(e) => !uploading && (e.currentTarget.style.transform = 'scale(0.96)')}
              >
                {uploading ? 'Uploading...' : 'Import Record'}
              </ActionButton>

              <ActionButton
                onClick={() => setShowAddRecord(true)}
                icon={<RiAddLargeFill size={10} />}
                backgroundColor='var(--dark-green)'
                color='white'
                padding='0.45rem 1.25rem'
                fontSize='0.65rem'
                borderRadius='5px'
                style={{
                  transition: 'all 0.1s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
              >
                Add Record
              </ActionButton>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {loading ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1rem',
                  fontSize: '0.8rem',
                  color: '#666',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid var(--dark-green)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <div>Loading beneficiaries...</div>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : (
              <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    minHeight: 0,
                    borderRadius: '5px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Dynamic Title */}
                  {selectedTableFilters && (
                    <div
                      style={{
                        padding: '0.5rem 0.2rem',
                        borderBottom: '2px solid #e0e0e0',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--dark-green)',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                      }}
                    >
                      <span>{selectedTableFilters}</span>
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={handleExportClick}
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
                            fontWeight: 400,
                            transition: 'all 0.2s ease',
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
                          <IoChevronDown size={12} />
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
                              onClick={handleExportExcel}
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
                                transition: 'background-color 0.2s ease',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                              <FaFileExcel size={14} color="#107C41" />
                              <span>Export as Excel</span>
                            </button>
                            <button
                              onClick={handleExportPDF}
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
                                transition: 'background-color 0.2s ease',
                                borderTop: '1px solid #f0f0f0',
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
                  )}

                  {(beneficiaries.length > 0 || seedlings.length > 0) && (
                    <div
                      style={{
                        flexShrink: 0,
                        backgroundColor: '#e8f5e8',
                        borderBottom: '2px solid #2c5530',
                        display: 'grid',
                        gridTemplateColumns: 
                          selectedTableFilters === 'Beneficiary List' 
                            ? '12% 20% 25% 10% 12% 6% 12%'
                            : selectedTableFilters === 'Coffee Seedling Record'
                            ? '12% 16% 10% 14% 10% 9% 12% 13%'
                            : selectedTableFilters === 'Crop Survey Status'
                            ? '12% 19% 14% 13% 14% 14% 12%'
                            : '18% 19% 27% 19% 19%',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        color: '#2c5530',
                        alignItems: 'center',
                      }}
                    >
                      {selectedTableFilters === 'Beneficiary List' ? (
                        <>
                          <div style={{ padding: '10px', fontSize: '0.69rem' }}>ID</div>
                          <div style={{ padding: '10px', fontSize: '0.69rem' }}>Full Name</div>
                          <div style={{ padding: '10px', fontSize: '0.69rem' }}>Address</div>
                          <div style={{ padding: '10px', fontSize: '0.69rem' }}>Gender</div>
                          <div style={{ padding: '10px', fontSize: '0.69rem' }}>Birth Date</div>
                          <div style={{ padding: '10px', fontSize: '0.69rem' }}>Age</div>
                          <div style={{ padding: '10px', fontSize: '0.69rem' }}>Cellphone</div>
                        </>
                      ) : selectedTableFilters === 'Coffee Seedling Record' ? (
                        <>
                          <div style={{ padding: '10px', fontSize: '0.69rem' }}>Beneficiary ID</div>
                          <div style={{ padding: '10px', fontSize: '0.69rem' }}>Full Name</div>
                          <div style={{ padding: '10px', fontSize: '0.69rem' }}>Received</div>
                          <div style={{ padding: '10px', fontSize: '0.69rem' }}>Date Received</div>
                          <div style={{ padding: '10px', fontSize: '0.69rem' }}>Planted</div>
                          <div style={{ padding: '10px', fontSize: '0.69rem' }}>Plot ID</div>
                          <div style={{ padding: '10px', fontSize: '0.69rem' }}>Planting Start</div>
                          <div style={{ padding: '10px', fontSize: '0.69rem' }}>Planting End</div>
                        </>
                      ) : selectedTableFilters === 'Crop Survey Status' ? (
                        <>
                          <div style={{ padding: '10px', fontSize: '0.69rem' }}>Beneficiary ID</div>
                          <div style={{ padding: '10px', fontSize: '0.69rem' }}>Full Name</div>
                          <div style={{ padding: '10px', fontSize: '0.69rem' }}>Survey Date</div>
                          <div style={{ padding: '10px', fontSize: '0.69rem' }}>Surveyer</div>
                          <div style={{ padding: '10px', fontSize: '0.69rem' }}>Alive Crops</div>
                          <div style={{ padding: '10px', fontSize: '0.69rem' }}>Dead Crops</div>
                          <div style={{ padding: '10px', fontSize: '0.69rem' }}>Plot</div>
                        </>
                      ) : (
                        <>
                          <div style={{ padding: '10px', fontSize: '0.69rem' }}>Beneficiary ID</div>
                          <div style={{ padding: '10px', fontSize: '0.69rem' }}>Full Name</div>
                          <div style={{ padding: '10px', fontSize: '0.69rem' }}>Address</div>
                          <div style={{ padding: '10px', fontSize: '0.69rem', textAlign: 'center' }}>Number of Farms</div>
                          <div style={{ padding: '10px', fontSize: '0.69rem', textAlign: 'center' }}>Total Seedling Received</div>
                        </>
                      )}
                    </div>
                  )}

                  {(selectedTableFilters === 'Coffee Seedling Record' ? filteredSeedlings : selectedTableFilters === 'Crop Survey Status' ? filteredCropStatus : filteredBeneficiaries).length > 0 ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        minHeight: 0,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          overflowY: 'auto',
                          minHeight: 0,
                        }}
                      >
                        {selectedTableFilters === 'Coffee Seedling Record' ? (
                          paginatedSeedlings.map((s) => {
                            // Find beneficiary for this seedling
                            const beneficiary = beneficiaries.find(b => b.beneficiaryId === s.beneficiaryId);
                            
                            return (
                            <div
                              key={s.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (beneficiary) {
                                  setSelectedBeneficiary(beneficiary);
                                }
                              }}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '12% 18% 10% 15% 10% 10% 12% 13%',
                                fontSize: '0.61rem',
                                padding: '5px 12px',
                                minHeight: '35px',
                                borderBottom: '1px solid #f0f0f0',
                                cursor: beneficiary ? 'pointer' : 'default',
                                backgroundColor:
                                  selectedBeneficiary?.id === beneficiary?.id ? '#f0f9f0' : 'white',
                                transition: 'background-color 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                if (beneficiary && selectedBeneficiary?.id !== beneficiary?.id) {
                                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (beneficiary && selectedBeneficiary?.id !== beneficiary?.id) {
                                  e.currentTarget.style.backgroundColor = 'white';
                                }
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center' }}>{s.beneficiaryId || '-'}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {beneficiary?.picture ? (
                                  <img
                                    src={beneficiary.picture}
                                    alt={`${beneficiary.firstName} ${beneficiary.lastName}`}
                                    style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      objectFit: 'cover',
                                      border: '1px solid #ddd'
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'inline-block';
                                    }}
                                  />
                                ) : null}
                                <FaUserCircle
                                  size={24}
                                  color="#6c757d"
                                  style={{ display: beneficiary?.picture ? 'none' : 'inline-block' }}
                                />
                                <span>
                                  {beneficiary 
                                    ? `${beneficiary.firstName} ${beneficiary.middleName || ''} ${beneficiary.lastName}`.trim()
                                    : '-'
                                  }
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center' }}>{s.received?.toLocaleString() || 0}</div>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                {s.dateReceived ? (() => {
                                  const dateStr = s.dateReceived.toString().split('T')[0];
                                  const [year, month, day] = dateStr.split('-');
                                  return `${month}/${day}/${year}`;
                                })() : '-'}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center' }}>{s.planted?.toLocaleString() || 0}</div>
                              <div style={{ display: 'flex', alignItems: 'center' }}>{s.plotId || '-'}</div>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                {s.dateOfPlantingStart ? (() => {
                                  const dateStr = s.dateOfPlantingStart.toString().split('T')[0];
                                  const [year, month, day] = dateStr.split('-');
                                  return `${month}/${day}/${year}`;
                                })() : '-'}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                {s.dateOfPlantingEnd ? (() => {
                                  const dateStr = s.dateOfPlantingEnd.toString().split('T')[0];
                                  const [year, month, day] = dateStr.split('-');
                                  return `${month}/${day}/${year}`;
                                })() : '-'}
                              </div>
                            </div>
                            );
                          })
                        ) : selectedTableFilters === 'Crop Survey Status' ? (
                          paginatedCropStatus.map((cs) => {
                            // Find beneficiary for this crop status record
                            const beneficiary = beneficiaries.find(b => b.beneficiaryId === cs.beneficiaryId);
                            
                            return (
                            <div
                              key={cs.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (beneficiary) {
                                  setSelectedBeneficiary(beneficiary);
                                }
                              }}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '12% 20% 14% 14% 14% 14% 12%',
                                fontSize: '0.61rem',
                                padding: '5px 12px',
                                minHeight: '36px',
                                borderBottom: '1px solid #f0f0f0',
                                cursor: beneficiary ? 'pointer' : 'default',
                                backgroundColor:
                                  selectedBeneficiary?.id === beneficiary?.id ? '#f0f9f0' : 'white',
                                transition: 'background-color 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                if (beneficiary && selectedBeneficiary?.id !== beneficiary?.id) {
                                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (beneficiary && selectedBeneficiary?.id !== beneficiary?.id) {
                                  e.currentTarget.style.backgroundColor = 'white';
                                }
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center' }}>{cs.beneficiaryId || '-'}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {beneficiary?.picture ? (
                                  <img
                                    src={beneficiary.picture}
                                    alt={`${beneficiary.firstName} ${beneficiary.lastName}`}
                                    style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      objectFit: 'cover',
                                      border: '1px solid #ddd'
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'inline-block';
                                    }}
                                  />
                                ) : null}
                                <FaUserCircle
                                  size={24}
                                  color="#6c757d"
                                  style={{ display: beneficiary?.picture ? 'none' : 'inline-block' }}
                                />
                                <span>
                                  {beneficiary 
                                    ? `${beneficiary.firstName} ${beneficiary.middleName || ''} ${beneficiary.lastName}`.trim()
                                    : '-'
                                  }
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                {cs.surveyDate ? (() => {
                                  const dateStr = cs.surveyDate.toString().split('T')[0];
                                  const [year, month, day] = dateStr.split('-');
                                  return `${month}/${day}/${year}`;
                                })() : '-'}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center' }}>{cs.surveyer || '-'}</div>
                              <div style={{ display: 'flex', alignItems: 'center' }}>{cs.aliveCrops?.toLocaleString() || 0}</div>
                              <div style={{ display: 'flex', alignItems: 'center' }}>{cs.deadCrops?.toLocaleString() || 0}</div>
                              <div style={{ display: 'flex', alignItems: 'center' }}>{cs.plotId || '-'}</div>
                            </div>
                            );
                          })
                        ) : (
                          paginatedBeneficiaries.map((b) => (
                          <div
                            key={b.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBeneficiary(b);
                            }}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: selectedTableFilters === 'Beneficiary List'
                                ? '12% 20% 26% 10% 12% 6% 12%'
                                : '18% 19% 25% 19% 19%',
                              fontSize: '0.61rem',
                              padding: '5px 12px',
                              borderBottom: '1px solid #f0f0f0',
                              cursor: 'pointer',
                              backgroundColor:
                                selectedBeneficiary?.id === b.id ? '#f0f9f0' : 'white',
                              transition: 'background-color 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (selectedBeneficiary?.id !== b.id)
                                e.currentTarget.style.backgroundColor = '#f8f9fa';
                            }}
                            onMouseLeave={(e) => {
                              if (selectedBeneficiary?.id !== b.id)
                                e.currentTarget.style.backgroundColor = 'white';
                            }}
                          >
                            {selectedTableFilters === 'Beneficiary List' ? (
                              <>
                                <div style={{ display: 'flex', alignItems: 'center' }}>{b.beneficiaryId}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {b.picture ? (
                                    <img
                                      src={b.picture}
                                      alt={`${b.firstName} ${b.lastName}`}
                                      style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '1px solid #ddd'
                                      }}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'inline-block';
                                      }}
                                    />
                                  ) : null}
                                  <FaUserCircle
                                    size={24}
                                    color="#6c757d"
                                    style={{ display: b.picture ? 'none' : 'inline-block' }}
                                  />
                                  <span>{`${b.firstName} ${b.middleName || ''} ${b.lastName}`.trim()}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  {(() => {
                                    const parts = [
                                      b.purok,
                                      b.barangay,
                                      b.municipality,
                                      b.province
                                    ].filter(part => part && part.trim() !== '' && part.toLowerCase() !== 'unknown');
                                    return parts.length > 0 ? parts.join(', ') : '-';
                                  })()}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>{b.gender || '-'}</div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  {b.birthDate ? (() => {
                                    const dateStr = b.birthDate.split('T')[0];
                                    const [year, month, day] = dateStr.split('-');
                                    return `${month}/${day}/${year}`;
                                  })() : '-'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>{b.age || '-'}</div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>{b.cellphone || '-'}</div>
                              </>
                            ) : (
                              <>
                                <div style={{ display: 'flex', alignItems: 'center' }}>{b.beneficiaryId}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {b.picture ? (
                                    <img
                                      src={b.picture}
                                      alt={`${b.firstName} ${b.lastName}`}
                                      style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '1px solid #ddd'
                                      }}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'inline-block';
                                      }}
                                    />
                                  ) : null}
                                  <FaUserCircle
                                    size={24}
                                    color="#6c757d"
                                    style={{ display: b.picture ? 'none' : 'inline-block' }}
                                  />
                                  <span>{`${b.firstName} ${b.middleName || ''} ${b.lastName}`}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  {(() => {
                                    const parts = [
                                      b.purok,
                                      b.barangay,
                                      b.municipality,
                                      b.province
                                    ].filter(part => part && part.trim() !== '' && part.toLowerCase() !== 'unknown');
                                    
                                    return parts.length > 0 ? parts.join(', ') : '-';
                                  })()}
                                </div>
                                <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</div>
                                <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {seedlingData[b.beneficiaryId] ? seedlingData[b.beneficiaryId].toLocaleString() : 0}
                                </div>
                              </>
                            )}
                          </div>
                          ))
                        )}
                      </div>

                      <div style={{ flexShrink: 0 }}>
                        <Pagination
                          currentPage={currentPage}
                          totalRecords={totalRecords}
                          pageSize={pageSize}
                          onPageChange={setCurrentPage}
                          onPageSizeChange={setPageSize}
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 0,
                      }}
                    >
                      <NoDataDisplay 
                        icon={<FaUsersSlash />}
                        title={
                          selectedTableFilters === 'Coffee Seedling Record' 
                            ? "No seedling records found." 
                            : selectedTableFilters === 'Crop Survey Status'
                            ? "No crop survey records found."
                            : "No beneficiary records found."
                        }
                      />
                    </div>
                  )}
                </div>
            )}
          </div>
        </div>
      </div>

      {selectedBeneficiary && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setSelectedBeneficiary(null)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              zIndex: 999,
            }}
          />
          
          {/* Detail Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '450px',
              height: '100%',
              zIndex: 1000,
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                overflowY: 'auto',
              }}
            >
              <DetailContainer
                selectedBeneficiary={selectedBeneficiary}
                onClose={() => setSelectedBeneficiary(null)}
              />
            </div>
          </div>
        </>
      )}

      <AddRecord
        isOpen={showAddRecord}
        onClose={() => setShowAddRecord(false)}
        onSubmit={handleAddRecord}
      />

      {/* Upload Progress Modal */}
      <LoadingModal
        isOpen={uploading}
        title={
          uploadStage === 'uploading' ? 'Uploading...' :
          uploadStage === 'cleansing' ? 'Cleansing Data...' :
          uploadStage === 'success' ? 'Data Loaded Successfully!' :
          'Processing...'
        }
        message={
          uploadStage === 'uploading' ? 'Uploading your Excel file to the server' :
          uploadStage === 'cleansing' ? 'Processing and validating your data' :
          uploadStage === 'success' ? 'Opening editor for review' :
          'Please wait...'
        }
        dismissible={false}
        spinnerColor="var(--dark-green)"
      />
    </div>
  );
};

export default Coffee_Beneficiaries;