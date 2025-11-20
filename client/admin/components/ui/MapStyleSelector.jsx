import React from 'react';

const MapStyleSelector = ({ 
  mapStyle, 
  onStyleChange, 
  mapStyles = {
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
  },
  position = { top: '1rem', right: '1rem' }
}) => {
  return (
    <div style={{
      position: 'absolute',
      top: position.top,
      right: position.right,
      zIndex: 1000,
      borderRadius: '4px',
      padding: '0.25rem',
      display: 'flex',
      gap: '0.5rem'
    }}>
      {Object.entries(mapStyles).map(([key, style]) => (
        <button
          key={key}
          onClick={() => onStyleChange(key)}
          style={{
            width: '2.5rem',
            height: '2.5rem',
            padding: '0.5rem',
            backgroundColor: mapStyle === key ? 'var(--dark-green)' : 'var(--white)',
            color: mapStyle === key ? 'white' : 'var(--dark-gray)',
            border: '1px solid var(--light-border)',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.53rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textShadow: '0 0 3px rgba(255, 255, 255, 0.5), 0 0 5px rgba(255, 255, 255, 0.5)'
          }}
        >
          {style.name}
        </button>
      ))}
    </div>
  );
};

export default MapStyleSelector;
