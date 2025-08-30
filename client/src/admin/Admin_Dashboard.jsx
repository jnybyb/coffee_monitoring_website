import React from 'react';
import { useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import PersonalDetailsTable from './components/features/beneficiaries/Personal_Details';
import SeedlingRecordsTable from './components/features/seedlings/Seedling_Records';
import CropStatusTable from './components/features/crop-status/Crop_Status';
import MapMonitoring from './components/features/map-monitoring/Map_Monitoring';
import CropSuccessRateChart from './components/features/dashboard/CropSuccessRateChart';
import SeedlingSurvivalRateChart from './components/features/dashboard/SeedlingSurvivalRateChart';
import RecentActivityFeed from './components/features/dashboard/RecentActivityFeed';
import { getActiveFromPath } from './utils/navigation';
import { useStatistics } from './hooks/useStatistics';

// Dashboard Content Component
const DashboardContent = ({ active }) => {
  const { stats, loading } = useStatistics(active);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Loading statistics...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem' // Reduced margin-bottom
      }}>
        {/* Total Beneficiaries */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          minHeight: '120px'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '500', color: '#616161' }}>Total Beneficiaries</h3>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#4CAF50' }}>{stats.totalBeneficiaries}</p>
        </div>

        {/* Total Seeds Distributed */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          minHeight: '120px'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '500', color: '#616161' }}>Total Seeds Distributed</h3>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#2196F3' }}>{stats.totalSeedsDistributed.toLocaleString()}</p>
        </div>

        {/* Alive Crops */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          minHeight: '120px'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '500', color: '#616161' }}>Alive Crops</h3>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#8BC34A' }}>{stats.totalAlive.toLocaleString()}</p>
        </div>

        {/* Dead Crops */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          minHeight: '120px'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '500', color: '#616161' }}>Dead Crops</h3>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#F44336' }}>{stats.totalDead.toLocaleString()}</p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', // Adjusted minmax for better sizing
        gap: '1.5rem',
        marginBottom: '1.5rem', // Adjusted for consistency and reduced spacing
        alignItems: 'stretch', // Ensure items stretch to fill the height
        justifyItems: 'center' // Center items horizontally within their grid area
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px', // Increased minHeight for better chart presentation
          width: '100%' // Ensure it takes full width of its grid column
        }}>
          <CropSuccessRateChart data={stats} />
        </div>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px', // Increased minHeight for better chart presentation
          width: '100%' // Ensure it takes full width of its grid column
        }}>
          <SeedlingSurvivalRateChart data={stats} />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <RecentActivityFeed active={active} />
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const location = useLocation();
  const active = getActiveFromPath(location.pathname);

  // Render content based on active page
  let content;
  
  switch (active) {
    case 'Map Monitoring':
      content = <MapMonitoring />;
      break;
    
    case 'Coffee Beneficiaries':
      // When Coffee Beneficiaries is clicked, show Personal Details by default
      content = <PersonalDetailsTable />;
      break;
    
    case 'Personal Details':
      content = <PersonalDetailsTable />;
      break;
    
    case 'Seedling Records':
      content = <SeedlingRecordsTable />;
      break;
    
    case 'Crop Status':
      content = <CropStatusTable />;
      break;
    
    case 'Reports':
      content = (
        <div style={{ 
          padding: '2rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ color: '#2c5530' }}>Reports</h2>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Reports functionality coming soon...</p>
          </div>
        </div>
      );
      break;
    
    default:
      content = (
        <div style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem' }}>
            <h2 style={{ color: '#2c5530' }}>Dashboard</h2>
          </div>
          <DashboardContent active={active} />
        </div>
      );
  }

  return (
    <Layout>
      <div className="admin-content" style={{ display: 'flex', flex: 1, minHeight: 0, height: '100%', flexDirection: 'column' }}>
        {content}
      </div>
    </Layout>
  );
};

export default AdminDashboard;