import React, { useState, useEffect } from 'react';

const RecentActivities = ({ active }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeActivities = () => {
      try {
        setLoading(true);
        
        // Mock recent activities data - in a real app, this would come from an API
        const mockActivities = [
          {
            id: 1,
            action: 'New beneficiary John Doe added.',
            user: 'Admin',
            timestamp: '9/27/2025, 9:51:26 AM',
            type: 'beneficiary'
          },
          {
            id: 2,
            action: 'Crop status updated for Farm Plot A.',
            user: 'Admin',
            timestamp: '9/27/2025, 9:45:12 AM',
            type: 'crop'
          },
          {
            id: 3,
            action: 'Seedling distribution recorded for Plot B.',
            user: 'Admin',
            timestamp: '9/27/2025, 9:30:45 AM',
            type: 'seedling'
          },
          {
            id: 4,
            action: 'Farm plot coordinates updated.',
            user: 'Admin',
            timestamp: '9/27/2025, 9:15:33 AM',
            type: 'plot'
          },
          {
            id: 5,
            action: 'New beneficiary Maria Santos added.',
            user: 'Admin',
            timestamp: '9/27/2025, 8:58:17 AM',
            type: 'beneficiary'
          }
        ];
        
        setActivities(mockActivities);
      } catch (err) {
        console.error('Error initializing activities:', err);
      } finally {
        setLoading(false);
      }
    };

    if (active === 'Dashboard') {
      initializeActivities();
    }
  }, [active]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'beneficiary':
        return '👤';
      case 'crop':
        return '🌱';
      case 'seedling':
        return '🌿';
      case 'plot':
        return '📍';
      default:
        return '📝';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'beneficiary':
        return 'var(--bright-green)';
      case 'crop':
        return 'var(--lime-green)';
      case 'seedling':
        return 'var(--primary-blue)';
      case 'plot':
        return 'var(--primary-green)';
      default:
        return 'var(--text-gray)';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        background: 'var(--white)', 
        padding: '2rem', 
        borderRadius: '6px', 
        boxShadow: '0 2px 8px var(--shadow-subtle)', 
        border: '1px solid var(--light-border)',
        textAlign: 'center'
      }}>
        <p style={{ color: 'var(--primary-green)', fontSize: '1rem' }}>
          Loading recent activities...
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'var(--white)', 
      padding: '1rem', 
      borderRadius: '6px', 
      boxShadow: '0 2px 8px var(--shadow-subtle)', 
      border: '1px solid var(--light-border)',
      height: '100%', // Fill the entire height of the parent container
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Title */}
      <h3 style={{ 
        color: 'var(--primary-green)', 
        fontSize: '1rem', 
        fontWeight: 600, 
        margin: '0 0 1rem 0'
      }}>
        Recent Activity
      </h3>
      
      {/* Activities List */}
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        flex: 1,
        overflowY: 'auto',
        paddingRight: '0.25rem'
      }}>
        {activities.map((activity) => (
          <div key={activity.id} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            padding: '0.75rem',
            borderRadius: '4px',
            backgroundColor: 'var(--light-gray)',
            border: '1px solid var(--light-border)'
          }}>
            {/* Activity Icon */}
            <div style={{
              fontSize: '1rem',
              marginTop: '0.1rem',
              flexShrink: 0
            }}>
              {getActivityIcon(activity.type)}
            </div>
            
            {/* Activity Content */}
            <div style={{ flex: 1 }}>
              <p style={{
                margin: '0 0 0.25rem 0',
                fontSize: '0.8rem',
                color: 'var(--text-gray)',
                lineHeight: '1.3'
              }}>
                {activity.action}
              </p>
              <p style={{
                margin: 0,
                fontSize: '0.7rem',
                color: 'var(--medium-gray)',
                fontWeight: '500'
              }}>
                {activity.user} - {activity.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* View All Link */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '1rem',
        textAlign: 'center'
      }}>
        <button style={{
          background: 'none',
          border: 'none',
          color: 'var(--primary-green)',
          fontSize: '0.8rem',
          fontWeight: '500',
          cursor: 'pointer',
          textDecoration: 'underline'
        }}>
          View All Activities
        </button>
      </div>
    </div>
  );
};

export default RecentActivities;
