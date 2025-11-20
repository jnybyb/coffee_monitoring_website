import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useStatistics } from '../../../hooks/useStatistics';

const DonutGraph = ({ active }) => {
  const { stats, loading: statsLoading } = useStatistics(active);
  const [donutData, setDonutData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeDonutData = () => {
      try {
        setLoading(true);
        setError(null);
        
        // Calculate success rate based on alive vs dead crops
        const totalCrops = stats.totalAlive + stats.totalDead;
        const successRate = totalCrops > 0 ? ((stats.totalAlive / totalCrops) * 100).toFixed(1) : 0;
        const failureRate = totalCrops > 0 ? ((stats.totalDead / totalCrops) * 100).toFixed(1) : 0;
        
        // Create donut chart data for crop success rate
        const donutChartData = [
          { name: 'Alive Crops', value: parseFloat(successRate), color: '#22c55e' },
          { name: 'Dead Crops', value: parseFloat(failureRate), color: '#ef4444' }
        ];
        setDonutData(donutChartData);
      } catch (err) {
        console.error('Error initializing donut data:', err);
        setError('Failed to load donut chart data');
      } finally {
        setLoading(false);
      }
    };

    if (active === 'Dashboard' && !statsLoading) {
      initializeDonutData();
    }
  }, [active, stats, statsLoading]);

  if (loading || statsLoading) {
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
          Loading crop success rate...
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
        border: '1px solid var(--light-border)',
        textAlign: 'center'
      }}>
        <p style={{ color: 'var(--danger-red)', fontSize: '1rem' }}>
          {error}
        </p>
      </div>
    );
  }

  const successRate = donutData.length > 0 ? donutData[0].value.toFixed(1) : '0.0';

  return (
    <div style={{ 
      background: 'var(--white)', 
      padding: '1rem', 
      borderRadius: '6px', 
      boxShadow: '0 2px 8px var(--shadow-subtle)', 
      border: '1px solid var(--light-border)'
    }}>
      {/* Title */}
      <h3 style={{ 
        color: 'var(--primary-green)', 
        fontSize: '1rem', 
        fontWeight: 600, 
        margin: '0 0 1rem 0',
        textAlign: 'center'
      }}>
        Crop Success Rate
      </h3>
      
      {/* Donut Chart */}
      <div style={{ height: '180px', width: '100%', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={donutData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={0}
              dataKey="value"
              startAngle={90}
              endAngle={450}
            >
              {donutData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: 'var(--primary-green)',
            lineHeight: '1',
            marginBottom: '0.2rem'
          }}>
            {successRate}%
          </div>
          <div style={{
            fontSize: '0.8rem',
            color: 'var(--text-gray)',
            fontWeight: '500'
          }}>
            Success Rate
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '1.5rem',
        marginTop: '0.75rem'
      }}>
        {donutData.map((item, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            fontSize: '0.8rem',
            color: 'var(--text-gray)'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: item.color,
              marginRight: '0.4rem'
            }}></div>
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutGraph;