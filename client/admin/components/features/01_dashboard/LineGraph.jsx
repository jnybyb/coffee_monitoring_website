import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { statisticsAPI } from '../../../services/api';

const LineGraph = ({ active }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('monthly'); // 'yearly', 'monthly', 'weekly'
  const [dataFilter, setDataFilter] = useState('all'); // 'all', 'alive', 'dead', 'seedlings'

  const fetchChartData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await statisticsAPI.getChartData();
      setChartData(data);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError('Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (active === 'Dashboard' || active) {
      fetchChartData();
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
        
        {/* Filter Dropdowns */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {/* Time Period Filter */}
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            style={{
              padding: '0.4rem 0.6rem',
              fontSize: '0.75rem',
              color: 'var(--dark-green)',
              backgroundColor: 'var(--white)',
              border: '1px solid var(--border-gray)',
              borderRadius: '4px',
              cursor: 'pointer',
              outline: 'none',
              fontFamily: 'var(--font-main)'
            }}
          >
            <option value="yearly">Yearly</option>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>

          {/* Data Filter */}
          <select
            value={dataFilter}
            onChange={(e) => setDataFilter(e.target.value)}
            style={{
              padding: '0.4rem 0.6rem',
              fontSize: '0.75rem',
              color: 'var(--dark-green)',
              backgroundColor: 'var(--white)',
              border: '1px solid var(--border-gray)',
              borderRadius: '4px',
              cursor: 'pointer',
              outline: 'none',
              fontFamily: 'var(--font-main)'
            }}
          >
            <option value="all">All Data</option>
            <option value="seedlings">Seedlings Only</option>
            <option value="alive">Alive Crops Only</option>
            <option value="dead">Dead Crops Only</option>
          </select>
        </div>
      </div>
      
      <div style={{ height: '100%', width: '100%', flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="seedlingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-gradient-dark)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--chart-gradient-light)" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="aliveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--success)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--success)" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="deadGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--danger-red)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--danger-red)" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
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
            {(dataFilter === 'all' || dataFilter === 'seedlings') && (
              <Line 
                type="monotone"
                dataKey="seedlings" 
                stroke="var(--chart-gradient-dark)" 
                dot={{ fill: 'var(--chart-gradient-dark)', r: 4 }}
                activeDot={{ r: 6 }}
                strokeWidth={2.5}
                fill="url(#seedlingGradient)"
              />
            )}
            {(dataFilter === 'all' || dataFilter === 'alive') && (
              <Line 
                type="monotone"
                dataKey="aliveCrops" 
                stroke="var(--success)" 
                dot={{ fill: 'var(--success)', r: 4 }}
                activeDot={{ r: 6 }}
                strokeWidth={2.5}
                fill="url(#aliveGradient)"
              />
            )}
            {(dataFilter === 'all' || dataFilter === 'dead') && (
              <Line 
                type="monotone"
                dataKey="deadCrops" 
                stroke="var(--danger-red)" 
                dot={{ fill: 'var(--danger-red)', r: 4 }}
                activeDot={{ r: 6 }}
                strokeWidth={2.5}
                fill="url(#deadGradient)"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '1.5rem',
        flexWrap: 'wrap'
      }}>
        {(dataFilter === 'all' || dataFilter === 'seedlings') && (
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem', color: 'var(--dark-text)' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--chart-gradient-dark)',
              marginRight: '0.4rem'
            }}></div>
            <span>Coffee Seedlings</span>
          </div>
        )}
        {(dataFilter === 'all' || dataFilter === 'alive') && (
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem', color: 'var(--dark-text)' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--success)',
              marginRight: '0.4rem'
            }}></div>
            <span>Alive Crops</span>
          </div>
        )}
        {(dataFilter === 'all' || dataFilter === 'dead') && (
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem', color: 'var(--dark-text)' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--danger-red)',
              marginRight: '0.4rem'
            }}></div>
            <span>Dead Crops</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LineGraph;