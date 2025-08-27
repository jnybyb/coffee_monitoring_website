import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import coffeeLogo from '../../../assets/images/coffee crop logo.png';
import { authAPI } from '../../services/api';
import AlertModal from '../ui/AlertModal';

// Header component with branding and user profile section
const Header = ({ onToggleSidebar, isSidebarVisible }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('auth_user') || 'null'); } catch { return null; }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const userRef = useRef(null);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  const initials = user?.username ? user.username.slice(0,2).toUpperCase() : 'AD';

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await authAPI.me();
        if (mounted && res && res.user) {
          setUser(res.user);
          try { localStorage.setItem('auth_user', JSON.stringify(res.user)); } catch {}
        }
      } catch {
        // If token invalid, navigate to login (api layer also redirects)
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!userRef.current) return;
      if (!userRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    } catch {}
    navigate('/login', { replace: true });
  };
  // Main header container with shadow and fixed positioning
  const headerStyles = {
    background: 'var(--white)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.4rem 0.5rem',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    boxSizing: 'border-box',
    boxShadow: '0 4px 7px var(--shadow-color)', 
    zIndex: 10, 
  };

  // Branding section with logo and text
  const brandingContainerStyles = {
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.15rem' 
  };

  const logoContainerStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: '0.2rem',
    borderRadius: '6px',
    transition: 'all 0.2s ease-in-out',
  };

  const logoStyles = {
    height: '45px',
    width: 'auto',
    cursor: 'pointer',
    transition: 'transform 0.2s ease-in-out',
    transform: isLogoHovered ? 'scale(1.15)' : 'scale(1)',
  };

  const handleLogoClick = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    }
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

  // User profile section
  const userContainerStyles = {
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.5rem',
    padding: '0.3rem 0.8rem',
  };

  const userInfoStyles = {
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'flex-end' 
  };

  const userRoleStyles = {
    fontWeight: 500, 
    fontSize: '0.85rem',
    color: 'var(--forest-green)',
    fontFamily: 'var(--font-main)'
  };

  // User avatar with initials
  const avatarStyles = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'var(--mint-green)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--forest-green)',
    fontWeight: 700,
    fontSize: '1rem',
    fontFamily: 'var(--font-main)',
    boxShadow: '0 2px 4px var(--shadow-light)'
  };

  return (
    <header style={headerStyles}>
      <div style={brandingContainerStyles}>
        <div 
          style={logoContainerStyles}
          onClick={handleLogoClick}
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
        >
          <img 
            src={coffeeLogo} 
            alt="Coffee Crop Logo" 
            style={logoStyles}
          />
        </div>
        <div style={brandingTextStyles}>
          <span style={titleStyles}>
            Coffee Crop Monitoring System
          </span>
          <span style={subtitleStyles}>
            Taocanga, Manay, Davao Oriental
          </span>
        </div>
      </div>

      <div style={{ position: 'relative' }} ref={userRef}>
        <div style={userContainerStyles}>
          <div style={{ ...userInfoStyles, cursor: 'pointer' }} onClick={() => setMenuOpen((v) => !v)}>
            <span style={userRoleStyles}>Admin</span>
          </div>
          <div style={{ ...avatarStyles, cursor: 'pointer' }} onClick={() => setMenuOpen((v) => !v)}>{initials}</div>
        </div>
        {menuOpen ? (
          <div style={{
            position: 'absolute',
            right: 8,
            top: 'calc(100% + 8px)',
            background: 'white',
            border: '1px solid #e9ecef',
            borderRadius: 8,
            boxShadow: '0 8px 16px var(--shadow-color)',
            minWidth: 160,
            zIndex: 20
          }}>
            <button onClick={() => setConfirmLogoutOpen(true)} style={{
              width: '100%',
              textAlign: 'left',
              padding: '0.6rem 0.8rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-main)'
            }}>Logout</button>
          </div>
        ) : null}
      </div>
      <AlertModal
        isOpen={confirmLogoutOpen}
        onClose={() => setConfirmLogoutOpen(false)}
        type="warning"
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