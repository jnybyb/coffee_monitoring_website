import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

// Main layout component that structures the application with header, sidebar, and content
const Layout = ({ children }) => {
  // Layout dimensions for consistent spacing
  const sidebarWidth = '223px'; // Original wider width

  // Main container - fixed position to prevent scrolling issues
  const layoutContainerStyles = {
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    background: 'var(--white)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
  };

  // Main area containing sidebar and content
  const mainAreaStyles = {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    width: '100%',
    flexDirection: 'row',
  };

  // Sidebar container with fixed width
  const sidebarContainerStyles = {
    width: sidebarWidth,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  // Content area that takes remaining space
  const contentContainerStyles = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={layoutContainerStyles}>
      <Header />
      
      <div style={mainAreaStyles}>
        <div style={sidebarContainerStyles}>
          <Sidebar />
        </div>

        <div style={contentContainerStyles}>
          <MainContent>{children}</MainContent>
        </div>
      </div>
    </div>
  );
};

export default Layout; 