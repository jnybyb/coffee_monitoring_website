import React from 'react';

// Main content area that displays the active page content
const MainContent = ({ children }) => {
  // Main container with scrollable content area
  const mainStyles = {
    flex: 1,
    minWidth: 0,
    background: 'var(--white)',
    fontFamily: 'var(--font-main)',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    minHeight: 0,
  };

  // Content wrapper for proper flex distribution
  const contentWrapperStyles = {
    flex: 1, 
    display: 'flex', 
    flexDirection: 'row', // changed to row to allow horizontal children
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