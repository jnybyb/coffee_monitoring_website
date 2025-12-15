import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents } from 'react-leaflet';
import { RiAddLargeFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapDetails from './MapDetails';
import MapStyleSelector from '../../ui/MapStyleSelector';
import AddFarmPlotModal from './AddFarmPlotModal';
import PlotPreviewPopup from '../../ui/PlotPreviewPopup';
import { createLocationIcon } from '../../ui/LocationIcon.jsx';
import { farmPlotsAPI, beneficiariesAPI } from '../../../services/api';
import { mapStyles } from '../../../utils/mapStyleConfig.js';

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
  const [selectedPlotId, setSelectedPlotId] = useState(null);
  const mapRef = useRef(null);
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
    }
  };

  const fetchFarmPlots = async () => {
    try {
      const data = await farmPlotsAPI.getAll();
      setFarmPlots(data);
    } catch (error) {
      console.error('Error fetching farm plots:', error);
    }
  };

  // Store colors for each plot - uses Map to maintain consistent colors across renders
  const [plotColors] = useState(() => new Map());

  // Assign random green shade to each plot for visual distinction on map
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

  // Sort coordinates clockwise from center to ensure proper polygon rendering without self-intersections
  const orderCoordinates = (coords) => {
    if (coords.length < 3) return coords;

    // Calculate center point of all coordinates
    let centerLat = 0, centerLng = 0;
    coords.forEach(coord => {
      centerLat += coord[0];
      centerLng += coord[1];
    });
    centerLat /= coords.length;
    centerLng /= coords.length;

    // Sort by angle from center to ensure proper polygon shape
    return coords.slice().sort((a, b) => {
      const angleA = Math.atan2(a[0] - centerLat, a[1] - centerLng);
      const angleB = Math.atan2(b[0] - centerLat, b[1] - centerLng);
      return angleA - angleB;
    });
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



  const handleSubmitFarmPlot = async (plotData) => {
    try {
      // Prepare the data in the format expected by the server
      const farmPlotPayload = {
        beneficiaryId: plotData.beneficiaryId,
        coordinates: plotData.coordinates // Already converted to decimal by modal
      };
      
      // Call the API to create the farm plot
      await farmPlotsAPI.create(farmPlotPayload);
      
      // Refresh the farm plots list
      await fetchFarmPlots();
    } catch (error) {
      console.error('Error saving farm plot:', error);
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
      throw error; // Re-throw so modal can handle it
    }
  };

  const handleViewAllFarmPlots = () => {
    sessionStorage.setItem('reportsActiveTab', 'Farm Location');
    navigate('/reports');
  };

  // Close popup when clicking on map background
  const MapClickHandler = () => {
    useMapEvents({
      click: () => {
        if (selectedPlotId && markerRefs.current[selectedPlotId]) {
          markerRefs.current[selectedPlotId].closePopup();
        }
        setSelectedPlotId(null);
      }
    });
    return null;
  };

  // Toggle plot selection and popup display
  const handleMarkerClick = (plotId, e) => {
    L.DomEvent.stopPropagation(e);
    
    if (selectedPlotId === plotId) {
      if (markerRefs.current[plotId]) {
        markerRefs.current[plotId].closePopup();
      }
      setSelectedPlotId(null);
    } else {
      if (selectedPlotId && markerRefs.current[selectedPlotId]) {
        markerRefs.current[selectedPlotId].closePopup();
      }
      
      setSelectedPlotId(plotId);
      
      // 10ms delay allows Leaflet to process marker state before opening popup
      setTimeout(() => {
        if (markerRefs.current[plotId]) {
          markerRefs.current[plotId].openPopup();
        }
      }, 10);
    }
  };

  return (
    <div style={{ 
      display: 'flex',
      width: '100%', 
      height: '100vh',
      overflow: 'hidden'
    }}>
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
                
                {/* Render farm plots with polygons and markers */}
                {farmPlots.map(plot => {
                  if (!plot.coordinates || plot.coordinates.length === 0) return null;
                  
                  // Convert coordinates to Leaflet format [lat, lng]
                  const validCoordinates = plot.coordinates.map(coord => [
                    parseFloat(coord.lat), 
                    parseFloat(coord.lng)
                  ]).filter(coord => !isNaN(coord[0]) && !isNaN(coord[1]));
                  
                  if (validCoordinates.length === 0) return null;

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
      />
    </div>
  );
};

export default Farm_Monitoring;