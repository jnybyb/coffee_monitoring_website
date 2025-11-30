import React from 'react';
import { FaUsersLine, FaSeedling } from 'react-icons/fa6';
import { MdOutlineFactCheck, MdHistory } from 'react-icons/md';
import { GrMapLocation } from 'react-icons/gr';
import { BsClipboard2Data } from 'react-icons/bs';
import NoDataDisplay from './NoDataDisplay';

const ReportTable = ({ 
  activeTab, 
  loadingData, 
  data,
  renderTableHeaders,
  renderTableBody 
}) => {
  
  // Loading state
  if (loadingData) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        padding: '2rem',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid var(--dark-green)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>
          Loading {activeTab?.toLowerCase()}...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // No tab selected state
  if (!activeTab) {
    return (
      <NoDataDisplay
        icon={<BsClipboard2Data />}
        title="No List Selected"
        subtitle="Please select a tab above to view data"
        iconSize={48}
        iconColor="var(--text-gray)"
      />
    );
  }

  // No data state
  if (!data || data.length === 0) {
    const getIcon = () => {
      switch (activeTab) {
        case 'Beneficiary List':
          return <FaUsersLine />;
        case 'Farm Location':
          return <GrMapLocation />;
        case 'Seedling Record':
          return <FaSeedling />;
        case 'Crop Survey Status':
          return <MdOutlineFactCheck />;
        case 'Recent Activities':
          return <MdHistory />;
        default:
          return null;
      }
    };

    return (
      <NoDataDisplay 
        icon={getIcon()}
        title={`No ${activeTab} Data Available.`}
        iconSize={40}
        iconColor="var(--gray-icon)"
        height="400px"
      />
    );
  }

  // Table with data
  return (
    <table style={{
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '0.7rem'
    }}>
      {renderTableHeaders()}
      {renderTableBody()}
    </table>
  );
};

export default ReportTable;
