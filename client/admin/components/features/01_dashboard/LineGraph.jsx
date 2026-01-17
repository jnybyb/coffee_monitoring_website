import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { statisticsAPI, beneficiariesAPI } from '../../../services/api';
import { HiMagnifyingGlass } from 'react-icons/hi2';

const LineGraph = ({ active }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Filter states for user-controlled chart display
  const [timePeriod, setTimePeriod] = useState('monthly'); // 'yearly', 'monthly', 'weekly'
  const [dataFilter, setDataFilter] = useState('all'); // 'all', 'alive', 'dead', 'seedlings'
  // Beneficiary filter states
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchBeneficiaries = async () => {
    try {
      const data = await beneficiariesAPI.getAll();
      setBeneficiaries(data || []);
    } catch (err) {
      console.error('Error fetching beneficiaries:', err);
    }
  };

  // Fetch chart data when Dashboard becomes active or beneficiary changes
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);
        const beneficiaryId = selectedBeneficiary?.id || null;
        const data = await statisticsAPI.getChartData(beneficiaryId);
        setChartData(data);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    if (active === 'Dashboard' || active) {
      fetchChartData();
      fetchBeneficiaries();
    }
  }, [active, selectedBeneficiary]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('[data-beneficiary-search]')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Filter beneficiaries based on search term
  const filteredBeneficiaries = beneficiaries.filter(beneficiary => {
    const fullName = `${beneficiary.firstName || ''} ${beneficiary.middleName || ''} ${beneficiary.lastName || ''}`.toLowerCase();
    const beneficiaryId = beneficiary.beneficiaryId?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || beneficiaryId.includes(search);
  });

  const handleBeneficiarySelect = (beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setSearchTerm(beneficiary ? `${beneficiary.firstName} ${beneficiary.lastName} (${beneficiary.beneficiaryId})` : '');
    setShowDropdown(false);
  };

  const handleClearFilter = () => {
    setSelectedBeneficiary(null);
    setSearchTerm('');
    setShowDropdown(false);
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
        marginBottom: '0.75rem' 
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <h3 style={{ 
            color: 'var(--dark-green)', 
            fontSize: '0.9rem', 
            fontWeight: 600, 
            margin: 0 
          }}>
            Trend Monitoring
          </h3>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '0.5rem',
            flex: 1,
            justifyContent: 'flex-end'
          }}>
            {/* Beneficiary Search Bar */}
            <div style={{ position: 'relative' }} data-beneficiary-search>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                minWidth: '270px'
              }}>
                <HiMagnifyingGlass style={{
                  position: 'absolute',
                  left: '0.5rem',
                  fontSize: '0.9rem',
                  color: 'var(--text-gray)',
                  pointerEvents: 'none'
                }} />
                <input
                  type="text"
                  placeholder="Search beneficiary..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                    if (!e.target.value && selectedBeneficiary) {
                      setSelectedBeneficiary(null);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (filteredBeneficiaries.length > 0) {
                        handleBeneficiarySelect(filteredBeneficiaries[0]);
                      }
                    }
                  }}
                  onFocus={() => setShowDropdown(true)}
                  style={{
                    width: '270px',
                    padding: '0.4rem 2rem 0.4rem 2rem',
                    fontSize: '0.75rem',
                    color: 'var(--dark-green)',
                    backgroundColor: 'var(--white)',
                    border: '1px solid var(--border-gray)',
                    borderRadius: '4px',
                    outline: 'none',
                    fontFamily: 'var(--font-main)'
                  }}
                />
                {(selectedBeneficiary || searchTerm) && (
                  <button
                    onClick={handleClearFilter}
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      padding: '0.2rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-gray)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      outline: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '20px',
                      height: '20px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'var(--light-gray)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Dropdown List */}
              {showDropdown && searchTerm && filteredBeneficiaries.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.25rem',
                  backgroundColor: 'var(--white)',
                  border: '1px solid var(--border-gray)',
                  borderRadius: '4px',
                  boxShadow: '0 4px 12px var(--shadow-subtle)',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  minWidth: '200px'
                }}>
                  {filteredBeneficiaries.map((beneficiary) => (
                    <div
                      key={beneficiary.id}
                      onClick={() => handleBeneficiarySelect(beneficiary)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.75rem',
                        color: 'var(--dark-text)',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--light-gray)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'var(--mint-green)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{ fontWeight: 500 }}>
                        {beneficiary.firstName} {beneficiary.lastName}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-gray)' }}>
                        {beneficiary.beneficiaryId}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No results message */}
              {showDropdown && searchTerm && filteredBeneficiaries.length === 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.25rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--white)',
                  border: '1px solid var(--border-gray)',
                  borderRadius: '4px',
                  boxShadow: '0 4px 12px var(--shadow-subtle)',
                  fontSize: '0.75rem',
                  color: 'var(--text-gray)',
                  zIndex: 1000,
                  minWidth: '200px'
                }}>
                  No beneficiaries found
                </div>
              )}
            </div>

            {/* Filter Dropdowns */}
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
              {/* Gradient definitions for chart lines */}
              <linearGradient id="seedlingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--teal)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--teal)" stopOpacity={0.1}/>
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
            {/* Conditionally render chart lines based on dataFilter selection */}
            {(dataFilter === 'all' || dataFilter === 'seedlings') && (
              <Line 
                type="monotone"
                dataKey="seedlings" 
                stroke="var(--teal)" 
                dot={{ fill: 'var(--teal)', r: 4 }}
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
              backgroundColor: 'var(--teal)',
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
