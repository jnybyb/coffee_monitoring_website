import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import { RiAddLargeFill, RiUploadFill } from 'react-icons/ri';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapDetails from './MapDetails';
import MapStyleSelector from '../../ui/MapStyleSelector';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Farm_Monitoring = () => {
  const [mapStyle, setMapStyle] = useState('openstreetmap');
  const mapRef = useRef(null);

  // Sample farm plot data (this would come from API in a real implementation)
  const sampleFarmPlots = [
    { id: 1, name: 'Farm Plot A', position: [7.2907, 127.1827] },
    { id: 2, name: 'Farm Plot B', position: [7.3907, 127.2827] },
    { id: 3, name: 'Farm Plot C', position: [7.4907, 127.3827] },
  ];

  // Sample polygon for farm area boundary
  const farmBoundary = [
    [7.2907, 127.1827],
    [7.3907, 127.2827],
    [7.4907, 127.3827],
    [7.3907, 127.0827]
  ];

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
    },
    terrain: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
      name: 'Terrain'
    },
  };

  // Handle map style change
  const handleMapStyleChange = (style) => {
    setMapStyle(style);
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
        {/* Header - Keeping completely unchanged */}
        <div style={{ 
          padding: '1.6rem 1rem 1.7rem 1rem',
          backgroundColor: 'var(--white)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end' // Align items to the bottom
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
              style={{
                padding: '0.4rem 1.5rem',
                backgroundColor: 'var(--white)',
                color: 'var(--dark-green)',
                border: '1px solid var(--dark-green)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.65rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <RiUploadFill size={10} />
              <span>Import</span>
            </button>
            <button
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
              }}
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
                center={[7.1907, 127.1827]} 
                zoom={8} 
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
                
                {/* Sample markers for farm plots */}
                {sampleFarmPlots.map(plot => (
                  <Marker key={plot.id} position={plot.position}>
                    <Popup>
                      <b>{plot.name}</b><br />
                      Farm Plot #{plot.id}
                    </Popup>
                  </Marker>
                ))}
                
                {/* Sample polygon for farm boundary */}
                <Polygon 
                  positions={farmBoundary} 
                  color="#2d7c4a"
                  fillColor="#2d7c4a"
                  fillOpacity={0.3}
                >
                  <Popup>
                    Farm Area Boundary
                  </Popup>
                </Polygon>
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
            <MapDetails />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Farm_Monitoring;