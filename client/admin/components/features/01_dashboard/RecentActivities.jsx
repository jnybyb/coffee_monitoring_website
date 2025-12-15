import React, { useState, useEffect } from 'react';
import { statisticsAPI } from '../../../services/api';
import { FaMapMarkedAlt } from 'react-icons/fa';
import { HiUsers } from 'react-icons/hi2';
import { BsClipboard2DataFill } from 'react-icons/bs';
import { GiCoffeeBeans } from 'react-icons/gi';
import { PiPlantFill } from 'react-icons/pi';
import { NoRecentActivities } from '../../ui/NoDataDisplay';

const RecentActivities = ({ active, limit = 10, showViewAll = false }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch recent activities from the database
  const fetchActivities = async () => {
    try {
      setError(null);
      const data = await statisticsAPI.getRecentActivities(limit);
      setActivities(data);
    } catch (err) {
      console.error('Error fetching recent activities:', err);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchActivities();
  }, []);

  // Auto-refresh every 30 seconds to keep activities current
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchActivities();
    }, 30000); // 30 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Refresh when Dashboard becomes active
  useEffect(() => {
    if (active === 'Dashboard') {
      fetchActivities();
    }
  }, [active]);

  // Map activity type to display title
  const getActivityTitle = (type) => {
    switch (type) {
      case 'beneficiary':
        return 'Coffee Beneficiary';
      case 'crop':
        return 'Crop Survey Status';
      case 'seedling':
        return 'Seedling Record';
      case 'plot':
        return 'Farm Monitoring';
      case 'report':
        return 'Reports';
      default:
        return 'Reports';
    }
  };

  // Map activity type to corresponding icon component
  const getActivityIcon = (type) => {
    switch (type) {
      case 'beneficiary':
        return <HiUsers />;
      case 'crop':
        return <PiPlantFill />;
      case 'seedling':
        return <GiCoffeeBeans />;
      case 'plot':
        return <FaMapMarkedAlt />;
      case 'report':
        return <BsClipboard2DataFill />;
      default:
        return <BsClipboard2DataFill />;
    }
  };

  // Format timestamp to readable format
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div style={{ 
        background: 'var(--white)', 
        padding: '2rem', 
        borderRadius: '6px', 
        boxShadow: '0 2px 8px var(--shadow-subtle)', 
        border: '1px solid var(--border-gray)',
        textAlign: 'center'
      }}>
        <p style={{ color: 'var(--dark-green)', fontSize: '1rem' }}>
          Loading recent activities...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        background: 'var(--white)', 
        padding: '2rem', 
        borderRadius: '6px', 
        boxShadow: '0 2px 8px var(--shadow-subtle)', 
        border: '1px solid var(--border-gray)',
        textAlign: 'center'
      }}>
        <p style={{ color: 'var(--danger-red)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          {error}
        </p>
        <button
          onClick={fetchActivities}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--dark-green)',
            color: 'var(--white)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.75rem'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'var(--white)', 
      padding: '0.7rem', 
      borderRadius: '6px', 
      boxShadow: '0 2px 8px var(--shadow-subtle)', 
      border: '1px solid var(--border-gray)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Title */}
      <h3 style={{ 
        color: 'var(--dark-green)', 
        fontSize: '1rem', 
        fontWeight: 600, 
        margin: '0 0 0.5rem 0'
      }}>
        Recent Activity
      </h3>
      
      {/* Activities List */}
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        flex: 1,
        overflowY: 'auto',
        paddingRight: '0.25rem',
        justifyContent: activities.length === 0 ? 'center' : 'flex-start',
        alignItems: activities.length === 0 ? 'center' : 'stretch'
      }}>
        {activities.length === 0 ? (
          <NoRecentActivities />
        ) : (
          activities.map((activity) => (
            <div 
              key={activity.id} 
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: '4px',
                backgroundColor: 'var(--white)',
                border: '1px solid var(--dark-brown)',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--mint-green)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--white)';
              }}
            >
              {/* Top row: Icon and Content */}
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '0.5rem'
              }}>
                {/* Icon */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  color: 'var(--dark-green)',
                  flexShrink: 0,
                  width: '1.5rem',
                  height: '1.5rem',
                  borderRadius: '50%',
                  backgroundColor: 'var(--light-gray)',
                  border: '1px solid var(--dark-brown)'
                }}>
                  {getActivityIcon(activity.type)}
                </div>
                
                {/* Title, Subtitle, and Timestamp in vertical column */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  flex: 1
                }}>
                  {/* Title */}
                  <div style={{
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    color: 'var(--dark-green)'
                  }}>
                    {getActivityTitle(activity.type)}
                  </div>
                  
                  {/* Subtitle */}
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--dark-brown)',
                    lineHeight: '1',
                    fontWeight: '400'
                  }}>
                    {activity.action}
                  </div>
                  
                  {/* Timestamp */}
                  <div style={{
                    fontSize: '0.55rem',
                    marginTop: '0.25rem',
                    color: 'var(--dark-text)',
                    fontWeight: '400'
                  }}>
                    {formatTimestamp(activity.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* View All Link */}
      {showViewAll && activities.length > 0 && (
        <div
          style={{
            marginTop: '1rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: 'var(--dark-green)',
            textDecoration: 'underline',
            cursor: 'pointer',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--olive-green)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--dark-green)';
          }}
          onClick={() => {
            // Store active tab to display when navigating to Reports
            sessionStorage.setItem('reportsActiveTab', 'Recent Activities');
            
            // Dispatch custom event to navigate to Reports page
            const event = new CustomEvent('navigateToReports', {
              detail: { activeTab: 'Recent Activities' }
            });
            window.dispatchEvent(event);
          }}
        >
          View All
        </div>
      )}
    </div>
  );
};

export default RecentActivities;
