import React from 'react';

const PublicFooter = () => {
  return (
    <footer
      style={{
        position: 'relative',
        zIndex: 3,
        background: 'rgba(0, 0, 0, 0.9)',
        color: '#fff',
        padding: '2rem',
        textAlign: 'center',
        marginTop: 'auto'
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p style={{ margin: '0 0 1rem 0' }}>
          © 2024 KAPPI - Coffee Farm Monitoring System
        </p>
        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
          Taocanga, Manay, Davao Oriental, Philippines
        </p>
      </div>
    </footer>
  );
};

export default PublicFooter;
