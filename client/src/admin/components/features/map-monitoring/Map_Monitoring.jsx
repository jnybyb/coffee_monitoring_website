import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, ScaleControl, Polygon } from 'react-leaflet';
import { FaRegIdCard } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import { LuLandPlot } from 'react-icons/lu';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { beneficiariesAPI, farmPlotsAPI } from '../../../services/api';
import AddFarmPlotModal from './AddFarmPlotModal';
import EditFarmPlotModal from './EditFarmPlotModal';
import ViewFarmPlotModal from './ViewFarmPlotModal';
import DeleteFarmPlotModal from './DeleteFarmPlotModal';
import { ImportButton } from '../../ui/BeneficiaryButtons';
import { RiAddLargeFill } from 'react-icons/ri';
import AlertModal from '../../ui/AlertModal';
import LoadingModal from '../../ui/LoadingModal';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom corner marker icon
const createCornerMarkerIcon = (color) => {
  return L.divIcon({
    className: 'custom-corner-marker',
    html: `<div style="
      width: 12px; 
      height: 12px; 
      background-color: ${color}; 
      border: 2px solid white; 
      border-radius: 50%; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

// Custom location marker icon with beneficiary profile picture
const createLocationMarkerIcon = (beneficiaryPicture, beneficiaryName, plotColor) => {
  // Generate initials from beneficiary name as fallback
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(beneficiaryName);
  
  return L.divIcon({
    className: 'custom-location-marker',
    html: `<div style="
      width: 50px; 
      height: 65px; 
      position: relative;
    ">
      <!-- Pin shape using border-radius for teardrop shape -->
      <div style="
        width: 50px; 
        height: 50px; 
        background-color: ${plotColor || '#2d7c4a'};
        border-radius: 50% 50% 50% 0; 
        transform: rotate(-45deg);
        position: absolute;
        top: 0;
        left: 0;
      "></div>
      
      <!-- Profile picture circle - positioned without rotation to stay upright -->
      <div style="
        width: 38px; 
        height: 38px; 
        background-color: white; 
        border: 1px solid ${plotColor || '#2d7c4a'}; 
        border-radius: 50%; 
        position: absolute;
        top: 6px;
        left: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        z-index: 1;
      ">
        ${beneficiaryPicture ? 
          `<img src="http://localhost:5000${beneficiaryPicture}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />` : 
          `<div style="
            width: 100%; 
            height: 100%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            background-color: #f8f9fa; 
            color: #6c757d; 
            font-weight: bold; 
            font-size: 14px; 
            font-family: Arial, sans-serif;
          ">${initials}</div>`
        }
      </div>
      
      <!-- Pin base circle -->
      <div style="
        width: 6px; 
        height: 6px; 
        background-color: ${plotColor || '#2d7c4a'}; 
        border-radius: 50%; 
        position: absolute;
        bottom: 0;
        left: 22px;
        transform: translateX(-50%);
      "></div>
    </div>`,
    iconSize: [50, 65],
    iconAnchor: [25, 65]
  });
};

// Calculate center point of polygon coordinates
const calculatePolygonCenter = (coordinates) => {
  if (!coordinates || coordinates.length === 0) return null;
  
  let sumLat = 0;
  let sumLng = 0;
  
  coordinates.forEach(coord => {
    sumLat += parseFloat(coord.lat);
    sumLng += parseFloat(coord.lng);
  });
  
  return {
    lat: sumLat / coordinates.length,
    lng: sumLng / coordinates.length
  };
};

const MapMonitoring = () => {
  // Default coordinates for Taocanga, Manay, Davao Oriental
  const defaultLocation = {
    lat: 7.2167, // Approximate latitude for Manay, Davao Oriental
    lng: 126.3333, // Approximate longitude for Manay, Davao Oriental
    zoom: 12
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [farmPlots, setFarmPlots] = useState([]); // Store farm plots data
  const [isCreatingPlot, setIsCreatingPlot] = useState(false); // Loading state for plot creation
  
  const [currentMapLayer, setCurrentMapLayer] = useState('street'); // Current map layer (Default)
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [selectedPlotIndex, setSelectedPlotIndex] = useState(null);

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('Please wait while we update your farm data.');
  const [loadingTitle, setLoadingTitle] = useState('Updating...');

  const styles = {
    container: {
      padding: '1.5rem',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 78px)',
      backgroundColor: '#f8f9fa',
      gap: '0.5rem',
      overflow: 'hidden'
    },
    detailsPanel: {
      width: '360px',
      minWidth: '320px',
      maxWidth: '420px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      height: '100%',
      minHeight: 0,
      overflow: 'hidden'
    },
    mapPanel: {
      flex: 1, // Takes the remaining space (7/8)
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      overflow: 'hidden'
    },
    title: {
      color: '#2c5530',
      fontSize: '1.4rem',
      fontWeight: '700',
      marginBottom: '0.2rem'
    },
    subtitle: {
      color: '#6c757d',
      fontSize: '0.60rem',
      margin: '0'
    },
    infoPanel: {
      backgroundColor: 'white',
      padding: '1rem',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e8f5e8'
    },
    infoTitle: {
      color: '#2c5530',
      fontSize: '1rem',
      fontWeight: '600',
      marginBottom: '0.5rem'
    },
    infoText: {
      color: '#6c757d',
      fontSize: '0.8rem',
      lineHeight: '1.4'
    },
    controlsPanel: {
      backgroundColor: 'white',
      padding: '1rem',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e8f5e8',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    },
    controlButton: {
      padding: '0.5rem 1.25rem',
      backgroundColor: '#2d7c4a',
      color: 'white',
      border: 'none',
      borderRadius: '7px',
      cursor: 'pointer',
      fontSize: '0.7rem',
      fontWeight: '500',
      transition: 'background-color 0.2s',
      width: '100%'
    },
    // Removed map style buttons
    mapContainer: {
      flex: 1,
      backgroundColor: 'white',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e8f5e8',
      position: 'relative'
    },
    map: {
      width: '100%',
      height: '100%'
    },
    mapLayerControls: {
      position: 'absolute',
      bottom: '15px', // sit above Leaflet attribution like Google Maps
      right: '5px',
      zIndex: 1000,
      padding: '0',
      overflow: 'hidden'
    },
    // New image-tile based map type controls
    mapTypeContainer: {
      padding: '7px',
      width: '180px'
    },
    mapTypeTitle: {
      fontSize: '6px',
      color: '#5f6368',
      marginBottom: '4px'
    },
    mapTypeOptions: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '5px'
    },
    mapTypeItem: {
      border: '2px solid transparent',
      borderRadius: '7px',
      overflow: 'hidden',
      cursor: 'pointer',
      backgroundColor: '#fff',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      position: 'relative'
    },
    mapTypeGradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '22px',
      background: 'linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0))',
      pointerEvents: 'none'
    },
    mapTypeItemSelected: {
      border: '2px solid #1a73e8',
      boxShadow: '0 0 0 2px rgba(26,115,232,0.15)'
    },
    mapTypeImage: {
      width: '100%',
      height: '48px',
      display: 'block',
      objectFit: 'cover'
    },
    mapTypeLabel: {
      position: 'absolute',
      left: '50%',
      bottom: '6px',
      transform: 'translateX(-50%)',
      color: '#ffffff',
      padding: '0 3px',
      borderRadius: '10px',
      fontSize: '9.5px',
      fontWeight: '400',
      lineHeight: '1',
      pointerEvents: 'none'
    },
    // removed icon-based controls in favor of text buttons like Google Maps
    statsPanel: {
      backgroundColor: 'white',
      padding: '1rem',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e8f5e8',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      overflow: 'hidden'
    },
    statItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.5rem 0',
      borderBottom: '1px solid #f0f0f0',
      gap: '1rem'
    },
    statLabel: {
      color: '#6c757d',
      fontSize: '1rem',
      fontWeight: '600'
    },
    statValue: {
      color: '#2c5530',
      fontSize: '1rem',
      fontWeight: '700',
      paddingRight: '0.5rem'
    },
    plotsListPanel: {
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid #f0f0f0'
    },
    plotsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    plotsListContainer: {
      flex: 1,
      overflowY: 'auto',
      paddingRight: '0.5rem',
      marginTop: '0.5rem',
      minHeight: 0,
      maxHeight: '100%',
      scrollbarWidth: 'thin',
      scrollbarColor: '#2d7c4a #f0f0f0'
    },
    plotItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem',
      borderBottom: '1px solid #e8f5e8',
      border: '1px solid #e8f5e8',
      borderRadius: '6px',
      marginBottom: '0.5rem',
      gap: '1rem'
    },
    plotNumber: {
      fontSize: '0.7rem',
      fontWeight: '600',
      color: '#2c5530'
    },
    farmerInfo: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      flex: 1
    },
    farmerAvatar: {
      width: '28px',
      height: '28px',
      backgroundColor: '#2d7c4a',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '0.6rem',
      fontWeight: '600',
      flexShrink: 0,
      marginTop: '2px'
    },
    farmerDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.2rem',
      flex: 1
    },
    farmerName: {
      fontSize: '0.7rem',
      fontWeight: '500',
      color: '#343a40'
    },
    beneficiaryId: {
      fontSize: '0.6rem',
      color: '#6c757d'
    },
    plotActions: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      minWidth: '30px',
      marginTop: '2px'
    },
    threeDotsButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.1rem',
      color: '#6c757d',
      padding: '0.25rem',
      borderRadius: '4px',
      transition: 'all 0.2s',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ':hover': {
        backgroundColor: '#f0f0f0',
        color: '#2d7c4a'
      }
    }
  };

  // Map tile layer options
  const mapLayers = {
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    },
    hybrid: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    },
    terrain: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    },
    street: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  };

  // Fetch beneficiaries and farm plots on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starting to fetch data...');
        
        // Fetch beneficiaries and farm plots in parallel
        const [beneficiariesData, farmPlotsData] = await Promise.all([
          beneficiariesAPI.getAll(),
          farmPlotsAPI.getAll()
        ]);
        
        console.log('Fetched beneficiaries:', beneficiariesData);
        console.log('Number of beneficiaries:', beneficiariesData?.length || 0);
        console.log('Beneficiaries structure:', beneficiariesData?.[0] || 'No beneficiaries');
        console.log('Fetched farm plots:', farmPlotsData);
        
        setBeneficiaries(beneficiariesData || []);
        setFarmPlots(farmPlotsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch data: ' + error.message);
      }
    };

    fetchData();
  }, []);

  // Handle submit from AddFarmPlotModal
  const handleAddFarmPlot = async (data) => {
    if (isCreatingPlot) return; // Prevent multiple submissions
    
    try {
      setLoadingTitle('Plotting...');
      setLoadingMessage('Please wait while we plot your farm.');
      setIsCreatingPlot(true);
      console.log('Creating farm plot with data:', data);
      
      // Prepare the data for the backend
      const farmPlotData = {
        beneficiaryId: data.beneficiaryId,
        plotNumber: data.plotNumber,
        color: getRandomColor(),
        coordinates: data.coordinates
      };

      console.log('Sending farm plot data to server:', farmPlotData);
      
      const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      const startTime = Date.now();
      
      // Save to backend
      const newPlot = await farmPlotsAPI.create(farmPlotData);
      
      console.log('Server response for new plot:', newPlot);
      console.log('Response type:', typeof newPlot);
      console.log('Response keys:', Object.keys(newPlot || {}));
      
      // Validate the response has required fields
      if (!newPlot || !newPlot.id || !newPlot.coordinates) {
        console.error('Invalid plot response:', newPlot);
        throw new Error('Invalid response from server: missing required fields');
      }
      
      // Add to local state
      const updatedPlots = [...farmPlots, newPlot];
      console.log('Updated plots array:', updatedPlots);
      setFarmPlots(updatedPlots);
      console.log('Added farm plot with boundaries and corner markers:', newPlot);
      
      // Ensure minimum 2 seconds of loading
      const elapsed = Date.now() - startTime;
      if (elapsed < 2000) {
        await sleep(2000 - elapsed);
      }
      
      // Close loading and show success modal
      setIsCreatingPlot(false);
      setSuccessMessage('Farm plot added successfully!');
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error creating farm plot:', error);
      alert('Failed to create farm plot: ' + (error.message || 'Unknown error'));
      setIsCreatingPlot(false);
    }
  };

  // Handle submit from EditFarmPlotModal
  const handleEditFarmPlot = async (data) => {
    if (isCreatingPlot) return; // Prevent multiple submissions
    
    try {
      setLoadingTitle('Updating...');
      setLoadingMessage('Please wait while we update your farm data.');
      setIsCreatingPlot(true);
      console.log('Updating farm plot with data:', data);
      
      // Prepare the data for the backend
      const farmPlotData = {
        id: data.id,
        beneficiaryId: data.beneficiaryId,
        plotNumber: data.plotNumber,
        color: data.color,
        coordinates: data.coordinates
      };

      console.log('Sending updated farm plot data to server:', farmPlotData);
      
      const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      const startTime = Date.now();
      
      // Update in backend
      const updatedPlot = await farmPlotsAPI.update(data.id, farmPlotData);
      
      console.log('Server response for updated plot:', updatedPlot);
      
      // Validate the response has required fields
      if (!updatedPlot || !updatedPlot.id || !updatedPlot.coordinates) {
        console.error('Invalid plot response:', updatedPlot);
        throw new Error('Invalid response from server: missing required fields');
      }
      
      // Update local state
      const updatedPlots = farmPlots.map(plot => 
        plot.id === data.id ? updatedPlot : plot
      );
      setFarmPlots(updatedPlots);
      console.log('Updated farm plot:', updatedPlot);
      
      // Ensure minimum 2 seconds of loading
      const elapsed = Date.now() - startTime;
      if (elapsed < 2000) {
        await sleep(2000 - elapsed);
      }
      
      // Close loading and show success modal
      setIsCreatingPlot(false);
      setSuccessMessage('Farm plot updated successfully!');
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error updating farm plot:', error);
      alert('Failed to update farm plot: ' + (error.message || 'Unknown error'));
      setIsCreatingPlot(false);
    }
  };

  // Generate random color for plot boundaries
  const getRandomColor = () => {
    const colors = ['#2d7c4a', '#28a745', '#20c997', '#17a2b8', '#6f42c1', '#e83e8c', '#fd7e14', '#ffc107'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Open View Modal for a plot
  const handleOpenViewModal = (plot, index) => {
    setSelectedPlot(plot);
    setSelectedPlotIndex(index);
    setShowViewModal(true);
  };

  // Handle delete from View modal
  const handleDeletePlot = async (plot, index) => {
    try {
      setLoadingTitle('Deleting...');
      setLoadingMessage('Please wait while we delete your farm plot.');
      setIsCreatingPlot(true);
      console.log('Deleting farm plot:', plot);
      
      const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      const startTime = Date.now();
      
      // Delete from backend
      await farmPlotsAPI.delete(plot.id);
      
      // Remove from local state
      setFarmPlots(prev => prev.filter((_, i) => i !== index));
      setShowViewModal(false);
      setShowDeleteModal(false); // Close delete modal after successful deletion
      
      // Ensure minimum 2 seconds of loading
      const elapsed = Date.now() - startTime;
      if (elapsed < 2000) {
        await sleep(2000 - elapsed);
      }
      
      // Close loading and show success modal
      setIsCreatingPlot(false);
      setSuccessMessage('Farm plot deleted successfully!');
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error deleting farm plot:', error);
      alert('Failed to delete farm plot: ' + (error.message || 'Unknown error'));
      setIsCreatingPlot(false);
    }
  };

  // Handle edit from View modal
  const handleEditPlot = (plot, index) => {
    setSelectedPlot(plot);
    setSelectedPlotIndex(index);
    setShowEditModal(true);
    setShowViewModal(false); // Close view modal when opening edit modal
  };

  return (
    <>
      <style>
        {`
          .plots-list-container::-webkit-scrollbar {
            width: 6px;
          }
          .plots-list-container::-webkit-scrollbar-track {
            background: #f0f0f0;
            border-radius: 3px;
          }
          .plots-list-container::-webkit-scrollbar-thumb {
            background: #2d7c4a;
            border-radius: 3px;
          }
          .plots-list-container::-webkit-scrollbar-thumb:hover {
            background: #1e5a3a;
          }
        `}
      </style>
      <div style={styles.container}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={styles.title}>Map Monitoring</h2>
          <p style={styles.subtitle}>Farm plot locations and boundary monitoring</p>
        </div>
      </div>
      {/* Map and Details Section */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        gap: '1rem', 
        flex: 1,
        minHeight: 0,
        alignItems: 'stretch',
        overflow: 'hidden'
      }}>
        <div style={styles.mapPanel}>
          <div style={styles.mapContainer}>
            <MapContainer 
              center={[defaultLocation.lat, defaultLocation.lng]} 
              zoom={defaultLocation.zoom} 
              style={styles.map}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution={mapLayers[currentMapLayer].attribution}
                url={mapLayers[currentMapLayer].url}
              />

              {/* Farm Plot Boundaries and Corner Markers */}
              {farmPlots.map((plot, index) => {
                // Defensive check to prevent crashes
                if (!plot || !plot.coordinates || !Array.isArray(plot.coordinates) || plot.coordinates.length === 0) {
                  console.warn('Invalid plot data:', plot);
                  return null;
                }
                
                const centerPoint = calculatePolygonCenter(plot.coordinates);
                
                return (
                  <React.Fragment key={plot.id || `plot-${index}`}>
                    {/* Plot Boundary Polygon */}
                    <Polygon
                      positions={plot.coordinates.map(coord => [parseFloat(coord.lat), parseFloat(coord.lng)])}
                      pathOptions={{
                        color: plot.color || '#2d7c4a',
                        fillColor: plot.color || '#2d7c4a',
                        fillOpacity: 0.3,
                        weight: 2
                      }}
                    >
                      <Popup>
                        <div>
                          <b>{plot.beneficiaryName || 'Unknown Beneficiary'}</b><br />
                          <small>{plot.plotNumber || `Plot #${index + 1}`}</small><br />
                          <small>{plot.address || 'Address not available'}</small>
                        </div>
                      </Popup>
                    </Polygon>

                    {/* Corner Markers */}
                    {plot.coordinates.map((coord, coordIndex) => {
                      if (!coord || coord.lat === undefined || coord.lng === undefined) {
                        return null;
                      }
                      return (
                        <Marker
                          key={`${plot.id || index}-corner-${coordIndex}`}
                          position={[parseFloat(coord.lat), parseFloat(coord.lng)]}
                          icon={createCornerMarkerIcon(plot.color || '#2d7c4a')}
                        >
                          <Popup>
                            <div>
                              <b>Corner Point {coordIndex + 1}</b><br />
                              <small>{plot.beneficiaryName || 'Unknown Beneficiary'}</small><br />
                              <small>Lat: {coord.lat}</small><br />
                              <small>Lng: {coord.lng}</small>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}

                    {/* Location Marker with Beneficiary Profile at Center */}
                    {centerPoint && (
                      <Marker
                        key={`${plot.id}-location`}
                        position={[centerPoint.lat, centerPoint.lng]}
                        icon={createLocationMarkerIcon(plot.beneficiaryPicture, plot.beneficiaryName, plot.color)}
                      >
                        <Popup>
                          <div style={{ minWidth: '260px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                                width: '50px',
                                height: '50px',
                                backgroundColor: '#f1f3f5',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#6c757d',
                                fontSize: '12px',
                                  fontWeight: 'bold',
                                overflow: 'hidden',
                                flexShrink: 0
                                }}>
                                  {plot.beneficiaryPicture ? (
                                    <img 
                                      src={`http://localhost:5000${plot.beneficiaryPicture}`} 
                                      alt="Profile" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  ) : (
                                  plot.beneficiaryName ? plot.beneficiaryName.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 2) : '??'
                                  )}
                                </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ fontWeight: 700, color: '#2d7c4a', fontSize: '12px' }}>
                                  {plot.beneficiaryName || 'Unknown Beneficiary'}
                                  </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#495057', fontSize: '10px' }}>
                                  <FaRegIdCard size={11} />
                                  <span>{plot.beneficiaryId || 'N/A'}</span>
                                  </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: '#495057', fontSize: '10px' }}>
                                  <FaLocationDot size={11} style={{ marginTop: '1px' }} />
                                  <span>{plot.address || 'Address not available'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#495057', fontSize: '10px' }}>
                                  <LuLandPlot size={11} />
                                  <span>{`Plot #${(String(plot.plotNumber || '').match(/\d+/) || [])[0] || (index + 1)}`}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </React.Fragment>
                );
              })}

              <ScaleControl />
            </MapContainer>
            
            {/* Map Type controls */}
            <div style={styles.mapLayerControls}>
              <div style={styles.mapTypeContainer}>
                <div style={styles.mapTypeOptions}>
                  <div
                    role="button"
                    onClick={() => setCurrentMapLayer('street')}
                    style={{
                      ...styles.mapTypeItem,
                      ...(currentMapLayer === 'street' ? styles.mapTypeItemSelected : {})
                    }}
                    title="Default"
                  >
                    <img
                      style={styles.mapTypeImage}
                      src="https://tile.openstreetmap.org/6/33/23.png"
                      alt="Default"
                    />
                    <div style={styles.mapTypeGradient}></div>
                    <div style={styles.mapTypeLabel}>Default</div>
                  </div>
                  <div
                    role="button"
                    onClick={() => setCurrentMapLayer('satellite')}
                    style={{
                      ...styles.mapTypeItem,
                      ...(currentMapLayer === 'satellite' ? styles.mapTypeItemSelected : {})
                    }}
                    title="Satellite"
                  >
                    <img
                      style={styles.mapTypeImage}
                      src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/6/23/33"
                      alt="Satellite"
                    />
                    <div style={styles.mapTypeGradient}></div>
                    <div style={styles.mapTypeLabel}>Satellite</div>
                  </div>
                  <div
                    role="button"
                    onClick={() => setCurrentMapLayer('terrain')}
                    style={{
                      ...styles.mapTypeItem,
                      ...(currentMapLayer === 'terrain' ? styles.mapTypeItemSelected : {})
                    }}
                    title="Terrain"
                  >
                    <img
                      style={styles.mapTypeImage}
                      src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/6/23/33"
                      alt="Terrain"
                    />
                    <div style={styles.mapTypeGradient}></div>
                    <div style={styles.mapTypeLabel}>Terrain</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Details Panel */}
        <div style={styles.detailsPanel}>
          {/* Top controls: Add + Import side-by-side */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '100%' }}>
              <ImportButton 
                onClick={() => {/* hook up import modal/flow here */}}
                style={{ 
                  width: '100%', 
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.7rem',
                  borderRadius: '7px'
                }}
              />
            </div>
            <button 
              style={{ ...styles.controlButton, width: '100%' }}
              onClick={() => setShowAddModal(true)}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <RiAddLargeFill size={12} />
                <span>Add Farm Plot</span>
              </span>
            </button>
          </div>
          
          {/* Farm Plots Summary and List */}
          <div style={styles.statsPanel}>
            <div style={styles.statItem}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span style={{...styles.statLabel, color: '#1a3d1f', fontWeight: '700'}}>Farm Plots</span>
                <span style={styles.statValue}>{farmPlots?.length || 0}</span>
              </div>
            </div>
            
            {/* Plots List */}
            {farmPlots && farmPlots.length > 0 && (
              <div style={styles.plotsListContainer} className="plots-list-container">
                {farmPlots.map((plot, index) => (
                  <div 
                    key={plot.id || index} 
                    style={{...styles.plotItem, cursor: 'pointer'}}
                    onClick={() => handleOpenViewModal(plot, index)}
                  >
                    <div style={styles.farmerInfo}>
                      <div style={{
                        ...styles.farmerAvatar,
                        backgroundColor: '#f8f9fa',
                        color: '#6c757d',
                        overflow: 'hidden'
                      }}>
                        {plot.beneficiaryPicture ? (
                          <img 
                            src={`http://localhost:5000${plot.beneficiaryPicture}`} 
                            alt="Profile" 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          plot.beneficiaryName ? 
                            plot.beneficiaryName.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2) : 
                            '??'
                        )}
                      </div>
                      <div style={styles.farmerDetails}>
                        <div style={styles.farmerName}>{plot.beneficiaryName || 'Unknown Farmer'}</div>
                      <div style={styles.beneficiaryId}>ID: {plot.beneficiaryId || 'N/A'}</div>
                      </div>
                    </div>
                    <div style={styles.plotNumber}>Plot #{index + 1}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Add Farm/Plot Modal */}
      <AddFarmPlotModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddFarmPlot}
        beneficiaries={beneficiaries}
        isLoading={isCreatingPlot}
      />
      {/* View Farm/Plot Modal */}
      <ViewFarmPlotModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        plot={selectedPlot}
        plotIndex={selectedPlotIndex}
        onEdit={handleEditPlot}
        onDelete={(plot, index) => {
          setSelectedPlot(plot);
          setSelectedPlotIndex(index);
          setShowDeleteModal(true);
        }}
        otherPlots={farmPlots}
      />
      
      {/* Edit Farm/Plot Modal */}
      <EditFarmPlotModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditFarmPlot}
        plot={selectedPlot}
        beneficiaries={beneficiaries}
        isLoading={isCreatingPlot}
        plotIndex={selectedPlotIndex}
      />
      
      {/* Delete Farm/Plot Modal */}
      <DeleteFarmPlotModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => handleDeletePlot(selectedPlot, selectedPlotIndex)}
        plot={selectedPlot}
        plotIndex={selectedPlotIndex}
        isLoading={isCreatingPlot}
      />
      
      {/* Success Modal */}
      <AlertModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="success"
        title="Success!"
        message={successMessage}
        autoClose={true}
        autoCloseDelay={1700}
      />
      
      {/* Loading Modal */}
      <LoadingModal
        isOpen={isCreatingPlot}
        title={loadingTitle}
        message={loadingMessage}
        dismissible={false}
      />
      
      </div>
    </>
  );
};

export default MapMonitoring; 
