import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { RiLogoutBoxRLine } from "react-icons/ri";
import AlertModal from '../ui/AlertModal';
import coffeeLogo from '../../../assets/images/coffee crop logo.png';

// Header component with branding and logout functionality
const Header = () => {
  const navigate = useNavigate();
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const iconRef = useRef(null);

  // Clear authentication data and redirect to login page
  const handleLogout = () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    } catch {}
    // Replace history to prevent back navigation to authenticated pages
    navigate('/login', { replace: true });
  };

  // Main header container styles
  const headerStyles = {
    background: 'var(--white)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.2rem 0.3rem',
    boxSizing: 'border-box',
    boxShadow: '0 4px 7px var(--shadow-color)', 
    zIndex: 10, 
  };

  // Branding section styles
  const brandingContainerStyles = {
    display: 'flex', 
    alignItems: 'center', 
  };

  // Logo styles
  const logoStyles = {
    height: '48px',
    width: 'auto',
  };

  const brandingTextStyles = {
    display: 'flex', 
    flexDirection: 'column'
  };

  // Main title styling
  const titleStyles = {
    fontWeight: 800, 
    fontSize: '1.1rem',
    letterSpacing: '0.1px',
    fontFamily: 'var(--font-main)',
    color: 'var(--dark-green)',
    lineHeight: '1.3'
  };

  // Subtitle styling
  const subtitleStyles = {
    fontWeight: 500, 
    fontSize: '0.60rem',
    letterSpacing: '0.3px',
    fontFamily: 'var(--font-main)',
    color: 'var(--dark-brown)',
    lineHeight: '1.1'
  };

  // Log out section styles
  const userContainerStyles = {
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.2rem',
    padding: '0.3rem 0.8rem',
  };

  // Logout text styles
  const logoutTextStyles = {
    color: 'var(--dark-green)',
    fontWeight: 600,
    fontFamily: 'var(--font-main)',
    fontSize: '0.8rem',
    marginRight: '1px',
  };

  // Logout icon styles
  const logoutIconStyles = {
    cursor: 'pointer',
    color: 'var(--dark-green)',
    transition: 'all 0.1s ease',
    transform: 'scale(1)', // Ensure initial scale is set
  };

  // Handle logout icon click with immediate scale reset to prevent visual stutter
  // when modal opens (avoids icon remaining scaled during modal transition)
  const handleIconClick = () => {
    if (iconRef.current) {
      iconRef.current.style.transform = 'scale(1)';
    }
    setConfirmLogoutOpen(true);
  };

  return (
    <header style={headerStyles}>
      <div style={brandingContainerStyles}>
        <img 
          src={coffeeLogo} 
          alt="Coffee Crop Logo" 
          style={logoStyles}
        />
        <div style={brandingTextStyles}>
          <span style={titleStyles}>
            Coffee Crop Monitoring System
          </span>
          <span style={subtitleStyles}>
            Taocanga, Manay, Davao Oriental
          </span>
        </div>
      </div>

      <div style={userContainerStyles}>
        <span style={logoutTextStyles}>Logout</span>
        <RiLogoutBoxRLine 
          ref={iconRef}
          size={20} 
          style={logoutIconStyles}
          onClick={handleIconClick}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        />
      </div>
      
      <AlertModal
        isOpen={confirmLogoutOpen}
        onClose={() => setConfirmLogoutOpen(false)}
        type="logout"
        title="Log out?"
        message="Are you sure you want to log out of your admin session?"
        showCancel={true}
        cancelText="Cancel"
        confirmText="Log out"
        onConfirm={handleLogout}
        maxWidth={420}
      />
    </header>
  );
};

export default Header;