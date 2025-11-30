import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';

/**
 * Extract initials from beneficiary name
 */
const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'XX';
  const words = name.trim().split(/\s+/);
  if (words.length === 0) return 'XX';
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

/**
 * React component for location marker icon content
 */
const LocationMarkerContent = ({ imageUrl, beneficiaryName }) => {
  const initials = getInitials(beneficiaryName);
  
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    if (e.target.nextElementSibling) {
      e.target.nextElementSibling.style.display = 'flex';
    }
  };

  // Build full image URL
  let fullUrl = null;
  if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim()) {
    fullUrl = imageUrl.startsWith('http') 
      ? imageUrl 
      : `http://localhost:5000${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
  }

  return (
    <div style={{ position: 'relative', width: '50px', height: '60px' }}>
      <svg width="50" height="62" viewBox="0 0 50 62" xmlns="http://www.w3.org/2000/svg">
        <path d="M25 0C11.2 0 0 11.2 0 25C0 35 25 62 25 62S50 35 50 25C50 11.2 38.8 0 25 0Z" fill="#2d7c4a"/>
      </svg>
      <div style={{
        position: 'absolute',
        top: '5px',
        left: '6px',
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        background: 'white',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {fullUrl ? (
          <>
            <img 
              src={fullUrl}
              alt={beneficiaryName}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                borderRadius: '50%' 
              }}
              onError={handleImageError}
            />
            <div className="initials-fallback" style={{
              display: 'none',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: '#e8f5e9',
              color: '#2d7c4a',
              fontSize: '16px',
              fontWeight: 700,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {initials}
            </div>
          </>
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: '#e8f5e9',
            color: '#2d7c4a',
            fontSize: '16px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {initials}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Create custom location marker icon with beneficiary profile image or initials
 * @param {string} imageUrl - URL path to the beneficiary's profile image
 * @param {string} beneficiaryName - Name of the beneficiary (used for initials fallback)
 * @returns {L.DivIcon} Leaflet divIcon with custom location pin design
 */
export const createLocationIcon = (imageUrl, beneficiaryName) => {
  console.log('Creating icon for:', beneficiaryName, 'Image:', imageUrl); // Debug
  
  // Render React component to static HTML string
  const html = renderToStaticMarkup(
    <LocationMarkerContent imageUrl={imageUrl} beneficiaryName={beneficiaryName} />
  );

  return L.divIcon({
    className: 'custom-location-marker',
    html: html,
    iconSize: [50, 62],
    iconAnchor: [25, 62],
    popupAnchor: [0, -62]
  });
};
