import React from 'react';
import streetImg from '../../../assets/images/mapstyles/street.png';
import satelliteImg from '../../../assets/images/mapstyles/satellite.png';

const MapStyleSelector = ({
  mapStyle,
  onStyleChange,
  position = { top: '1rem', right: '1rem' },
}) => {
  const styles = [
    { key: 'openstreetmap', image: streetImg, name: 'Street' },
    { key: 'satellite', image: satelliteImg, name: 'Satellite' },
  ];

  return (
    <div style={{
      position: 'absolute',
      top: position.top,
      right: position.right,
      zIndex: 1000,
      display: 'flex',
      gap: '0.5rem',
    }}>
      {styles.map(({ key, image, name }) => {
        const isActive = mapStyle === key;

        return (
          <button
            key={key}
            onClick={() => onStyleChange(key)}
            style={{
              width: '48px',
              height: '45px',
              padding: 0,
              border: isActive ? '3px solid var(--dark-green)' : '3px solid transparent',
              borderRadius: '4px',
              cursor: 'pointer',
              overflow: 'hidden',
              backgroundImage: `url('${image}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'all 0.2s ease',
              boxShadow: isActive
                ? '0 4px 8px rgba(0, 0, 0, 0.3)'
                : '0 2px 4px rgba(0, 0, 0, 0.2)',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
              }
            }}
            title={name}
          >
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.1) 100%)',
              color: 'white',
              fontSize: '9px',
              fontWeight: 600,
              padding: '4px 2px',
              textAlign: 'center',
              pointerEvents: 'none',
            }}>
              {name}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default MapStyleSelector;
