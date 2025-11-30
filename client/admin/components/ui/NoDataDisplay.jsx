import React from 'react';
import { MdLocationOff } from "react-icons/md";
import { BiHistory } from "react-icons/bi";

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

// Specialized component for "No other farm plots" display
export const NoOtherFarmPlots = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      textAlign: 'center',
      width: '100%'
    }}>
      <div style={{ 
        color: '#adb5bd', 
        marginBottom: '0.1rem',
        fontSize: '24px'
      }}>
        <MdLocationOff />
      </div>
      <p style={{
        color: '#6c757d',
        fontSize: '11px',
        fontWeight: 500,
        margin: 0
      }}>
        No other farm plots.
      </p>
    </div>
  );
};

// Specialized component for "No recent activities found" display
export const NoRecentActivities = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      textAlign: 'center',
      width: '100%'
    }}>
      <div style={{ 
        color: '#adb5bd', 
        marginBottom: '0.1rem',
        fontSize: '24px'
      }}>
        <BiHistory />
      </div>
      <p style={{
        color: '#6c757d',
        fontSize: '11px',
        fontWeight: 500,
        margin: 0
      }}>
        No recent activities found.
      </p>
    </div>
  );
};

export default NoDataDisplay;