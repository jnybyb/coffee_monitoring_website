import React from 'react';

const PublicHeader = () => {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'transparent',
        backdropFilter: 'blur(10px)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
          KAPPI
        </h1>
      </div>
      
      <nav>
        <ul style={{ 
          display: 'flex', 
          gap: '2rem', 
          listStyle: 'none', 
          margin: 0, 
          padding: 0 
        }}>
          <li><a href="#about" style={{ color: '#fff', textDecoration: 'none', transition: 'color 0.2s' }}>About</a></li>
          <li><a href="#services" style={{ color: '#fff', textDecoration: 'none', transition: 'color 0.2s' }}>Services</a></li>
          <li><a href="#contact" style={{ color: '#fff', textDecoration: 'none', transition: 'color 0.2s' }}>Contact</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default PublicHeader;
