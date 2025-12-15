import React, { useState, useEffect } from 'react';
import FilterSection from '../../ui/FilterSection';
import ReportTable from '../../ui/ListTable';
import TableTabs from './TableTabs';
import AlertModal from '../../ui/AlertModal';
import PDFEditorPage from './PDFEditorPage';
import { exportToExcel } from './ExcelExport';
import { statisticsAPI, beneficiariesAPI, farmPlotsAPI, seedlingsAPI, cropStatusAPI } from '../../../services/api';

const Reports = () => {
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [showNoTabAlert, setShowNoTabAlert] = useState(false);
  const [showPDFEditor, setShowPDFEditor] = useState(false);
  
  // Data states for different report tabs (beneficiaries, plots, seedlings, crop surveys)
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [farmPlots, setFarmPlots] = useState([]);
  const [seedlings, setSeedlings] = useState([]);
  const [cropSurveys, setCropSurveys] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  
  // Filtered data states for applying custom filters and search
  const [filteredData, setFilteredData] = useState([]);
  const [activeFilters, setActiveFilters] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch tab-specific data from API based on active tab selection
  useEffect(() => {
    if (activeTab) {
      fetchTabData();
    }
  }, [activeTab]);

  const fetchTabData = async () => {
    setLoadingData(true);
    try {
      switch (activeTab) {
        case 'Beneficiary List':
          const beneficiaryData = await beneficiariesAPI.getAll();
          setBeneficiaries(beneficiaryData || []);
          break;
        case 'Farm Location':
          const farmPlotData = await farmPlotsAPI.getAll();
          setFarmPlots(farmPlotData || []);
          break;
        case 'Seedling Record':
          const seedlingData = await seedlingsAPI.getAll();
          setSeedlings(seedlingData || []);
          break;
        case 'Crop Survey Status':
          const cropSurveyData = await cropStatusAPI.getAll();
          setCropSurveys(cropSurveyData || []);
          break;
        case 'Recent Activities':
          const activityData = await statisticsAPI.getRecentActivities(1000);
          setRecentActivities(activityData || []);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab} data:`, error);
    } finally {
      setLoadingData(false);
    }
  };

  // Restore active tab from sessionStorage when navigating from dashboard "View All" buttons
  useEffect(() => {
    // Check if there's a stored active tab (from View All click)
    const storedTab = sessionStorage.getItem('reportsActiveTab');
    if (storedTab) {
      setActiveTab(storedTab);
      sessionStorage.removeItem('reportsActiveTab'); // Clean up after reading
    }
  }, []);

  const handleExportClick = () => {
    setIsExportDropdownOpen(!isExportDropdownOpen);
  };

  const handleExportExcel = () => {
    if (!activeTab) {
      setIsExportDropdownOpen(false);
      setShowNoTabAlert(true);
      return;
    }
    // Export uses search-filtered data to match visible table content (filters + search)
    exportToExcel(activeTab, searchFilteredData, activeFilters?.selectedAttributes, attributeColumnMap);
    setIsExportDropdownOpen(false);
  };

  const handleExportPDF = () => {
    if (!activeTab) {
      setIsExportDropdownOpen(false);
      setShowNoTabAlert(true);
      return;
    }
    // Open PDF Editor instead of direct export
    setShowPDFEditor(true);
    setIsExportDropdownOpen(false);
  };

  const handleToggleFilter = () => {
    setIsFilterActive(!isFilterActive);
  };

  const handleApplyFilters = (filters) => {
    console.log('Applying filters:', filters);
    console.log('Selected attributes:', filters.selectedAttributes);
    setActiveFilters(filters);
    
    // Handle cross-table filtering: merge data when attributes from multiple tables are selected
    if (filters.selectedAttributes && filters.selectedAttributes.length > 0) {
      const selectedTables = new Set(
        filters.selectedAttributes.map(attrId => attributeColumnMap[attrId]?.table).filter(Boolean)
      );
      
      // Merge data from multiple tables if cross-table attributes are selected
      if (selectedTables.size > 1) {
        const mergedData = getMergedTableData(filters.selectedAttributes);
        setFilteredData(mergedData);
        return;
      }
    }
    
    const currentData = getCurrentTabData();
    let filtered = [...currentData];
    
    // Apply filters based on active tab
    switch (activeTab) {
      case 'Beneficiary List':
        filtered = filterBeneficiaries(filtered, filters);
        break;
      case 'Farm Location':
        filtered = filterFarmPlots(filtered, filters);
        break;
      case 'Seedling Record':
        filtered = filterSeedlings(filtered, filters);
        break;
      case 'Crop Survey Status':
        filtered = filterCropSurveys(filtered, filters);
        break;
      case 'Recent Activities':
        filtered = filterRecentActivities(filtered, filters);
        break;
      default:
        break;
    }
    
    setFilteredData(filtered);
  };

  const handleResetFilters = () => {
    setIsFilterActive(false);
    setActiveFilters(null);
    setFilteredData([]);
  };

  // Format timestamp for table display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '—';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getActivityTitle = (type) => {
    switch (type) {
      case 'beneficiary':
        return 'Coffee Beneficiary';
      case 'crop':
        return 'Crop Survey Status';
      case 'seedling':
        return 'Seedling Record';
      case 'plot':
        return 'Farm Monitoring';
      case 'report':
        return 'Reports';
      default:
        return 'Reports';
    }
  };

  // Get current data based on active tab
  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'Beneficiary List':
        return beneficiaries;
      case 'Farm Location':
        return farmPlots;
      case 'Seedling Record':
        return seedlings;
      case 'Crop Survey Status':
        return cropSurveys;
      case 'Recent Activities':
        return recentActivities;
      default:
        return [];
    }
  };

  const currentTabData = activeFilters ? filteredData : getCurrentTabData();
  
  // Apply search filter to current data (after applying custom filters)
  const searchFilteredData = searchQuery ? currentTabData.filter(item => {
    const query = searchQuery.toLowerCase();
    
    switch (activeTab) {
      case 'Beneficiary List':
        const fullName = `${item.firstName || ''} ${item.middleName || ''} ${item.lastName || ''}`.toLowerCase();
        // Build searchable address string from Philippine address hierarchy
        const address = [item.purok, item.barangay, item.municipality, item.province]
          .filter(Boolean).join(' ').toLowerCase();
        return (
          (item.beneficiaryId || '').toLowerCase().includes(query) ||
          fullName.includes(query) ||
          (item.cellphone || '').includes(query) ||
          address.includes(query) ||
          (item.gender || '').toLowerCase().includes(query)
        );
      
      case 'Farm Location':
        return (
          (item.id || '').toLowerCase().includes(query) ||
          (item.beneficiaryName || '').toLowerCase().includes(query) ||
          (item.address || '').toLowerCase().includes(query) ||
          (item.hectares || '').toString().includes(query)
        );
      
      case 'Seedling Record':
        return (
          (item.beneficiaryId || '').toLowerCase().includes(query) ||
          (item.plotId || '').toLowerCase().includes(query) ||
          (item.received || '').toString().includes(query) ||
          (item.planted || '').toString().includes(query)
        );
      
      case 'Crop Survey Status':
        return (
          (item.beneficiaryId || '').toLowerCase().includes(query) ||
          (item.beneficiaryName || '').toLowerCase().includes(query) ||
          (item.surveyer || '').toLowerCase().includes(query) ||
          (item.plot || '').toLowerCase().includes(query)
        );
      
      case 'Recent Activities':
        return (
          getActivityTitle(item.type).toLowerCase().includes(query) ||
          (item.action || '').toLowerCase().includes(query) ||
          (item.user || '').toLowerCase().includes(query)
        );
      
      default:
        return true;
    }
  }) : currentTabData;
  
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };
  
  // Merge data from multiple tables based on selected attributes for cross-table reporting
  const getMergedTableData = (selectedAttrIds) => {
    const selectedTables = new Set(
      selectedAttrIds.map(attrId => attributeColumnMap[attrId]?.table).filter(Boolean)
    );
    
    // Get all data from involved tables
    const allData = [];
    
    selectedTables.forEach(table => {
      let tableData = [];
      switch (table) {
        case 'Beneficiary List':
          tableData = beneficiaries;
          break;
        case 'Farm Location':
          tableData = farmPlots;
          break;
        case 'Seedling Record':
          tableData = seedlings;
          break;
        case 'Crop Survey Status':
          tableData = cropSurveys;
          break;
        case 'Recent Activities':
          tableData = recentActivities;
          break;
      }
      
      tableData.forEach(item => {
        // Tag each item with source table for proper rendering in merged view
        allData.push({ ...item, _sourceTable: table });
      });
    });
    
    return allData;
  };
  
  // Filter functions for each tab
  const filterBeneficiaries = (data, filters) => {
    return data.filter(item => {
      // Text search across ID, name, phone, and address fields
      if (filters.beneficiarySearch) {
        const searchLower = filters.beneficiarySearch.toLowerCase();
        const fullName = `${item.firstName || ''} ${item.middleName || ''} ${item.lastName || ''}`.toLowerCase();
        const address = [item.purok, item.barangay, item.municipality, item.province]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        
        const matchesSearch = 
          (item.beneficiaryId || '').toLowerCase().includes(searchLower) ||
          fullName.includes(searchLower) ||
          (item.cellphone || '').includes(searchLower) ||
          address.includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      // Gender filter
      if (filters.selectedGender && item.gender !== filters.selectedGender) {
        return false;
      }
      
      // Marital status filter
      if (filters.selectedMaritalStatus && item.maritalStatus !== filters.selectedMaritalStatus) {
        return false;
      }
      
      // Birthdate filter
      if (filters.dateFrom || filters.dateTo) {
        const birthDate = new Date(item.birthDate);
        if (filters.dateFrom && birthDate < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && birthDate > new Date(filters.dateTo)) return false;
      }
      
      // Province filter
      if (filters.selectedProvince && item.province !== filters.selectedProvince) {
        return false;
      }
      
      // Municipality filter
      if (filters.selectedMunicipality && item.municipality !== filters.selectedMunicipality) {
        return false;
      }
      
      return true;
    });
  };
  
  const filterFarmPlots = (data, filters) => {
    return data.filter(item => {
      // Search filter
      if (filters.plotIdSearch) {
        const searchLower = filters.plotIdSearch.toLowerCase();
        const matchesSearch = 
          (item.id || '').toLowerCase().includes(searchLower) ||
          (item.beneficiaryName || '').toLowerCase().includes(searchLower) ||
          (item.address || '').toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      // Hectares filter
      if (filters.hectaresMin && parseFloat(item.hectares) < parseFloat(filters.hectaresMin)) {
        return false;
      }
      if (filters.hectaresMax && parseFloat(item.hectares) > parseFloat(filters.hectaresMax)) {
        return false;
      }
      
      // Province filter (if address contains province)
      if (filters.selectedProvince) {
        const addressLower = (item.address || '').toLowerCase();
        if (!addressLower.includes(filters.selectedProvince.toLowerCase())) {
          return false;
        }
      }
      
      // Municipality filter
      if (filters.selectedMunicipality) {
        const addressLower = (item.address || '').toLowerCase();
        if (!addressLower.includes(filters.selectedMunicipality.toLowerCase())) {
          return false;
        }
      }
      
      return true;
    });
  };
  
  const filterSeedlings = (data, filters) => {
    return data.filter(item => {
      // Search filter
      if (filters.seedlingSearch) {
        const searchLower = filters.seedlingSearch.toLowerCase();
        const matchesSearch = 
          (item.beneficiaryId || '').toLowerCase().includes(searchLower) ||
          (item.plotId || '').toLowerCase().includes(searchLower) ||
          (item.received || '').toString().includes(searchLower) ||
          (item.planted || '').toString().includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      // Date filter: check if any of the three date fields fall within the specified range
      if (filters.dateFrom || filters.dateTo) {
        const dateReceived = item.dateReceived ? new Date(item.dateReceived) : null;
        const plantingStart = item.dateOfPlantingStart ? new Date(item.dateOfPlantingStart) : null;
        const plantingEnd = item.dateOfPlantingEnd ? new Date(item.dateOfPlantingEnd) : null;
        
        let matchesDate = false;
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
        const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
        
        // Check if any of the dates (received, planting start, planting end) fall within range
        const dates = [dateReceived, plantingStart, plantingEnd].filter(Boolean);
        for (const date of dates) {
          const inRange = (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
          if (inRange) {
            matchesDate = true;
            break;
          }
        }
        
        if (dates.length > 0 && !matchesDate) return false;
      }
      
      return true;
    });
  };
  
  const filterCropSurveys = (data, filters) => {
    return data.filter(item => {
      // Search filter
      if (filters.cropSearch) {
        const searchLower = filters.cropSearch.toLowerCase();
        const matchesSearch = 
          (item.beneficiaryId || '').toLowerCase().includes(searchLower) ||
          (item.beneficiaryName || '').toLowerCase().includes(searchLower) ||
          (item.surveyer || '').toLowerCase().includes(searchLower) ||
          (item.plot || '').toLowerCase().includes(searchLower) ||
          (item.aliveCrops || '').toString().includes(searchLower) ||
          (item.deadCrops || '').toString().includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      // Date filter
      if (filters.dateFrom || filters.dateTo) {
        const surveyDate = new Date(item.surveyDate);
        if (filters.dateFrom && surveyDate < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && surveyDate > new Date(filters.dateTo)) return false;
      }
      
      return true;
    });
  };
  
  const filterRecentActivities = (data, filters) => {
    return data.filter(item => {
      // Search filter
      if (filters.recentSearch) {
        const searchLower = filters.recentSearch.toLowerCase();
        const activityTitle = getActivityTitle(item.type).toLowerCase();
        const matchesSearch = 
          activityTitle.includes(searchLower) ||
          (item.action || '').toLowerCase().includes(searchLower) ||
          (item.user || '').toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      // Date filter
      if (filters.dateFrom || filters.dateTo) {
        const timestamp = new Date(item.timestamp);
        if (filters.dateFrom && timestamp < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && timestamp > new Date(filters.dateTo)) return false;
      }
      
      return true;
    });
  };

  // Attribute ID to column header and table mapping for dynamic column selection
  const attributeColumnMap = {
    // Beneficiary List
    'ben_id': { header: 'Beneficiary ID', table: 'Beneficiary List' },
    'ben_fullname': { header: 'Full Name', table: 'Beneficiary List' },
    'ben_gender': { header: 'Gender', table: 'Beneficiary List' },
    'ben_birthdate': { header: 'Birth Date', table: 'Beneficiary List' },
    'ben_age': { header: 'Age', table: 'Beneficiary List' },
    'ben_cellphone': { header: 'Cellphone', table: 'Beneficiary List' },
    'ben_address': { header: 'Address', table: 'Beneficiary List' },
    'ben_marital': { header: 'Marital Status', table: 'Beneficiary List' },
    
    // Farm Location
    'farm_plot_id': { header: 'Plot ID', table: 'Farm Location' },
    'farm_beneficiary': { header: 'Beneficiary', table: 'Farm Location' },
    'farm_hectares': { header: 'Hectares', table: 'Farm Location' },
    'farm_address': { header: 'Address', table: 'Farm Location' },
    'farm_coordinates': { header: 'Coordinates', table: 'Farm Location' },
    
    // Seedling Record
    'seed_id': { header: 'Seedling ID', table: 'Seedling Record' },
    'seed_ben_id': { header: 'Beneficiary ID', table: 'Seedling Record' },
    'seed_received': { header: 'Received', table: 'Seedling Record' },
    'seed_date_received': { header: 'Date Received', table: 'Seedling Record' },
    'seed_planted': { header: 'Planted', table: 'Seedling Record' },
    'seed_plot_id': { header: 'Plot ID', table: 'Seedling Record' },
    'seed_planting_date': { header: 'Planting Date', table: 'Seedling Record' },
    
    // Crop Survey Status
    'crop_id': { header: 'Survey ID', table: 'Crop Survey Status' },
    'crop_ben_id': { header: 'Beneficiary ID', table: 'Crop Survey Status' },
    'crop_survey_date': { header: 'Survey Date', table: 'Crop Survey Status' },
    'crop_surveyer': { header: 'Surveyer', table: 'Crop Survey Status' },
    'crop_beneficiary': { header: 'Beneficiary Name', table: 'Crop Survey Status' },
    'crop_alive': { header: 'Alive Crops', table: 'Crop Survey Status' },
    'crop_dead': { header: 'Dead Crops', table: 'Crop Survey Status' },
    'crop_plot': { header: 'Plot', table: 'Crop Survey Status' },
    
    // Recent Activities
    'act_id': { header: 'Activity ID', table: 'Recent Activities' },
    'act_type': { header: 'Type', table: 'Recent Activities' },
    'act_action': { header: 'Action', table: 'Recent Activities' },
    'act_timestamp': { header: 'Timestamp', table: 'Recent Activities' },
    'act_user': { header: 'User', table: 'Recent Activities' },
  };

  // Render table headers dynamically based on active tab and selected filter attributes
  const renderTableHeaders = () => {
    const allHeaders = {
      'Beneficiary List': ['#', 'Beneficiary ID', 'Full Name', 'Gender', 'Marital Status', 'Birth Date', 'Age', 'Cellphone', 'Address'],
      'Farm Location': ['#', 'Plot ID', 'Beneficiary', 'Hectares', 'Address', 'Coordinates'],
      'Seedling Record': ['#', 'Beneficiary ID', 'Received', 'Date Received', 'Planted', 'Plot ID', 'Planting Date', 'End Date'],
      'Crop Survey Status': ['#', 'Beneficiary ID', 'Beneficiary Name', 'Survey Date', 'Surveyer', 'Alive Crops', 'Dead Crops', 'Plot'],
      'Recent Activities': ['#', 'Type', 'Action', 'Timestamp', 'User']
    };

    let currentHeaders = allHeaders[activeTab] || [];
    
    // Filter headers to show only selected attributes when custom column filtering is applied
    if (activeFilters?.selectedAttributes && activeFilters.selectedAttributes.length > 0) {
      // Check if attributes from multiple tables are selected
      const selectedTables = new Set(
        activeFilters.selectedAttributes.map(attrId => attributeColumnMap[attrId]?.table).filter(Boolean)
      );
      
      // Display only selected columns for cross-table reports or filtered views
      if (selectedTables.size > 1 || activeFilters.selectedAttributes.length > 0) {
        const selectedHeaders = activeFilters.selectedAttributes
          .map(attrId => attributeColumnMap[attrId]?.header)
          .filter(Boolean);
        
        if (selectedHeaders.length > 0) {
          // Always preserve row number column (#), then add selected columns
          currentHeaders = ['#', ...selectedHeaders];
        }
      }
    }
    
    // Define column widths for Recent Activities tab to prevent overflow
    const getColumnWidth = (header, index) => {
      if (index === 0) return '60px';
      if (activeTab === 'Recent Activities') {
        switch (header) {
          case 'Type':
            return '150px';
          case 'Action':
            return '30%';
          case 'Timestamp':
            return '180px';
          case 'User':
            return '120px';
          default:
            return 'auto';
        }
      }
      return 'auto';
    };
    
    return (
      <thead style={{
        position: 'sticky',
        top: 0,
        backgroundColor: '#e8f5e8',
        zIndex: 10
      }}>
        <tr>
          {currentHeaders.map((header, index) => (
            <th key={index} style={{
              padding: '0.75rem 0.5rem',
              textAlign: index === 0 ? 'center' : 'left',
              fontWeight: 600,
              color: '#2c5530',
              borderBottom: '2px solid #2c5530',
              whiteSpace: 'nowrap',
              width: getColumnWidth(header, index)
            }}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
    );
  };

  // Render table body based on active tab
  const renderTableBody = () => {
    return (
      <tbody>
        {currentTabData.map((item, rowIndex) => (
          <tr key={item.id || rowIndex} style={{
            backgroundColor: rowIndex % 2 === 0 ? 'white' : '#f8f9fa',
            transition: 'background-color 0.2s ease',
            minHeight: '36px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9f0'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? 'white' : '#f8f9fa'}
          >
            {renderTableRow(item, rowIndex)}
          </tr>
        ))}
      </tbody>
    );
  };

  // Get cell data by attribute ID for dynamic column rendering in filtered/merged views
  const getCellData = (item, attrId) => {
    const cellStyle = {
      padding: '0.65rem 0.5rem',
      borderBottom: '1px solid #e0e0e0',
      color: '#333'
    };

    switch (attrId) {
      // Beneficiary List
      case 'ben_id':
        return <td key={attrId} style={cellStyle}>{item.beneficiaryId || '—'}</td>;
      case 'ben_fullname':
        return <td key={attrId} style={cellStyle}>{`${item.firstName || ''} ${item.middleName || ''} ${item.lastName || ''}`.trim() || '—'}</td>;
      case 'ben_gender':
        return <td key={attrId} style={cellStyle}>{item.gender || '—'}</td>;
      case 'ben_birthdate':
        return <td key={attrId} style={cellStyle}>{item.birthDate ? new Date(item.birthDate).toLocaleDateString() : '—'}</td>;
      case 'ben_age':
        return <td key={attrId} style={cellStyle}>{item.age || '—'}</td>;
      case 'ben_cellphone':
        return <td key={attrId} style={cellStyle}>{item.cellphone || '—'}</td>;
      case 'ben_address':
        // Build address string from Philippine address hierarchy, filtering out empty and 'unknown' values
        const benAddress = [item.purok, item.barangay, item.municipality, item.province]
          .filter(part => part && part.trim() !== '' && part.toLowerCase() !== 'unknown')
          .join(', ');
        return <td key={attrId} style={cellStyle}>{benAddress || '—'}</td>;
      case 'ben_marital':
        return <td key={attrId} style={cellStyle}>{item.maritalStatus || '—'}</td>;
      
      // Farm Location
      case 'farm_plot_id':
        return <td key={attrId} style={cellStyle}>{item.id || '—'}</td>;
      case 'farm_beneficiary':
        return <td key={attrId} style={cellStyle}>{item.beneficiaryName || '—'}</td>;
      case 'farm_hectares':
        return <td key={attrId} style={cellStyle}>{item.hectares || '—'}</td>;
      case 'farm_address':
        return <td key={attrId} style={cellStyle}>{item.address || '—'}</td>;
      case 'farm_coordinates':
        return <td key={attrId} style={cellStyle}>{item.coordinates?.length || 0} points</td>;
      
      // Seedling Record
      case 'seed_ben_id':
        return <td key={attrId} style={cellStyle}>{item.beneficiaryId || '—'}</td>;
      case 'seed_received':
        return <td key={attrId} style={cellStyle}>{item.received || 0}</td>;
      case 'seed_date_received':
        return <td key={attrId} style={cellStyle}>{item.dateReceived ? new Date(item.dateReceived).toLocaleDateString() : '—'}</td>;
      case 'seed_planted':
        return <td key={attrId} style={cellStyle}>{item.planted || 0}</td>;
      case 'seed_plot_id':
        return <td key={attrId} style={cellStyle}>{item.plotId || '—'}</td>;
      case 'seed_planting_date':
        return <td key={attrId} style={cellStyle}>{item.dateOfPlantingStart ? new Date(item.dateOfPlantingStart).toLocaleDateString() : '—'}</td>;
      
      // Crop Survey Status
      case 'crop_ben_id':
        return <td key={attrId} style={cellStyle}>{item.beneficiaryId || '—'}</td>;
      case 'crop_beneficiary':
        return <td key={attrId} style={cellStyle}>{item.beneficiaryName || '—'}</td>;
      case 'crop_survey_date':
        return <td key={attrId} style={cellStyle}>{item.surveyDate ? new Date(item.surveyDate).toLocaleDateString() : '—'}</td>;
      case 'crop_surveyer':
        return <td key={attrId} style={cellStyle}>{item.surveyer || '—'}</td>;
      case 'crop_alive':
        return <td key={attrId} style={cellStyle}>{item.aliveCrops || 0}</td>;
      case 'crop_dead':
        return <td key={attrId} style={cellStyle}>{item.deadCrops || 0}</td>;
      case 'crop_plot':
        return <td key={attrId} style={cellStyle}>{item.plot || '—'}</td>;
      
      // Recent Activities
      case 'act_type':
        return <td key={attrId} style={cellStyle}>{getActivityTitle(item.type)}</td>;
      case 'act_action':
        return <td key={attrId} style={cellStyle}>{item.action || '—'}</td>;
      case 'act_timestamp':
        return <td key={attrId} style={cellStyle}>{formatTimestamp(item.timestamp)}</td>;
      case 'act_user':
        return <td key={attrId} style={cellStyle}>{item.user || 'Admin'}</td>;
      
      default:
        return <td key={attrId} style={cellStyle}>—</td>;
    }
  };

  // Render table row with dynamic columns based on filters or default full row for active tab
  const renderTableRow = (item, rowIndex) => {
    const cellStyle = {
      padding: '0.65rem 0.5rem',
      borderBottom: '1px solid #e0e0e0',
      color: '#333'
    };

    // If attributes are selected, render only those columns (including merged tables)
    if (activeFilters?.selectedAttributes && activeFilters.selectedAttributes.length > 0) {
      const selectedAttrs = activeFilters.selectedAttributes;
      
      // Check for cross-table data merging
      const selectedTables = new Set(
        selectedAttrs.map(attrId => attributeColumnMap[attrId]?.table).filter(Boolean)
      );
      
      // Render custom column selection for filtered or merged views
      if (selectedTables.size > 1 || selectedAttrs.length > 0) {
        return (
          <>
            <td key="index" style={{ ...cellStyle, textAlign: 'center', fontWeight: 600 }}>{rowIndex + 1}</td>
            {selectedAttrs.map(attrId => getCellData(item, attrId))}
          </>
        );
      }
    }

    // Default rendering (no attributes selected) - show all columns for active tab
    switch (activeTab) {
      case 'Beneficiary List':
        // Build address string from Philippine address hierarchy, filtering out empty and 'unknown' values
        const benAddress = [item.purok, item.barangay, item.municipality, item.province]
          .filter(part => part && part.trim() !== '' && part.toLowerCase() !== 'unknown')
          .join(', ');
        return (
          <>
            <td style={{ ...cellStyle, textAlign: 'center', fontWeight: 600 }}>{rowIndex + 1}</td>
            <td style={cellStyle}>{item.beneficiaryId || '—'}</td>
            <td style={cellStyle}>{`${item.firstName || ''} ${item.middleName || ''} ${item.lastName || ''}`.trim() || '—'}</td>
            <td style={cellStyle}>{item.gender || '—'}</td>
            <td style={cellStyle}>{item.maritalStatus || '—'}</td>
            <td style={cellStyle}>{item.birthDate ? new Date(item.birthDate).toLocaleDateString() : '—'}</td>
            <td style={cellStyle}>{item.age || '—'}</td>
            <td style={cellStyle}>{item.cellphone || '—'}</td>
            <td style={cellStyle}>{benAddress || '—'}</td>
          </>
        );
      case 'Farm Location':
        return (
          <>
            <td style={{ ...cellStyle, textAlign: 'center', fontWeight: 600 }}>{rowIndex + 1}</td>
            <td style={cellStyle}>{item.id || '—'}</td>
            <td style={cellStyle}>{item.beneficiaryName || '—'}</td>
            <td style={cellStyle}>{item.hectares || '—'}</td>
            <td style={cellStyle}>{item.address || '—'}</td>
            <td style={cellStyle}>{item.coordinates?.length || 0} points</td>
          </>
        );
      case 'Seedling Record':
        return (
          <>
            <td style={{ ...cellStyle, textAlign: 'center', fontWeight: 600 }}>{rowIndex + 1}</td>
            <td style={cellStyle}>{item.beneficiaryId || '—'}</td>
            <td style={cellStyle}>{item.received || 0}</td>
            <td style={cellStyle}>{item.dateReceived ? new Date(item.dateReceived).toLocaleDateString() : '—'}</td>
            <td style={cellStyle}>{item.planted || 0}</td>
            <td style={cellStyle}>{item.plotId || '—'}</td>
            <td style={cellStyle}>{item.dateOfPlantingStart ? new Date(item.dateOfPlantingStart).toLocaleDateString() : '—'}</td>
            <td style={cellStyle}>{item.dateOfPlantingEnd ? new Date(item.dateOfPlantingEnd).toLocaleDateString() : '—'}</td>
          </>
        );
      case 'Crop Survey Status':
        return (
          <>
            <td style={{ ...cellStyle, textAlign: 'center', fontWeight: 600 }}>{rowIndex + 1}</td>
            <td style={cellStyle}>{item.beneficiaryId || '—'}</td>
            <td style={cellStyle}>{item.beneficiaryName || '—'}</td>
            <td style={cellStyle}>{item.surveyDate ? new Date(item.surveyDate).toLocaleDateString() : '—'}</td>
            <td style={cellStyle}>{item.surveyer || '—'}</td>
            <td style={cellStyle}>{item.aliveCrops || 0}</td>
            <td style={cellStyle}>{item.deadCrops || 0}</td>
            <td style={cellStyle}>{item.plot || '—'}</td>
          </>
        );
      case 'Recent Activities':
        return (
          <>
            <td style={{ ...cellStyle, textAlign: 'center', fontWeight: 600 }}>{rowIndex + 1}</td>
            <td style={cellStyle}>{getActivityTitle(item.type)}</td>
            <td style={cellStyle}>{item.action || '—'}</td>
            <td style={cellStyle}>{formatTimestamp(item.timestamp)}</td>
            <td style={cellStyle}>{item.user || 'Admin'}</td>
          </>
        );
      default:
        return null;
    }
  };
  // Switch to PDF Editor view when user clicks export PDF (allows customization before export)
  if (showPDFEditor) {
    return (
      <PDFEditorPage
        activeTab={activeTab}
        data={searchFilteredData}
        selectedAttributes={activeFilters?.selectedAttributes}
        attributeColumnMap={attributeColumnMap}
        onClose={() => setShowPDFEditor(false)}
      />
    );
  }

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '1.6rem 1rem 1rem 1rem',
        backgroundColor: 'var(--white)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end' 
      }}>
        <div>
          <h2 style={{ 
            color: 'var(--dark-green)', 
            fontSize: '1.5rem', 
            fontWeight: 600, 
            margin: 0 
          }}>
            Reports
          </h2>
          <div style={{
            color: 'var(--dark-brown)',
            fontSize: '0.7rem',
            marginTop: '0.2rem',
            fontWeight: 500
          }}>
            Generate and export comprehensive reports for your coffee monitoring system
          </div>
        </div>
      </div>

      {/* Table Section - Moved directly below header */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        overflow: 'hidden'
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          margin: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '6px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}>
            {/* Tabs Section */}
            <TableTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              isFilterActive={isFilterActive}
              onToggleFilter={handleToggleFilter}
              isExportDropdownOpen={isExportDropdownOpen}
              onExportClick={handleExportClick}
              onExportExcel={handleExportExcel}
              onExportPDF={handleExportPDF}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
            />

            {/* Filter Section */}
            {isFilterActive && (
              <FilterSection
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleResetFilters}
                activeTab={activeTab}
              />
            )}

            {/* Table */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              minHeight: 0
            }}>
              <ReportTable 
                activeTab={activeTab}
                loadingData={loadingData}
                data={searchFilteredData}
                renderTableHeaders={renderTableHeaders}
                renderTableBody={renderTableBody}
              />
            </div>


          </div>
        </div>
      </div>

      {/* Alert Modal for No Tab Selected */}
      <AlertModal
        isOpen={showNoTabAlert}
        onClose={() => setShowNoTabAlert(false)}
        type="warning"
        title="No Report Selected"
        message="Please select a report tab before exporting."
        autoClose={true}
        autoCloseDelay={2000}
        hideButton={true}
      />

    </div>
  );
};

export default Reports;