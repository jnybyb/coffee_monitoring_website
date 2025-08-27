import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

// Main layout component that structures the application with header, sidebar, and content
const Layout = ({ children }) => {
  // State for sidebar visibility
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  
  // Layout dimensions for consistent spacing
  const headerHeight = '50px';
  const sidebarWidth = '245px';

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

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

  // Header container with fixed height
  const headerContainerStyles = {
    height: headerHeight, 
    width: '100%', 
    flexShrink: 0 
  };

  // Main area containing sidebar and content
  const mainAreaStyles = {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    width: '100%',
  };

  // Sidebar container with fixed width
  const sidebarContainerStyles = {
    width: isSidebarVisible ? sidebarWidth : '0px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'width 0.3s ease-in-out',
  };

  // Content area that takes remaining space
  const contentContainerStyles = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    transition: 'margin-left 0.3s ease-in-out',
  };

  return (
    <div style={layoutContainerStyles}>
      <div style={headerContainerStyles}>
        <Header onToggleSidebar={toggleSidebar} isSidebarVisible={isSidebarVisible} />
      </div>

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