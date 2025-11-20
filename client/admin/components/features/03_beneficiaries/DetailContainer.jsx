import React, { useState } from 'react';
import { FaUserCircle, FaVenusMars, FaRing, FaBirthdayCake, FaCalendarAlt, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { LuLandPlot } from 'react-icons/lu';
import { GiSeedling } from 'react-icons/gi';
import { RiAddLargeFill, RiUploadFill } from 'react-icons/ri';
import { CiEdit } from "react-icons/ci";
import { PiTrashLight } from "react-icons/pi";
import { SaveButton, CancelButton, AddButton, ActionButton } from '../../ui/BeneficiaryButtons';
import AddFarmPlotModal from '../../features/02_farm-monitoring/AddFarmPlotModal';
import AddSeedlingRecordModal from './seedlings/AddSeedlingRecordModal';

// Reusable Detail Field Component
const DetailField = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
    <div style={{ color: '#6c757d', fontSize: '0.75rem', fontWeight: 500, opacity: 0.7 }}>
      {label}
    </div>
    <div style={{ color: '#495057', fontSize: '0.85rem', fontWeight: 600 }}>{value || '-'}</div>
  </div>
);

const DetailContainer = ({ selectedBeneficiary, onClose }) => {
  const [showAddFarmPlot, setShowAddFarmPlot] = useState(false);
  const [showAddSeedling, setShowAddSeedling] = useState(false);
  
  if (!selectedBeneficiary) return null;

  // Add modals
  const beneficiaries = [selectedBeneficiary]; // Pass the selected beneficiary as an array

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          position: 'relative',
          padding: '0.5rem',
        }}
      >
        {/* Close Button */}
        <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', zIndex: 10 }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '2.5rem',
              color: '#666',
              cursor: 'pointer',
              padding: '.2rem',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Profile Picture */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '2rem',
          }}
        >
          {selectedBeneficiary.picture ? (
            <img
              src={selectedBeneficiary.picture}
              alt={`${selectedBeneficiary.firstName} ${selectedBeneficiary.lastName}`}
              style={{
                width: '75px',
                height: '75px',
                borderRadius: '50%',
                border: '4px solid white',
                objectFit: 'cover',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                marginBottom: '0.3rem',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            style={{
              display: selectedBeneficiary.picture ? 'none' : 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '75px',
              height: '75px',
              borderRadius: '50%',
              border: '4px solid white',
              backgroundColor: '#f1f3f5',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <FaUserCircle size={70} color="#6c757d" />
          </div>
        </div>

        {/* Name and ID below the profile image */}
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2c3e50', marginBottom: '0.2rem' }}>
            {`${selectedBeneficiary.firstName} ${selectedBeneficiary.middleName || ''} ${selectedBeneficiary.lastName}`}
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#6c757d', margin: '0 0 0.5rem 0' }}>
            {selectedBeneficiary.beneficiaryId || 'Registered Beneficiary'}
          </p>
          {/* Edit and Delete Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <ActionButton
              icon={<CiEdit size={12} />}
              onClick={() => console.log('Edit beneficiary')}
              size="small"
              style={{ 
                backgroundColor: 'white',
                color: 'var(--dark-green)',
                borderColor: 'var(--dark-green)',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
            >
              Edit
            </ActionButton>
            <ActionButton
              icon={<PiTrashLight size={12} />}
              onClick={() => console.log('Delete beneficiary')}
              size="small"
              style={{ 
                backgroundColor: 'white',
                color: '#dc3545',
                borderColor: '#dc3545',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
            >
              Delete
            </ActionButton>
          </div>
        </div>

        {/* Personal Information Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '2rem',
            marginLeft: '0.5rem',
            marginBottom: '0.5rem',
            color: '#2c5530',
            fontWeight: '600',
            fontSize: '0.85rem',
          }}
        >
          <FaUserCircle size={18} />
          <span>Personal Information</span>
        </div>

        {/* Personal Details Section - Removed container styling */}
        <div
          style={{
            padding: '0 0.5rem',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              columnGap: '1rem',
              rowGap: '1rem',
            }}
          >
            <DetailField
              label="Gender"
              value={selectedBeneficiary.gender}
            />
            <DetailField
              label="Marital Status"
              value={selectedBeneficiary.maritalStatus}
            />
            <DetailField
              label="Birthdate"
              value={
                selectedBeneficiary.birthDate
                  ? new Date(selectedBeneficiary.birthDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '-'
              }
            />
            <DetailField
              label="Age"
              value={selectedBeneficiary.age ?? '-'}
            />
            <DetailField
              label="Contact Number"
              value={selectedBeneficiary.cellphone}
            />
            <DetailField
              label="Address"
              value={`${selectedBeneficiary.purok ? selectedBeneficiary.purok + ', ' : ''}${selectedBeneficiary.barangay || '-'}, ${selectedBeneficiary.municipality || '-'}, ${selectedBeneficiary.province || '-'}`}
            />
          </div>
        </div>

        {/* Separator Line */}
        <div style={{ 
          height: '1px', 
          backgroundColor: '#e9ecef', 
          margin: '1.5rem 0.5rem' 
        }} />

        {/* Farm Plots Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginLeft: '0.5rem',
            marginBottom: '0.8rem',
            color: '#2c5530',
            fontWeight: '600',
            fontSize: '0.85rem',
          }}
        >
          <LuLandPlot size={18} />
          <span>Farm Plots</span>
        </div>

        {/* Farm Plots Content */}
        <div
          style={{
            padding: '0 0.5rem',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              padding: '1.5rem',
              color: '#6c757d',
              fontSize: '0.75rem',
            }}
          >
            <LuLandPlot size={22} color="#adb5bd" style={{ marginBottom: '0.5rem' }} />
            <p style={{ margin: 0 }}>No farm plots available</p>
            <div style={{ 
              marginTop: '1rem',
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <button
                style={{
                  padding: '0.3rem 0.7rem',
                  backgroundColor: 'var(--white)',
                  color: 'var(--dark-green)',
                  border: '1px solid var(--dark-green)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.60rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RiUploadFill size={10} />
                <span>Import</span>
              </button>
              <button
                onClick={() => setShowAddFarmPlot(true)}
                style={{
                  padding: '0.3rem 0.7rem',
                  backgroundColor: 'var(--dark-green)',
                  color: 'white',
                  border: '1px solid var(--dark-green)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.60rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RiAddLargeFill size={10} />
                <span>Add Farm Plot</span>
              </button>
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div style={{ 
          height: '1px', 
          backgroundColor: '#e9ecef', 
          margin: '1.5rem 0.5rem' 
        }} />

        {/* Seedling Records Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginLeft: '0.5rem',
            marginBottom: '0.8rem',
            color: '#2c5530',
            fontWeight: '600',
            fontSize: '0.85rem',
          }}
        >
          <GiSeedling size={18} />
          <span>Seedling Records</span>
        </div>

        {/* Seedling Records Content */}
        <div
          style={{
            padding: '0 0.5rem',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              padding: '1.5rem',
              color: '#6c757d',
              fontSize: '0.75rem',
            }}
          >
            <GiSeedling size={22} color="#adb5bd" style={{ marginBottom: '0.5rem' }} />
            <p style={{ margin: 0 }}>No seedling records available</p>
            <div style={{ 
              marginTop: '1rem',
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <button
                style={{
                  padding: '0.3rem 0.7rem',
                  backgroundColor: 'var(--white)',
                  color: 'var(--dark-green)',
                  border: '1px solid var(--dark-green)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.60rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RiUploadFill size={10} />
                <span>Import</span>
              </button>
              <button
                onClick={() => setShowAddSeedling(true)}
                style={{
                  padding: '0.3rem 0.7rem',
                  backgroundColor: 'var(--dark-green)',
                  color: 'white',
                  border: '1px solid var(--dark-green)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.60rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RiAddLargeFill size={10} />
                <span>Add Seedling</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <AddFarmPlotModal 
        isOpen={showAddFarmPlot}
        onClose={() => setShowAddFarmPlot(false)}
        onSubmit={async (data) => {
          console.log('Farm plot data:', data);
          setShowAddFarmPlot(false);
        }}
        beneficiaries={beneficiaries}
      />
      <AddSeedlingRecordModal
        isOpen={showAddSeedling}
        onClose={() => setShowAddSeedling(false)}
        onSubmit={async (data) => {
          console.log('Seedling record data:', data);
          setShowAddSeedling(false);
        }}
        selectedBeneficiary={selectedBeneficiary}
      />
    </>
  );
};

export default DetailContainer;