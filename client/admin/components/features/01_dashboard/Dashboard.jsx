import React, { useState, useEffect } from 'react';
import { PiUsersFill, PiPottedPlantFill } from "react-icons/pi";
import { GiSeedling } from "react-icons/gi";
import { FaPlantWilt } from "react-icons/fa6";
import LineGraph from './LineGraph';
import RecentActivities from './RecentActivities';
import { statisticsAPI } from '../../../services/api';

const Dashboard = ({ active }) => {
  // State for dashboard statistics
  const [stats, setStats] = useState({
    totalBeneficiaries: 0,
    totalSeedsDistributed: 0,
    totalAlive: 0,
    totalDead: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      setError(null);
      const data = await statisticsAPI.getDashboardStats();
      // Ensure all values are numbers for proper formatting
      setStats({
        totalBeneficiaries: Number(data.totalBeneficiaries) || 0,
        totalSeedsDistributed: Number(data.totalSeedsDistributed) || 0,
        totalAlive: Number(data.totalAlive) || 0,
        totalDead: Number(data.totalDead) || 0
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Auto-refresh every 30 seconds to keep data current
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchStats();
    }, 30000); // 30 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Refresh when tab becomes active
  useEffect(() => {
    if (active) {
      fetchStats();
    }
  }, [active]);

  // Define metric cards configuration
  const metrics = [
    {
      icon: PiUsersFill,
      title: "Total Beneficiaries",
      value: stats.totalBeneficiaries,
      color: "var(--olive-green)",
      format: true
    },
    {
      icon: GiSeedling,
      title: "Total Seeds Distributed",
      value: stats.totalSeedsDistributed,
      color: "var(--teal)",
      format: true
    },
    {
      icon: PiPottedPlantFill,
      title: "Alive Crops",
      value: stats.totalAlive,
      color: "var(--success)",
      format: true
    },
    {
      icon: FaPlantWilt,
      title: "Dead Crops",
      value: stats.totalDead,
      color: "var(--danger-red)",
      format: true
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'var(--dark-green)', fontSize: '1rem' }}>
          Loading statistics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'var(--danger-red)', fontSize: '1rem' }}>
          {error}
        </p>
        <button
          onClick={fetchStats}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--dark-green)',
            color: 'var(--white)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ 
        padding: '1.6rem 1rem 0.5rem 1rem',
        backgroundColor: 'var(--white)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end' 
      }}>
        <div>
          <h2 style={{ 
            color: 'var(--dark-green)', 
            fontSize: '1.5rem', 
            fontWeight: 600, 
            margin: 0 
          }}>
            Dashboard
          </h2>
          <div style={{
            color: 'var(--dark-brown)',
            fontSize: '0.7rem',
            marginTop: '0.2rem',
            fontWeight: 500
          }}>
            Overview of key metrics and recent activities
          </div>
        </div>
      </div>
      
      <div style={{ padding: '0.5rem 1rem 1rem 1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '0.75rem', 
          marginBottom: '0.75rem' 
        }}>
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div key={index} style={{
                background: 'var(--white)',
                padding: '0.75rem',
                borderRadius: '6px',
                boxShadow: '0 2px 8px var(--shadow-subtle)',
                border: '1px solid var(--border-gray)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                minHeight: '80px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 12px var(--shadow-subtle)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px var(--shadow-subtle)';
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <IconComponent style={{ 
                    fontSize: '0.8rem', 
                    color: 'var(--text-gray)', 
                    marginRight: '0.25rem' 
                  }} />
                  <h3 style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 500, 
                    color: 'var(--dark-text)', 
                    margin: 0 
                  }}>
                    {metric.title}
                  </h3>
                </div>
                <p style={{ 
                  margin: '0.25rem 0 0 0.25rem', 
                  fontSize: '1.8rem', 
                  fontWeight: 'bold', 
                  color: metric.color
                }}>
                  {/* Format numbers with thousand separators if specified */}
                  {metric.format ? metric.value.toLocaleString() : metric.value}
                </p>
              </div>
            );
          })}
        </div>
        
        {/* Charts and Activities Section - 2/3 for chart, 1/3 for activities */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1rem',
          flex: 1
        }}>
          {/* Left Side - Charts */}
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            minHeight: '100%'
          }}>
            {/* Trend Monitoring Chart Component */}
            <LineGraph active={active} />
          </div>
          
          {/* Right Side - Recent Activities */}
          <div style={{ 
            minWidth: '200px',
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <RecentActivities active={active} limit={5} showViewAll={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;