import React, { useState, useEffect } from 'react';
import { PiUsersFill, PiPottedPlantFill } from "react-icons/pi";
import { GiSeedling } from "react-icons/gi";
import { FaPlantWilt } from "react-icons/fa6";
import DonutGraph from './DonutGraph';
import LineGraph from './LineGraph';
import RecentActivities from './RecentActivities';

const Dashboard = ({ active }) => {
  const [stats, setStats] = useState({
    totalBeneficiaries: 124,
    totalSeedsDistributed: 2480,
    totalAlive: 2156,
    totalDead: 324
  });
  const [loading, setLoading] = useState(false);

  const metrics = [
    {
      icon: PiUsersFill,
      title: "Total Beneficiaries",
      value: stats.totalBeneficiaries,
      color: "var(--bright-green)",
      format: false
    },
    {
      icon: GiSeedling,
      title: "Total Seeds Distributed",
      value: stats.totalSeedsDistributed,
      color: "var(--primary-blue)",
      format: true
    },
    {
      icon: PiPottedPlantFill,
      title: "Alive Crops",
      value: stats.totalAlive,
      color: "var(--lime-green)",
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
        <p style={{ color: 'var(--primary-green)', fontSize: '1rem' }}>
          Loading statistics...
        </p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '1rem 1rem 1rem 1rem' }}>
        <h2 style={{ 
          color: 'var(--primary-green)', 
          fontSize: '1.5rem', 
          fontWeight: 600, 
          margin: 0 
        }}>
          Dashboard
        </h2>
      </div>
      
      <div style={{ padding: '0.5rem 1rem 1rem 1rem', flex: 1 }}>
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
                border: '1px solid var(--light-border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                minHeight: '80px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <IconComponent style={{ 
                    fontSize: '0.8rem', 
                    color: 'var(--medium-gray)', 
                    marginRight: '0.25rem' 
                  }} />
                  <h3 style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 500, 
                    color: 'var(--text-gray)', 
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
                  {metric.format ? metric.value.toLocaleString() : metric.value}
                </p>
              </div>
            );
          })}
        </div>
        
        {/* Charts and Activities Section */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '0.75rem',
          alignItems: 'stretch'
        }}>
          {/* Left Side - Charts */}
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            minHeight: '100%'
          }}>
            {/* Line Chart Component */}
            <LineGraph active={active} />
            
            {/* Donut Chart Component */}
            <DonutGraph active={active} />
          </div>
          
          {/* Right Side - Recent Activities */}
          <div style={{ 
            minWidth: '300px',
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <RecentActivities active={active} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;