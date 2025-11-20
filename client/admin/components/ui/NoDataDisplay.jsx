import React from 'react';

const NoDataDisplay = ({ 
  icon, 
  title,
  subtitle,
  iconSize = 40,
  iconColor = '#6c757d',
  height = '100%',
  padding = '2rem'
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: height,
      padding: padding,
      textAlign: 'center',
      width: '100%'
    }}>
      {icon && (
        <div style={{ 
          color: iconColor, 
          marginBottom: '0.3rem',
          fontSize: `${iconSize}px`
        }}>
          {icon}
        </div>
      )}
      <h3 style={{
        color: 'var(--text-gray)',
        fontSize: '0.75rem',
        fontWeight: 500,
      }}>
        {title}
      </h3>
      {subtitle && (
        <p style={{
          color: 'var(--text-gray)',
          fontSize: '0.75rem',
          lineHeight: 1,
          marginTop: '0.5rem'
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default NoDataDisplay;