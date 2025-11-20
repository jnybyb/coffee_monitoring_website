import React, { useState } from 'react';
import { IoIosSearch } from "react-icons/io";
import { GrMapLocation } from "react-icons/gr";
import { FaUsersLine } from "react-icons/fa6";
import NoDataDisplay from '../../ui/NoDataDisplay';

const MapDetails = () => {
  const [activeTab, setActiveTab] = useState('beneficiaries'); // Track active tab
  const [searchTerm, setSearchTerm] = useState(''); // Track search input
  
  // Empty beneficiaries data (would come from API in a real implementation)
  const sampleBeneficiaries = [];
  
  // Empty farms data
  const sampleFarms = [];
  
  // Function to render default profile icon when picture is not available
  const renderProfileIcon = () => (
    <div style={{
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: 'var(--light-gray)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#666',
      fontSize: '16px',
      fontWeight: 'bold'
    }}>
      📷
    </div>
  );
  
  // Filter beneficiaries based on search term
  const filteredBeneficiaries = sampleBeneficiaries.filter(beneficiary =>
    beneficiary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beneficiary.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter farms based on search term
  const filteredFarms = sampleFarms.filter(farm =>
    farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.beneficiary.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--white)',
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* Title */}
      <div style={{
        padding: '1.5rem 1.25rem 0.5rem 1.25rem',
        fontSize: '1.1rem',
        fontWeight: 600,
        color: 'var(--dark-green)'
      }}>
        Farm Plots
      </div>

      {/* Search Bar */}
      <div style={{
        padding: '0.45rem 1.25rem',
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid var(--border-gray)',
          borderRadius: '4px',
          width: '100%'
        }}>
          <div style={{
            color: 'var(--text-gray)',
            padding: '0.4rem',
            fontSize: '0.82rem' 
          }}>
            <IoIosSearch />
          </div>
          <input
            type="text"
            placeholder={activeTab === 'beneficiaries' ? "Search beneficiaries..." : "Search farms..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '0.5rem 0',
              border: 'none',
              outline: 'none',
              fontSize: '0.65rem',
              backgroundColor: 'transparent'
            }}
          />
        </div>
      </div>
      
      {/* Tabs - Fixed at the top */}
      <div style={{
        display: 'flex',
        padding: '0 1.25rem',
        backgroundColor: 'transparent',
        flexShrink: 0,
        width: '100%',
        gap: '1rem'
      }}>
        <button
          onClick={() => setActiveTab('beneficiaries')}
          style={{
            flex: 1,
            padding: '1rem 0.5rem 0.5rem 0',
            background: 'transparent',
            color: activeTab === 'beneficiaries' ? 'var(--dark-green)' : 'var(--dark-gray)',
            border: 'none',
            borderBottom: activeTab === 'beneficiaries' ? '3px solid var(--dark-green)' : 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.7rem',
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>Beneficiaries</span>
          <span style={{
            background: 'transparent',
            color: activeTab === 'beneficiaries' ? 'var(--dark-green)' : 'var(--dark-gray)',
            fontSize: '0.6rem'
          }}>
            {filteredBeneficiaries.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('farms')}
          style={{
            flex: 1,
            padding: '1rem 0 0.5rem 0.5rem',
            background: 'transparent',
            color: activeTab === 'farms' ? 'var(--dark-green)' : 'var(--dark-gray)',
            border: 'none',
            borderBottom: activeTab === 'farms' ? '3px solid var(--dark-green)' : 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.7rem',
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>Farms</span>
          <span style={{
            background: 'transparent',
            color: activeTab === 'farms' ? 'var(--dark-green)' : 'var(--dark-gray)',
            fontSize: '0.6rem'
          }}>
            {filteredFarms.length}
          </span>
        </button>
      </div>

      {/* Content area - Only this part scrolls */}
      <div style={{
        padding: '0.80rem 1.25rem',
        overflowY: 'auto',
        flex: 1
      }}>
        {activeTab === 'beneficiaries' && (
          <div>
            {filteredBeneficiaries.length === 0 ? (
              <NoDataDisplay 
                icon={<FaUsersLine />} 
                title="No Beneficiaries Available."
                iconSize={30}
                iconColor="var(--gray-icon)"
                height="350px"
              />
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                {filteredBeneficiaries.map((beneficiary, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem',
                    border: '1px solid var(--light-border)',
                    borderRadius: '6px',
                    backgroundColor: 'var(--white)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    width: '100%'
                  }}>
                    {/* Left side - Profile Picture, Name, and Beneficiary ID */}
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      flex: 1,
                      minWidth: 0
                    }}>
                      {/* Profile Picture or Icon */}
                      <div style={{ marginRight: '0.6rem', flexShrink: 0 }}>
                        {beneficiary.picture ? (
                          <img 
                            src={beneficiary.picture} 
                            alt={beneficiary.name}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          renderProfileIcon()
                        )}
                      </div>
                      
                      {/* Beneficiary Info */}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          color: 'var(--dark-gray)',
                          marginBottom: '0.2rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {beneficiary.name}
                        </div>
                        <div style={{
                          fontSize: '0.6rem',
                          color: 'var(--text-gray)'
                        }}>
                          ID: {beneficiary.id}
                        </div>
                      </div>
                    </div>
                    
                    {/* Right side - Farm Plots and Counter */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      flexShrink: 0,
                      marginLeft: '1rem'
                    }}>
                      <div style={{
                        fontSize: '0.60rem',
                        color: 'var(--text-gray)',
                        textAlign: 'right'
                      }}>
                        <div>Plots</div>
                        <div style={{
                          fontWeight: 500,
                          fontSize: '0.85rem',
                          color: 'var(--dark-green)'
                        }}>
                          {beneficiary.farmPlots}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'farms' && (
          <div>
            {filteredFarms.length === 0 ? (
              <NoDataDisplay 
                icon={<GrMapLocation />} 
                title="No Farms Available."
                iconSize={30}
                iconColor="var(--gray-icon)"
                height="350px"
              />
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                {filteredFarms.map((farm, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem',
                    border: '1px solid var(--light-border)',
                    borderRadius: '6px',
                    backgroundColor: 'var(--white)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    width: '100%'
                  }}>
                    {/* Farm Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        color: 'var(--dark-gray)',
                        marginBottom: '0.2rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {farm.name}
                      </div>
                      <div style={{
                        fontSize: '0.6rem',
                        color: 'var(--text-gray)',
                        marginBottom: '0.2rem'
                      }}>
                        ID: {farm.id}
                      </div>
                      <div style={{
                        fontSize: '0.6rem',
                        color: 'var(--text-gray)',
                        marginBottom: '0.2rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        Beneficiary: {farm.beneficiary}
                      </div>
                      <div style={{
                        fontSize: '0.6rem',
                        color: 'var(--text-gray)'
                      }}>
                        Area: {farm.area}
                      </div>
                    </div>
                    
                    {/* Right side - Status */}
                    <div style={{
                      flexShrink: 0,
                      marginLeft: '1rem',
                      textAlign: 'right'
                    }}>
                      <div style={{
                        fontSize: '0.6rem',
                        fontWeight: 500,
                        color: farm.status === 'Active' ? 'green' : farm.status === 'Inactive' ? 'red' : 'orange'
                      }}>
                        {farm.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapDetails;