import React from 'react';

// Main content area that displays the active page content
const MainContent = ({ children }) => {
  // Main container with scrollable content area
  const mainStyles = {
    flex: 1,
    minWidth: 0,
    background: 'var(--white)',
    borderRadius: '7px',
    fontFamily: 'var(--font-main)',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    minHeight: 0,
    marginTop: '0.5rem',
    marginRight: '0.5rem',
    marginBottom: '0.5rem',
  };

  // Content wrapper for proper flex distribution
  const contentWrapperStyles = {
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column', 
    minHeight: 0,
    height: '100%'
  };

  return (
    <main style={mainStyles}>
      <div style={contentWrapperStyles}>
        {children}
      </div>
    </main>
  );
};

export default MainContent; 