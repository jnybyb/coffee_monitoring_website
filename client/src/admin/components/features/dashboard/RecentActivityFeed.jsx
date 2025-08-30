import React, { useState, useEffect } from 'react';

const useActivityFeed = (active) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for now, replace with actual API call later
  const mockActivities = [
    { id: 1, action: 'New beneficiary John Doe added.', username: 'Admin', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 2, action: 'Crop status updated for Farm Plot A.', username: 'Admin', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
    { id: 3, action: 'Seedling record created for Jane Smith.', username: 'Admin', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { id: 4, action: 'Farm plot coordinates updated for Plot 101.', username: 'Admin', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
  ];

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        // Replace with actual API call: const data = await activitiesAPI.getRecent();
        const data = await new Promise(resolve => setTimeout(() => resolve(mockActivities), 1000)); // Simulate API call
        setActivities(data);
      } catch (err) {
        // const e = handleAPIError(err);
        setError('Failed to fetch recent activities'); // Simplified error for mock
      } finally {
        setLoading(false);
      }
    };

    if (active === 'Dashboard') {
      fetchActivities();
    }
  }, [active]);

  return { activities, loading, error };
};

const RecentActivityFeed = ({ active }) => {
  const { activities, loading, error } = useActivityFeed(active);

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e0e0e0',
        minHeight: '250px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ width: '35px', height: '35px', border: '3px solid #f3f3f3', borderTop: '3px solid #4CAF50', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#757575', margin: '1rem 0 0 0', fontSize: '0.9rem' }}>Loading activities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e0e0e0',
        minHeight: '250px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#F44336'
      }}>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e0e0e0',
      minHeight: '250px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600', color: '#424242' }}>Recent Activity</h3>
      {
        activities && activities.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, overflowY: 'auto' }}>
            {activities.map((activity) => (
              <li key={activity.id} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px dashed #e0e0e0' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#424242', fontWeight: '500' }}>{activity.action}</p>
                <span style={{ fontSize: '0.75rem', color: '#757575' }}>
                  {activity.username} - {new Date(activity.timestamp).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#757575', fontSize: '0.9rem' }}>
            No recent activity.
          </div>
        )
      }
    </div>
  );
};

export default RecentActivityFeed;
