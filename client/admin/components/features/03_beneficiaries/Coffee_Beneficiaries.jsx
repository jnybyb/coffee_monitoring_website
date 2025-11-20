import React, { useState, useEffect } from 'react';
import { FaList, FaUserCircle } from "react-icons/fa";
import { FaRegIdCard } from "react-icons/fa6";
import { MdOutlineLocationOn } from "react-icons/md";
import { LuLandPlot } from "react-icons/lu";
import { GiSeedling } from "react-icons/gi";
import { BsGridFill } from "react-icons/bs";
import { RiAddLargeFill } from 'react-icons/ri';
import AddRecord from './AddRecordModal';
import NoDataDisplay from '../../ui/NoDataDisplay';
import Pagination from '../../ui/Pagination';
import DetailContainer from './DetailContainer';
import { ViewModeButton } from '../../ui/BeneficiaryButtons';
import { beneficiariesAPI } from '../../../services/api';

// Reusable Card Detail Row Component
const CardDetailRow = ({ icon, label, value }) => (
  <>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
      {icon}
      <strong style={{ color: '#6c757d' }}>{label}</strong>
    </div>
    <div style={{ textAlign: 'center' }}>:</div>
    <div>{value}</div>
  </>
);

const Coffee_Beneficiaries = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'card' or 'list'
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch beneficiaries when mounted
  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      const data = await beneficiariesAPI.getAll();
      setBeneficiaries(data || []);
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      setBeneficiaries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async () => {
    await fetchBeneficiaries();
    setShowAddRecord(false);
  };

  const filteredBeneficiaries = beneficiaries.filter(ben => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${ben.firstName} ${ben.middleName || ''} ${ben.lastName}`.toLowerCase();
    const address = `${ben.barangay}, ${ben.municipality}, ${ben.province}`.toLowerCase();
    return (
      ben.beneficiaryId?.toLowerCase().includes(searchLower) ||
      fullName.includes(searchLower) ||
      address.includes(searchLower)
    );
  });

  // Pagination logic
  const totalRecords = filteredBeneficiaries.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedBeneficiaries = filteredBeneficiaries.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* MAIN CONTENT AREA - Full width */}
      <div
        style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minWidth: 0,
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: '1rem',
            flexShrink: 0,
            borderBottom: 'none',
            boxShadow: 'none',
          }}
        >
          <h2
            style={{
              color: 'var(--primary-green)',
              fontSize: '1.5rem',
              fontWeight: 600,
              margin: 0,
              borderBottom: 'none',
            }}
          >
            Coffee Beneficiaries
          </h2>
        </div>

        {/* SEARCH + TABLE WRAPPER */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '0 1rem 1rem 1rem',
            minHeight: 0,
          }}
        >
          {/* SEARCH BAR + ACTION BUTTONS */}
          <div
            style={{
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            {/* Left side: View Mode Buttons + Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* View Mode Buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <ViewModeButton
                  onClick={() => setViewMode('list')}
                  isActive={viewMode === 'list'}
                  icon={<FaList size={10} />}
                >
                  List
                </ViewModeButton>
                <ViewModeButton
                  onClick={() => setViewMode('card')}
                  isActive={viewMode === 'card'}
                  icon={<BsGridFill size={10} />}
                >
                  Card
                </ViewModeButton>
              </div>

              {/* Search Input */}
              <input
                type="text"
                placeholder="Search beneficiaries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '200px',
                  padding: '0.3rem 0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  outline: 'none',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary-green)')}
                onBlur={(e) => (e.target.style.borderColor = '#ddd')}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                style={{
                  padding: '0.5rem 1.25rem',
                  backgroundColor: 'var(--white)',
                  color: 'var(--dark-green)',
                  border: '1px solid var(--dark-green)',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <RiAddLargeFill size={12} />
                <span>Import Record</span>
              </button>

              <button
                onClick={() => setShowAddRecord(true)}
                style={{
                  padding: '0.5rem 1.25rem',
                  backgroundColor: 'var(--dark-green)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <RiAddLargeFill size={12} />
                <span>Add Record</span>
              </button>
            </div>
          </div>

          {/* TABLE AREA (fills all height) */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {loading ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  color: '#666',
                }}
              >
                Loading beneficiaries...
              </div>
            ) : filteredBeneficiaries.length > 0 ? (
              viewMode === 'list' ? (
                // LIST VIEW - Table Format
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    minHeight: 0,
                    borderRadius: '5px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      backgroundColor: '#e8f5e8',
                      borderBottom: '2px solid #2c5530',
                      display: 'grid',
                      gridTemplateColumns: '18% 19% 25% 19% 19%',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: '#2c5530',
                    }}
                  >
                    <div style={{ padding: '10px 10px' }}>Beneficiary ID</div>
                    <div style={{ padding: '10px 8px' }}>Full Name</div>
                    <div style={{ padding: '10px 3px' }}>Address</div>
                    <div style={{ padding: '10px 8px', textAlign: 'center' }}>Number of Farms</div>
                    <div style={{ padding: '8px 12px', textAlign: 'center' }}>Total Seedling Received</div>
                  </div>

                  <div
                    style={{
                      flex: 1,
                      overflowY: 'auto',
                    }}
                  >
                    {paginatedBeneficiaries.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBeneficiary(b)}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '18% 19% 25% 19% 19%',
                          fontSize: '0.60rem',
                          padding: '5px 12px',
                          borderBottom: '1px solid #f0f0f0',
                          cursor: 'pointer',
                          backgroundColor:
                            selectedBeneficiary?.id === b.id ? '#f0f9f0' : 'white',
                          transition: 'background-color 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (selectedBeneficiary?.id !== b.id)
                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                        }}
                        onMouseLeave={(e) => {
                          if (selectedBeneficiary?.id !== b.id)
                            e.currentTarget.style.backgroundColor = 'white';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>{b.beneficiaryId}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {b.picture ? (
                            <img
                              src={b.picture}
                              alt={`${b.firstName} ${b.lastName}`}
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '1px solid #ddd'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'inline-block';
                              }}
                            />
                          ) : null}
                          <FaUserCircle
                            size={24}
                            color="#6c757d"
                            style={{ display: b.picture ? 'none' : 'inline-block' }}
                          />
                          <span>{`${b.firstName} ${b.middleName || ''} ${b.lastName}`}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>{`${b.barangay}, ${b.municipality}, ${b.province}`}</div>
                        <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</div>
                        <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {filteredBeneficiaries.length > 0 && (
                    <Pagination
                      currentPage={currentPage}
                      totalRecords={totalRecords}
                      pageSize={pageSize}
                      onPageChange={setCurrentPage}
                      onPageSizeChange={setPageSize}
                    />
                  )}
                </div>
              ) : (
                // CARD VIEW - Grid Format
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    minHeight: 0,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      overflowY: 'auto',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: '.5rem',
                      alignContent: 'start',
                    }}
                  >
                    {paginatedBeneficiaries.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBeneficiary(b)}
                        style={{
                          backgroundColor: selectedBeneficiary?.id === b.id ? '#f0f9f0' : 'white',
                          border: selectedBeneficiary?.id === b.id ? '2px solid var(--dark-green)' : '1px solid #e0e0e0',
                          borderRadius: '8px',
                          padding: '1rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                        onMouseEnter={(e) => {
                          if (selectedBeneficiary?.id !== b.id) {
                            e.currentTarget.style.borderColor = '#c0c0c0';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedBeneficiary?.id !== b.id) {
                            e.currentTarget.style.borderColor = '#e0e0e0';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                          }
                        }}
                      >
                        {/* Profile Section */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          {b.picture ? (
                            <img
                              src={b.picture}
                              alt={`${b.firstName} ${b.lastName}`}
                              style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid #e8f5e8',
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <FaUserCircle
                            size={50}
                            color="#6c757d"
                            style={{ display: b.picture ? 'none' : 'block' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#2c5530', marginBottom: '0.2rem' }}>
                              {`${b.firstName} ${b.middleName || ''} ${b.lastName}`}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#6c757d', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <FaRegIdCard size={12} />
                              {b.beneficiaryId}
                            </div>
                          </div>
                        </div>

                        {/* Details Section */}
                        <div style={{ fontSize: '0.65rem', color: '#495057', lineHeight: '1.4' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'max-content 8px 1fr', rowGap: '0.3rem', alignItems: 'center' }}>
                            <CardDetailRow
                              icon={<MdOutlineLocationOn size={12} style={{ color: '#6c757d' }} />}
                              label="Address"
                              value={`${b.barangay}, ${b.municipality}, ${b.province}`}
                            />
                            <CardDetailRow
                              icon={<LuLandPlot size={12} style={{ color: '#6c757d' }} />}
                              label="Farms"
                              value="-"
                            />
                            <CardDetailRow
                              icon={<GiSeedling size={12} style={{ color: '#6c757d' }} />}
                              label="Seedlings"
                              value={b.totalSeedlings ?? b.seedlings ?? '-'}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {filteredBeneficiaries.length > 0 && (
                    <Pagination
                      currentPage={currentPage}
                      totalRecords={totalRecords}
                      pageSize={pageSize}
                      onPageChange={setCurrentPage}
                      onPageSizeChange={setPageSize}
                    />
                  )}
                </div>
              )
            ) : (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <NoDataDisplay />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DETAIL CONTAINER OVERLAY */}
      {selectedBeneficiary && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '400px',
            height: '100%',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'white',
              boxShadow: '-4px 0 12px rgba(0,0,0,0.15)',
              overflowY: 'auto',
            }}
          >
            <DetailContainer
              selectedBeneficiary={selectedBeneficiary}
              onClose={() => setSelectedBeneficiary(null)}
            />
          </div>
        </div>
      )}

      {/* ADD RECORD MODAL */}
      <AddRecord
        isOpen={showAddRecord}
        onClose={() => setShowAddRecord(false)}
        onSubmit={handleAddRecord}
      />
    </div>
  );
};

export default Coffee_Beneficiaries;
