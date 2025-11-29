import React, { useState, useEffect } from 'react';
import { IoIosSearch } from "react-icons/io";
import { IoCloseCircle } from "react-icons/io5";
import { GrMapLocation } from "react-icons/gr";
import { FaUsersLine } from "react-icons/fa6";
import NoDataDisplay from '../../ui/NoDataDisplay';
import ViewFarmPlotModal from './ViewFarmPlotModal';

const MapDetails = ({ beneficiaries = [], farmPlots = [], onViewAll, onEditPlot, onDeleteSuccess = null }) => {
  const [activeTab, setActiveTab] = useState('beneficiaries'); // Track active tab
  const [searchTerm, setSearchTerm] = useState(''); // Track search input
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [selectedPlotIndex, setSelectedPlotIndex] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  
  // Filter beneficiaries to only include those with farm plots
  const beneficiariesWithPlots = beneficiaries.filter(beneficiary => 
    farmPlots.some(plot => plot.beneficiaryId === (beneficiary.beneficiaryId || beneficiary.id))
  );
  
  // Filter beneficiaries based on search term and those with plots
  const filteredBeneficiaries = beneficiariesWithPlots.filter(beneficiary =>
    (beneficiary.fullName || beneficiary.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (beneficiary.beneficiaryId || beneficiary.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter farms to only include those currently plotted (all farm plots passed in)
  const filteredFarms = farmPlots.filter(farm =>
    (farm.plotNumber || farm.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (farm.plotId || farm.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (farm.beneficiaryName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      color: 'var(--dark-text)',
      fontSize: '16px',
      fontWeight: 'bold'
    }}>
      📷
    </div>
  );

  // Handle farm plot click
  const handlePlotClick = (plot, index) => {
    setSelectedPlot(plot);
    setSelectedPlotIndex(index);
    setIsViewModalOpen(true);
  };

  // Handle beneficiary click - open modal with first plot of the beneficiary
  const handleBeneficiaryClick = (beneficiary) => {
    const beneficiaryPlots = farmPlots.filter(
      plot => plot.beneficiaryId === (beneficiary.beneficiaryId || beneficiary.id)
    );
    
    if (beneficiaryPlots.length > 0) {
      const firstPlot = beneficiaryPlots[0];
      const plotIndex = farmPlots.findIndex(p => p.id === firstPlot.id);
      setSelectedPlot(firstPlot);
      setSelectedPlotIndex(plotIndex);
      setIsViewModalOpen(true);
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsViewModalOpen(false);
    setSelectedPlot(null);
    setSelectedPlotIndex(null);
  };

  // Handle edit plot
  const handleEditPlot = async (updatedPlotData, index) => {
    try {
      if (onEditPlot) {
        await onEditPlot(updatedPlotData);
      }
    } catch (error) {
      console.error('Error editing plot:', error);
      // Error is already handled by the modal
    }
  };

  // Handle delete plot (placeholder - can be customized)
  const handleDeletePlot = (plot, index) => {
    console.log('Delete plot:', plot, index);
    // Add delete functionality here if needed
  };
  
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '1.1rem',
          fontWeight: 600,
          color: 'var(--dark-green)'
        }}>
          Farm Plots
        </div>
        <button
          onClick={onViewAll}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--dark-green)',
            fontSize: '0.65rem',
            fontWeight: 500,
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          View All
        </button>
      </div>

      {/* Search Bar */}
      <div style={{
        padding: '0.45rem 1.25rem',
        flexShrink: 0
      }}>
        <div style={{
          position: 'relative',
          width: '100%'
        }}>
          <IoIosSearch 
            size={16} 
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6c757d',
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            placeholder={activeTab === 'beneficiaries' ? "Search beneficiaries..." : "Search farms..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 2.5rem 0.5rem 2rem',
              border: '1px solid var(--border-gray)',
              borderRadius: '4px',
              fontSize: '0.65rem',
              outline: 'none'
            }}
          />
          {searchTerm && (
            <IoCloseCircle
              size={16}
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-gray)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--dark-green)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-gray)'}
            />
          )}
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
                  <div 
                    key={beneficiary.beneficiaryId || beneficiary.id || index} 
                    onClick={() => handleBeneficiaryClick(beneficiary)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem',
                      border: '1px solid var(--border-gray)',
                      borderRadius: '6px',
                      backgroundColor: 'var(--white)',
                      boxShadow: '0 1px 3px var(--shadow-subtle)',
                      width: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--white)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px var(--shadow-subtle)';
                    }}
                  >
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
                            alt={beneficiary.fullName || beneficiary.name}
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
                          {beneficiary.fullName || beneficiary.name || `${beneficiary.firstName || ''} ${beneficiary.middleName || ''} ${beneficiary.lastName || ''}`.trim()}
                        </div>
                        <div style={{
                          fontSize: '0.6rem',
                          color: 'var(--text-gray)'
                        }}>
                          ID: {beneficiary.beneficiaryId || beneficiary.id}
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
                        <div>Farms</div>
                        <div style={{
                          fontWeight: 500,
                          fontSize: '0.85rem',
                          color: 'var(--dark-green)'
                        }}>
                          {/* Count farm plots for this beneficiary */}
                          {farmPlots.filter(plot => plot.beneficiaryId === (beneficiary.beneficiaryId || beneficiary.id)).length}
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
                  <div 
                    key={farm.id || index} 
                    onClick={() => handlePlotClick(farm, index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem',
                      border: '1px solid var(--border-gray)',
                      borderRadius: '6px',
                      backgroundColor: 'var(--white)',
                      boxShadow: '0 1px 3px var(--shadow-subtle)',
                      width: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--white)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px var(--shadow-subtle)';
                    }}
                  >
                    {/* Left side - Profile Picture and Farm Info */}
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      flex: 1,
                      minWidth: 0
                    }}>
                      {/* Profile Picture or Icon */}
                      <div style={{ marginRight: '0.6rem', flexShrink: 0 }}>
                        {farm.beneficiaryPicture ? (
                          <img 
                            src={`http://localhost:5000${farm.beneficiaryPicture}`}
                            alt={farm.beneficiaryName}
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
                          {farm.plotId || farm.id}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem'
                        }}>
                          <div style={{
                            fontSize: '0.6rem',
                            color: 'var(--text-gray)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {farm.beneficiaryName}
                          </div>
                          <div style={{
                            fontSize: '0.6rem',
                            color: 'var(--text-gray)',
                            flexShrink: 0
                          }}>
                            {farm.beneficiaryId}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Farm Plot Modal */}
      <ViewFarmPlotModal
        isOpen={isViewModalOpen}
        onClose={handleCloseModal}
        plot={selectedPlot}
        plotIndex={selectedPlotIndex}
        otherPlots={farmPlots}
        beneficiaries={beneficiaries}
        onEdit={handleEditPlot}
        onDelete={handleDeletePlot}
        onDeleteSuccess={onDeleteSuccess}
      />
    </div>
  );
};

export default MapDetails;