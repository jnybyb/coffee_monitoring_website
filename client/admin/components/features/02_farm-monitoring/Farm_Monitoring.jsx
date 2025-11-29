import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents } from 'react-leaflet';
import { RiAddLargeFill } from 'react-icons/ri';
import { CiImport } from 'react-icons/ci';
import { HiLocationMarker } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapDetails from './MapDetails';
import MapStyleSelector from '../../ui/MapStyleSelector';
import AddFarmPlotModal from './AddFarmPlotModal';
import PlotPreviewPopup from '../../ui/PlotPreviewPopup';
import { createLocationIcon } from '../../ui/LocationIcon.jsx';
import ImportDisplayPage from './ImportDisplayPage';
import LoadingModal from '../../ui/LoadingModal';
import AlertModal from '../../ui/AlertModal';
import { farmPlotsAPI, beneficiariesAPI, importAPI } from '../../../services/api';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Farm_Monitoring = () => {
  const navigate = useNavigate();
  const [mapStyle, setMapStyle] = useState('openstreetmap');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [farmPlots, setFarmPlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showImportPage, setShowImportPage] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedPlotId, setSelectedPlotId] = useState(null);
  const mapRef = useRef(null);
  const fileInputRef = useRef(null);
  const markerRefs = useRef({});

  // Fetch beneficiaries and farm plots on component mount
  useEffect(() => {
    fetchBeneficiaries();
    fetchFarmPlots();
  }, []);

  const fetchBeneficiaries = async () => {
    try {
      const data = await beneficiariesAPI.getAll();
      setBeneficiaries(data);
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      setError('Failed to load beneficiaries');
    }
  };

  const fetchFarmPlots = async () => {
    try {
      const data = await farmPlotsAPI.getAll();
      setFarmPlots(data);
    } catch (error) {
      console.error('Error fetching farm plots:', error);
      setError('Failed to load farm plots');
    }
  };

  // Store colors for each plot (generated randomly)
  const [plotColors] = useState(() => new Map());

  // Get or generate color for a plot
  const getPlotColor = (plotId) => {
    if (!plotColors.has(plotId)) {
      const greenShades = [
        '#2d7c4a', '#3d8b5a', '#4d9b6a', '#1f6b3a', '#0e5a2a',
        '#2e7d32', '#388e3c', '#43a047', '#4caf50', '#66bb6a'
      ];
      const randomColor = greenShades[Math.floor(Math.random() * greenShades.length)];
      plotColors.set(plotId, randomColor);
    }
    return plotColors.get(plotId);
  };

  // Function to order coordinates in a clockwise manner to avoid spider web effect
  const orderCoordinates = (coords) => {
    if (coords.length < 3) return coords;

    // Calculate center point
    let centerLat = 0, centerLng = 0;
    coords.forEach(coord => {
      centerLat += coord[0];
      centerLng += coord[1];
    });
    centerLat /= coords.length;
    centerLng /= coords.length;

    // Sort coordinates by angle from center
    return coords.slice().sort((a, b) => {
      const angleA = Math.atan2(a[0] - centerLat, a[1] - centerLng);
      const angleB = Math.atan2(b[0] - centerLat, b[1] - centerLng);
      return angleA - angleB;
    });
  };

  // Map style configurations
  const mapStyles = {
    openstreetmap: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      name: 'Street'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      name: 'Satellite'
    }
  };

  // Handle map style change
  const handleMapStyleChange = (style) => {
    setMapStyle(style);
  };

  // Handle add farm plot modal
  const handleAddFarmPlot = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  // Generate random green color for farm plots
  const generateRandomGreenColor = () => {
    const greenShades = [
      '#2d7c4a', '#3d8b5a', '#4d9b6a', '#1f6b3a', '#0e5a2a',
      '#2e7d32', '#388e3c', '#43a047', '#4caf50', '#66bb6a'
    ];
    return greenShades[Math.floor(Math.random() * greenShades.length)];
  };

  const handleSubmitFarmPlot = async (plotData) => {
    try {
      setIsLoading(true);
      
      // Prepare the data in the format expected by the server
      const farmPlotPayload = {
        beneficiaryId: plotData.beneficiaryId,
        coordinates: plotData.coordinates // Already converted to decimal by modal
      };
      
      // Call the API to create the farm plot
      const createdPlot = await farmPlotsAPI.create(farmPlotPayload);
      
      // Refresh the farm plots list
      await fetchFarmPlots();
      
      setIsLoading(false);
      // Don't close modal here - let the modal handle its own closing after showing success
      
      console.log('Farm plot created successfully:', createdPlot);
    } catch (error) {
      setIsLoading(false);
      console.error('Error saving farm plot:', error);
      setError(error.message || 'Failed to save farm plot');
      throw error; // Re-throw so modal can handle it
    }
  };

  const handleEditFarmPlot = async (plotData) => {
    try {
      // Prepare the data in the format expected by the server
      const farmPlotPayload = {
        beneficiaryId: plotData.beneficiaryId,
        coordinates: plotData.coordinates // Already converted to decimal by modal
      };
      
      // Call the API to update the farm plot
      await farmPlotsAPI.update(plotData.id, farmPlotPayload);
      
      // Refresh the farm plots list
      await fetchFarmPlots();
      
      console.log('Farm plot updated successfully:', plotData.id);
    } catch (error) {
      console.error('Error updating farm plot:', error);
      setError(error.message || 'Failed to update farm plot');
      throw error; // Re-throw so modal can handle it
    }
  };

  const handleViewAllFarmPlots = () => {
    // Store the desired tab in sessionStorage
    sessionStorage.setItem('reportsActiveTab', 'Farm Location');
    // Navigate to Reports page
    navigate('/reports');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
      await new Promise(resolve => setTimeout(resolve, 800));
      setUploadStage('cleansing');
      
      // Use the farm coordinates endpoint instead of general bulk import
      const response = await importAPI.uploadFarmCoordinates(file);
      
      console.log('Farm Coordinates Import API response:', response);
      
      // Validate that the imported data contains coordinates
      const previewData = response.previewData || [];
      const hasCoordinates = previewData.some(row => 
        (row.latitude && row.longitude) || 
        (row.lat && row.lng)
      );
      
      if (previewData.length === 0 || !hasCoordinates) {
        setUploading(false);
        setUploadStage('');
        setErrorMessage('The imported data does not contain location coordinates. Please import another file with valid coordinate data.');
        setShowErrorModal(true);
        event.target.value = '';
        return;
      }
      
      setUploadStage('success');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setImportedData(previewData);
      setImportErrors(response.errors || []);
      
      setUploading(false);
      setUploadStage('');
      setShowImportPage(true);
    } catch (error) {
      console.error('Import error:', error);
      setUploading(false);
      setUploadStage('');
      setErrorMessage(error.message || 'Failed to process Excel file. Please try again.');
      setShowErrorModal(true);
    } finally {
      event.target.value = '';
    }
  };

  // Component to handle map clicks to close popup
  const MapClickHandler = () => {
    useMapEvents({
      click: () => {
        // Close the currently open popup before clearing selection
        if (selectedPlotId && markerRefs.current[selectedPlotId]) {
          markerRefs.current[selectedPlotId].closePopup();
        }
        setSelectedPlotId(null);
      }
    });
    return null;
  };

  // Handle marker click
  const handleMarkerClick = (plotId, e) => {
    // Prevent map click event from firing
    L.DomEvent.stopPropagation(e);
    
    // If clicking the same marker, close it
    if (selectedPlotId === plotId) {
      // Close the popup before clearing selection
      if (markerRefs.current[plotId]) {
        markerRefs.current[plotId].closePopup();
      }
      setSelectedPlotId(null);
    } else {
      // Close previous popup if exists
      if (selectedPlotId && markerRefs.current[selectedPlotId]) {
        markerRefs.current[selectedPlotId].closePopup();
      }
      
      // Set new selected plot and open popup
      setSelectedPlotId(plotId);
      
      // Open the popup programmatically
      setTimeout(() => {
        if (markerRefs.current[plotId]) {
          markerRefs.current[plotId].openPopup();
        }
      }, 10);
    }
  };

  const handleImportSave = async (data) => {
    try {
      console.log('Saving imported farm plot data:', data);
      
      // Group coordinates by beneficiary/plot
      const plotGroups = new Map();
      
      data.coordinates.forEach(coord => {
        // Use beneficiaryName as the key if beneficiaryId is not available yet
        const key = coord.beneficiaryId || coord.beneficiaryName || coord.plotId;
        if (!plotGroups.has(key)) {
          plotGroups.set(key, {
            beneficiaryId: coord.beneficiaryId,
            beneficiaryName: coord.beneficiaryName,
            plotId: coord.plotId,
            hectares: coord.hectares,
            coordinates: []
          });
        }
        
        // Format coordinates as { lat, lng } for the backend
        plotGroups.get(key).coordinates.push({
          lat: coord.latitude,
          lng: coord.longitude
        });
      });
      
      console.log('Grouped plots:', Array.from(plotGroups.values()));
      
      // Save each plot with its coordinates
      for (const [key, plotData] of plotGroups) {
        // Skip if no beneficiaryId (user must have selected a beneficiary in the table)
        if (!plotData.beneficiaryId) {
          console.warn(`Skipping plot for ${plotData.beneficiaryName} - no beneficiary ID found`);
          continue;
        }
        
        if (plotData.coordinates.length > 0) {
          console.log('Creating farm plot for beneficiary:', plotData.beneficiaryId);
          await farmPlotsAPI.create({
            beneficiaryId: plotData.beneficiaryId,
            coordinates: plotData.coordinates,
            hectares: plotData.hectares
          });
        }
      }
      
      await fetchFarmPlots();
    } catch (error) {
      console.error('Save error:', error);
      throw error;
    }
  };

  return (
    <div style={{ 
      display: 'flex',
      width: '100%', 
      height: '100vh',
      overflow: 'hidden'
    }}>
      {/* Show Import Display Page if active */}
      {showImportPage ? (
        <ImportDisplayPage
          initialData={importedData}
          errors={importErrors}
          onSave={handleImportSave}
          onCancel={() => setShowImportPage(false)}
        />
      ) : (
        <>
          {/* Main Content Section */}
          <div style={{ 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}>
        {/* Header */}
        <div style={{ 
          padding: '1.6rem 1rem 1.7rem 1rem',
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
              Farm Monitoring
            </h2>
            <div style={{
              color: 'var(--dark-brown)',
              fontSize: '0.7rem',
              marginTop: '0.2rem',
              fontWeight: 500
            }}>
              View and manage farm plots on the interactive map
            </div>
          </div>
          {/* Action Buttons */}
          <div style={{ 
            display: 'flex',
            gap: '0.5rem'
          }}>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            <button
              onClick={handleImportClick}
              disabled={uploading}
              style={{
                padding: '0.4rem 1.5rem',
                backgroundColor: 'var(--white)',
                color: 'var(--dark-green)',
                border: '1px solid var(--dark-green)',
                borderRadius: '4px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontSize: '0.65rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: uploading ? 0.6 : 1,
                transition: 'all 0.1s ease',
              }}
              onMouseEnter={(e) => !uploading && (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => !uploading && (e.currentTarget.style.transform = 'scale(1)')}
              onMouseDown={(e) => !uploading && (e.currentTarget.style.transform = 'scale(1)')}
            >
              <CiImport size={15} />
              <span>{uploading ? 'Uploading...' : 'Import'}</span>
            </button>
            <button
              onClick={handleAddFarmPlot}
              style={{
                padding: '0.4rem 1.3rem',
                backgroundColor: 'var(--dark-green)',
                color: 'white',
                border: '1px solid var(--dark-green)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.65rem',
                fontWeight: '400',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.1s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <RiAddLargeFill size={10} />
              <span>Add Farm Plot</span>
            </button>
          </div>
        </div>
        
        {/* Side-by-side layout for map and details */}
        <div style={{ 
          display: 'flex',
          flex: 1,
          margin: '0 1rem 1rem 1rem',
          gap: '1rem'
        }}>
          {/* Main Map Visualization (63% width) */}
          <div style={{ 
            flex: 65,
            borderRadius: '8px',
            backgroundColor: 'var(--white)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Map Style Selector */}
            <MapStyleSelector 
              mapStyle={mapStyle}
              onStyleChange={handleMapStyleChange}
              mapStyles={mapStyles}
            />
            
            <div style={{ 
              height: '100%', 
              borderRadius: '3px', 
              overflow: 'hidden',
              border: '1px solid var(--light-border)'
            }}>
              <MapContainer 
                center={[7.243229871593815, 126.4151035317835]} 
                zoom={12} 
                style={{ 
                  width: '100%', 
                  height: '100%',
                  background: 'transparent'
                }}
                ref={mapRef}
              >
                <TileLayer
                  url={mapStyles[mapStyle].url}
                  attribution={mapStyles[mapStyle].attribution}
                />
                
                {/* Map click handler to close popup */}
                <MapClickHandler />
                
                {/* Map click handler to close popup */}
                <MapClickHandler />
                
                {/* Render actual farm plots from API */}
                {farmPlots.map(plot => {
                  // Check if coordinates exist and are valid
                  if (!plot.coordinates || plot.coordinates.length === 0) return null;
                  
                  // Ensure coordinates are in the correct format [lat, lng] for Leaflet
                  const validCoordinates = plot.coordinates.map(coord => [
                    parseFloat(coord.lat), 
                    parseFloat(coord.lng)
                  ]).filter(coord => !isNaN(coord[0]) && !isNaN(coord[1]));
                  
                  // Skip if no valid coordinates
                  if (validCoordinates.length === 0) return null;

                  // Order coordinates to form a proper polygon boundary
                  const orderedCoordinates = orderCoordinates(validCoordinates);
                  
                  const plotColor = getPlotColor(plot.id);
                  
                  // Calculate center point of the polygon
                  let centerLat = 0, centerLng = 0;
                  orderedCoordinates.forEach(coord => {
                    centerLat += coord[0];
                    centerLng += coord[1];
                  });
                  centerLat /= orderedCoordinates.length;
                  centerLng /= orderedCoordinates.length;
                  const centerPoint = [centerLat, centerLng];
                  
                  const isSelected = selectedPlotId === plot.id;
                  
                  return (
                    <React.Fragment key={plot.id}>
                      {/* Polygon - only render when selected */}
                      {isSelected && (
                        <Polygon 
                          positions={orderedCoordinates} 
                          color={plotColor}
                          fillColor={plotColor}
                          fillOpacity={0.2}
                          weight={3}
                          opacity={1}
                        />
                      )}
                      
                      {/* Boundary point markers - visible only when selected */}
                      {isSelected && orderedCoordinates.map((coord, index) => (
                        <Marker
                          key={`${plot.id}-point-${index}`}
                          position={coord}
                          icon={L.divIcon({
                            className: 'boundary-point-marker',
                            html: `<div style="
                              width: 12px;
                              height: 12px;
                              background-color: white;
                              border: 3px solid ${plotColor};
                              border-radius: 50%;
                              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                            "></div>`,
                            iconSize: [12, 12],
                            iconAnchor: [6, 6]
                          })}
                        />
                      ))}
                      
                      {/* Marker at the center of the plot - always visible */}
                      <Marker 
                        key={`${plot.id}-center`}
                        position={centerPoint}
                        icon={createLocationIcon(plot.beneficiaryPicture, plot.beneficiaryName)}
                        ref={(ref) => {
                          if (ref) {
                            markerRefs.current[plot.id] = ref;
                          }
                        }}
                        eventHandlers={{
                          click: (e) => handleMarkerClick(plot.id, e.originalEvent)
                        }}
                      >
                        <Popup 
                          closeButton={false} 
                          className="custom-popup"
                          autoClose={false}
                          closeOnClick={false}
                        >
                          <PlotPreviewPopup plot={plot} />
                        </Popup>
                      </Marker>
                    </React.Fragment>
                  );
                })}
              </MapContainer>
            </div>
          </div>
          
          {/* Map Details Component (37% width) */}
          <div style={{ 
            flex: 35,
            borderRadius: '8px',
            backgroundColor: 'var(--white)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: '1px solid var(--light-border)',
            overflow: 'hidden'
          }}>
            <MapDetails 
              beneficiaries={beneficiaries} 
              farmPlots={farmPlots} 
              onViewAll={handleViewAllFarmPlots}
              onEditPlot={handleEditFarmPlot}
              onDeleteSuccess={fetchFarmPlots}
            />
          </div>
        </div>
      </div>

      {/* Add Farm Plot Modal */}
      <AddFarmPlotModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleSubmitFarmPlot}
        beneficiaries={beneficiaries}
        selectedBeneficiary={null}
        isLoading={isLoading}
      />

      {/* Error Modal */}
      <AlertModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        type="error"
        title="Import Error"
        message={errorMessage}
        confirmText="OK"
        showCancel={false}
        onConfirm={() => setShowErrorModal(false)}
        maxWidth={420}
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
      </>
      )}
    </div>
  );
};

export default Farm_Monitoring;