import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaChartPie } from "react-icons/fa";
import { MdBarChart } from "react-icons/md";

const LineGraph = ({ active }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'pie'

  useEffect(() => {
    const initializeChartData = () => {
      try {
        setLoading(true);
        setError(null);
        
        // Mock chart data - in a real app, this would come from an API
        const mockData = [
          { month: 'Jan', beneficiaries: 45, seedlings: 900, aliveCrops: 820, deadCrops: 80 },
          { month: 'Feb', beneficiaries: 52, seedlings: 1040, aliveCrops: 910, deadCrops: 130 },
          { month: 'Mar', beneficiaries: 48, seedlings: 960, aliveCrops: 880, deadCrops: 80 },
          { month: 'Apr', beneficiaries: 61, seedlings: 1220, aliveCrops: 1080, deadCrops: 140 },
          { month: 'May', beneficiaries: 55, seedlings: 1100, aliveCrops: 990, deadCrops: 110 },
          { month: 'Jun', beneficiaries: 67, seedlings: 1340, aliveCrops: 1200, deadCrops: 140 },
          { month: 'Jul', beneficiaries: 72, seedlings: 1440, aliveCrops: 1320, deadCrops: 120 },
          { month: 'Aug', beneficiaries: 68, seedlings: 1360, aliveCrops: 1220, deadCrops: 140 },
          { month: 'Sep', beneficiaries: 75, seedlings: 1500, aliveCrops: 1350, deadCrops: 150 }
        ];
        
        setChartData(mockData);
      } catch (err) {
        console.error('Error initializing chart data:', err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    if (active === 'Dashboard') {
      initializeChartData();
    }
  }, [active]);

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
          Loading chart data...
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
        <p style={{ color: 'var(--danger-red)', fontSize: '1rem' }}>
          {error}
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
      border: '1px solid var(--border-gray)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '0.75rem' 
      }}>
        <h3 style={{ 
          color: 'var(--dark-green)', 
          fontSize: '0.9rem', 
          fontWeight: 600, 
          margin: 0 
        }}>
          Trend Monitoring
        </h3>
        
        {/* Chart Type Toggle Buttons */}
        <div style={{ display: 'flex' }}>
          <button 
            onClick={() => setChartType('pie')}
            style={{
              padding: '0.5rem',
              backgroundColor: 'transparent',
              color: chartType === 'pie' ? 'var(--dark-green)' : 'var(--text-gray)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <FaChartPie />
          </button>
          <button 
            onClick={() => setChartType('bar')}
            style={{
              padding: '0.5rem',
              backgroundColor: 'transparent',
              color: chartType === 'bar' ? 'var(--dark-green)' : 'var(--text-gray)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <MdBarChart />
          </button>
        </div>
      </div>
      
      <div style={{ height: '100%', width: '100%', flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--light-gray)" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="var(--text-gray)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="var(--text-gray)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--white)',
                  border: '1px solid var(--border-gray)',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px var(--shadow-subtle)',
                  fontSize: '0.75rem'
                }}
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              />
              <Bar 
                dataKey="beneficiaries" 
                fill="var(--teal)" 
                radius={[4, 4, 0, 0]}
                barSize={12}
              />
              <Bar 
                dataKey="seedlings" 
                fill="var(--olive-green)" 
                radius={[4, 4, 0, 0]}
                barSize={12}
              />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={[
                  { name: 'Beneficiaries', value: chartData.reduce((sum, item) => sum + item.beneficiaries, 0) },
                  { name: 'Seedlings', value: chartData.reduce((sum, item) => sum + item.seedlings, 0) / 20 }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={130}
                fill="var(--teal)"
                dataKey="value"
              >
                <Cell fill="var(--teal)" />
                <Cell fill="var(--olive-green)" />
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--white)',
                  border: '1px solid var(--border-gray)',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px var(--shadow-subtle)',
                  fontSize: '0.75rem'
                }}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem', color: 'var(--dark-text)' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--teal)',
            marginRight: '0.4rem'
          }}></div>
          <span>Beneficiaries</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem', color: 'var(--dark-text)' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--olive-green)',
            marginRight: '0.4rem'
          }}></div>
          <span>Seedlings</span>
        </div>
      </div>
    </div>
  );
};

export default LineGraph;