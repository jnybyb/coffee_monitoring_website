import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LineGraph = ({ active }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        border: '1px solid var(--light-border)',
        textAlign: 'center'
      }}>
        <p style={{ color: 'var(--primary-green)', fontSize: '1rem' }}>
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
        border: '1px solid var(--light-border)',
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
      border: '1px solid var(--light-border)'
    }}>
      <div style={{ marginBottom: '0.75rem' }}>
        <h3 style={{ 
          color: 'var(--primary-green)', 
          fontSize: '1rem', 
          fontWeight: 600, 
          margin: '0 0 0.25rem 0' 
        }}>
          Coffee Monitoring Trends
        </h3>
        <p style={{ 
          color: 'var(--text-gray)', 
          fontSize: '0.8rem', 
          margin: 0 
        }}>
          Monthly overview of beneficiaries, seedlings distributed, and crop status
        </p>
      </div>
      
      <div style={{ height: '280px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 15,
              right: 20,
              left: 15,
              bottom: 15,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--light-border)" />
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
                border: '1px solid var(--light-border)',
                borderRadius: '6px',
                boxShadow: '0 4px 12px var(--shadow-subtle)',
                fontSize: '0.8rem'
              }}
              labelStyle={{ color: 'var(--primary-green)', fontWeight: 600 }}
            />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '0.75rem',
                fontSize: '0.8rem'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="beneficiaries" 
              stroke="var(--bright-green)" 
              strokeWidth={2}
              dot={{ fill: 'var(--bright-green)', strokeWidth: 1, r: 3 }}
              activeDot={{ r: 4, stroke: 'var(--bright-green)', strokeWidth: 1 }}
              name="New Beneficiaries"
            />
            <Line 
              type="monotone" 
              dataKey="seedlings" 
              stroke="var(--primary-blue)" 
              strokeWidth={2}
              dot={{ fill: 'var(--primary-blue)', strokeWidth: 1, r: 3 }}
              activeDot={{ r: 4, stroke: 'var(--primary-blue)', strokeWidth: 1 }}
              name="Seedlings Distributed"
            />
            <Line 
              type="monotone" 
              dataKey="aliveCrops" 
              stroke="var(--lime-green)" 
              strokeWidth={2}
              dot={{ fill: 'var(--lime-green)', strokeWidth: 1, r: 3 }}
              activeDot={{ r: 4, stroke: 'var(--lime-green)', strokeWidth: 1 }}
              name="Alive Crops"
            />
            <Line 
              type="monotone" 
              dataKey="deadCrops" 
              stroke="var(--danger-red)" 
              strokeWidth={2}
              dot={{ fill: 'var(--danger-red)', strokeWidth: 1, r: 3 }}
              activeDot={{ r: 4, stroke: 'var(--danger-red)', strokeWidth: 1 }}
              name="Dead Crops"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineGraph;