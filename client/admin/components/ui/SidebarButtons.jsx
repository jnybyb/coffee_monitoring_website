
import React from 'react';

// Sidebar button component with active state styling
const SidebarButtons = ({ 
  item, 
  isParentActive, 
  onMainButtonClick, 
  buttonHeight = '30px',
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  // Reset hover state immediately when button becomes active
  React.useEffect(() => {
    if (isParentActive) {
      setIsHovered(false);
    }
  }, [isParentActive]);

  const baseButtonStyles = {
    width: '100%',
    height: buttonHeight,
    // Background: light gray on hover only when not active, subtle gray for active, transparent otherwise
    background: (isHovered && !isParentActive) ? 'rgba(0, 0, 0, 0.17)' : (isParentActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent'),
    // Remove all borders except left border for active buttons
    borderTop: 'none',
    borderRight: 'none',
    borderBottom: 'none',
    borderLeft: isParentActive ? '3px solid var(--border-gray)' : 'none',
    // Text color: white when active, light gray otherwise
    color: isParentActive ? 'var(--white)' : 'var(--light-gray)',
    fontFamily: 'inherit',
    fontWeight: isParentActive ? 600 : 400,
    fontSize: '0.77rem',
    padding: '0.5rem 0.6rem',
    borderRadius: '4px',
    cursor: 'pointer',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.06rem',
    transition: 'all 0.2s ease',
    marginTop: '15px',
  };

  const iconStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    minWidth: '40px',
    fontSize: '1.4rem',
    // Icon color: white when active, inherit otherwise
    color: isParentActive ? 'var(--white)' : 'inherit',
    transition: 'color 0.2s ease',
  };

  // Handle hover states - only apply hover when button is not active
  const handleMouseEnter = () => {
    if (!isParentActive) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isParentActive) {
      setIsHovered(false);
    }
  };

  return (
    <button
      style={baseButtonStyles}
      onClick={() => onMainButtonClick(item)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span style={iconStyles}>
        {isParentActive ? item.activeIcon : item.inactiveIcon}
      </span>
      <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
    </button>
  );
};

export default SidebarButtons;