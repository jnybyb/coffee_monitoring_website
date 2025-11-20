import React, { useState, useEffect } from 'react';
import { IoClose } from "react-icons/io5";
import { Button } from '../../../ui/BeneficiaryButtons';
import { beneficiariesAPI } from '../../../../services/api';

const EditSeedlingRecordModal = ({ isOpen, onClose, onSubmit, record = null }) => {
  const [formData, setFormData] = useState({
    beneficiaryId: '',
    beneficiaryName: '',
    received: '',
    dateReceived: '',
    planted: '',
    hectares: '',
    plot: '',
    dateOfPlantingStart: '',
    dateOfPlantingEnd: ''
  });
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [beneficiariesLoading, setBeneficiariesLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const getFullName = (beneficiary) => {
    if (beneficiary.fullName) return beneficiary.fullName;
    const firstName = beneficiary.firstName || '';
    const middleName = beneficiary.middleName || '';
    const lastName = beneficiary.lastName || '';
    return `${firstName} ${middleName} ${lastName}`.trim().replace(/\s+/g, ' ');
  };

  useEffect(() => {
    const fetchBeneficiaries = async () => {
      setBeneficiariesLoading(true);
      try {
        const data = await beneficiariesAPI.getAll();
        let beneficiariesArray = data;
        if (data && data.data && Array.isArray(data.data)) {
          beneficiariesArray = data.data;
        } else if (!Array.isArray(data)) {
          setBeneficiaries([]);
          return;
        }
        const mapped = beneficiariesArray.map(b => ({
          beneficiaryId: b.beneficiaryId,
          fullName: b.fullName || `${b.firstName} ${b.middleName ? b.middleName + ' ' : ''}${b.lastName}`.trim()
        }));
        setBeneficiaries(mapped);
      } catch (err) {
        console.error('Error fetching beneficiaries:', err);
        setBeneficiaries([]);
      } finally {
        setBeneficiariesLoading(false);
      }
    };
    if (isOpen) fetchBeneficiaries();
  }, [isOpen]);

  useEffect(() => {
    if (record) {
      const beneficiary = beneficiaries.find(b => b.beneficiaryId === record.beneficiaryId);
      const beneficiaryName = beneficiary ? getFullName(beneficiary) : '';
      setFormData({
        beneficiaryId: record.beneficiaryId || '',
        beneficiaryName: beneficiaryName,
        received: record.received?.toString() || '',
        dateReceived: record.dateReceived ? new Date(record.dateReceived).toISOString().split('T')[0] : '',
        planted: record.planted?.toString() || '',
        hectares: record.hectares?.toString() || '',
        plot: record.plot || '',
        dateOfPlantingStart: record.dateOfPlantingStart ? new Date(record.dateOfPlantingStart).toISOString().split('T')[0] : (record.dateOfPlanting ? new Date(record.dateOfPlanting).toISOString().split('T')[0] : ''),
        dateOfPlantingEnd: record.dateOfPlantingEnd ? new Date(record.dateOfPlantingEnd).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData({
        beneficiaryId: '',
        beneficiaryName: '',
        received: '',
        dateReceived: '',
        planted: '',
        hectares: '',
        plot: '',
        dateOfPlantingStart: '',
        dateOfPlantingEnd: ''
      });
    }
    setErrors({});
    setSubmitError('');
  }, [record, isOpen, beneficiaries]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.beneficiaryName || !formData.beneficiaryId) {
      newErrors.beneficiaryName = 'Please select a valid beneficiary';
    }
    if (!formData.received || formData.received <= 0 || isNaN(parseInt(formData.received))) {
      newErrors.received = 'Received seedlings must be a valid positive number';
    }
    if (!formData.dateReceived || formData.dateReceived.trim() === '') {
      newErrors.dateReceived = 'Date received is required';
    } else {
      const dateReceived = new Date(formData.dateReceived);
      if (isNaN(dateReceived.getTime())) {
        newErrors.dateReceived = 'Please enter a valid date';
      }
    }
    if (!formData.planted || formData.planted <= 0 || isNaN(parseInt(formData.planted))) {
      newErrors.planted = 'Planted seedlings must be a valid positive number';
    } else if (parseInt(formData.planted) > parseInt(formData.received)) {
      newErrors.planted = 'Planted seedlings cannot exceed received seedlings';
    }
    if (!formData.hectares || formData.hectares <= 0 || isNaN(parseFloat(formData.hectares))) {
      newErrors.hectares = 'Hectares must be a valid positive number';
    }
    if (!formData.plot || formData.plot.trim() === '') {
      newErrors.plot = 'Plot is required';
    }
    if (!formData.dateOfPlantingStart) {
      newErrors.dateOfPlantingStart = 'Date of planting (start) is required';
    }
    if (formData.dateOfPlantingEnd && formData.dateOfPlantingStart) {
      const startDate = new Date(formData.dateOfPlantingStart);
      const endDate = new Date(formData.dateOfPlantingEnd);
      if (endDate < startDate) {
        newErrors.dateOfPlantingEnd = 'End date cannot be before start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'beneficiaryName') {
      const beneficiary = beneficiaries.find(b => getFullName(b) === value);
      setFormData(prev => ({
        ...prev,
        beneficiaryName: value,
        beneficiaryId: beneficiary ? beneficiary.beneficiaryId : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (!formData.dateReceived || formData.dateReceived.trim() === '') {
        throw new Error('Date received is required');
      }
      let formattedDateReceived = formData.dateReceived;
      try {
        const date = new Date(formData.dateReceived);
        if (!isNaN(date.getTime())) {
          formattedDateReceived = date.toISOString().split('T')[0];
        }
      } catch (error) {
        throw new Error('Invalid date format for Date Received');
      }

      const received = parseInt(formData.received);
      const planted = parseInt(formData.planted);
      const hectares = parseFloat(formData.hectares);

      if (isNaN(received) || received <= 0) throw new Error('Received seedlings must be a valid positive number');
      if (isNaN(planted) || planted <= 0) throw new Error('Planted seedlings must be a valid positive number');
      if (isNaN(hectares) || hectares <= 0) throw new Error('Hectares must be a valid positive number');
      if (planted > received) throw new Error('Planted seedlings cannot exceed received seedlings');

      const submitData = {
        id: record?.id,
        beneficiaryId: formData.beneficiaryId,
        received,
        dateReceived: formattedDateReceived,
        planted,
        hectares,
        plot: formData.plot.trim(),
        dateOfPlantingStart: formData.dateOfPlantingStart,
        dateOfPlantingEnd: formData.dateOfPlantingEnd || null
      };

      if (onSubmit) {
        await onSubmit(submitData);
      }

      onClose();
    } catch (error) {
      let errorMessage = 'An error occurred while saving the record.';
      if (error.message) errorMessage = error.message;
      else if (typeof error === 'string') errorMessage = error;
      else if (error.response && error.response.data && error.response.data.error) errorMessage = error.response.data.error;
      setSubmitError(errorMessage);
      const modalContent = document.querySelector('.modal-content');
      if (modalContent) modalContent.scrollTop = 0;
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSubmitError('');
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="modal-content" style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', width: '90%', maxWidth: '450px', maxHeight: '85vh', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e8f5e8', paddingBottom: '0.75rem' }}>
          <h2 style={{ color: '#2c5530', margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>
            Edit Seedling Record
          </h2>
          <button onClick={handleClose} disabled={loading} style={{ background: 'none', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1.25rem', color: '#6c757d', padding: '0.25rem', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseOver={(e) => !loading && (e.target.style.color = '#dc3545')} onMouseOut={(e) => !loading && (e.target.style.color = '#6c757d')}>
            <IoClose />
          </button>
        </div>

        {submitError && (
          <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #f5c6cb', fontSize: '0.75rem' }}>
            <strong>Error:</strong> {submitError}
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', color: '#2c5530', fontSize: '0.75rem', fontWeight: '500' }}>
                  Beneficiary *
                </label>
                <select 
                  name="beneficiaryName" 
                  value={formData.beneficiaryName} 
                  onChange={handleInputChange} 
                  style={{ width: '100%', padding: '0.5rem', border: errors.beneficiaryName ? '1px solid #dc3545' : '1px solid #ced4da', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: 'white', color: '#495057', height: '36px' }} 
                  disabled={loading || beneficiariesLoading}
                >
                  <option value="">{beneficiariesLoading ? 'Loading...' : 'Select Beneficiary'}</option>
                  {beneficiaries && beneficiaries.length > 0 ? (
                    beneficiaries.map(beneficiary => (
                      <option key={beneficiary.beneficiaryId} value={getFullName(beneficiary)}>
                        {getFullName(beneficiary)}
                      </option>
                    ))
                  ) : !beneficiariesLoading ? (
                    <option value="" disabled>No beneficiaries found</option>
                  ) : null}
                </select>
                {errors.beneficiaryName && (
                  <p style={{ color: '#dc3545', fontSize: '0.625rem', marginTop: '0.125rem' }}>{errors.beneficiaryName}</p>
                )}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', color: '#2c5530', fontSize: '0.75rem', fontWeight: '500' }}>
                  Beneficiary ID
                </label>
                <input 
                  type="text" 
                  value={formData.beneficiaryId} 
                  readOnly 
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: '#f8f9fa', color: '#6c757d', cursor: 'not-allowed', height: '36px' }} 
                  placeholder="Auto-populated" 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', color: '#2c5530', fontSize: '0.75rem', fontWeight: '500' }}>
                  Received Seedlings *
                </label>
                <input 
                  type="number" 
                  name="received" 
                  value={formData.received} 
                  onChange={handleInputChange} 
                  min="1" 
                  style={{ width: '100%', padding: '0.5rem', border: errors.received ? '1px solid #dc3545' : '1px solid #ced4da', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: 'white', color: '#495057', height: '36px' }} 
                  disabled={loading} 
                  placeholder="Enter number" 
                />
                {errors.received && (
                  <p style={{ color: '#dc3545', fontSize: '0.625rem', marginTop: '0.125rem' }}>{errors.received}</p>
                )}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', color: '#2c5530', fontSize: '0.75rem', fontWeight: '500' }}>
                  Date Received *
                </label>
                <input 
                  type="date" 
                  name="dateReceived" 
                  value={formData.dateReceived} 
                  onChange={handleInputChange} 
                  style={{ width: '100%', padding: '0.5rem', border: errors.dateReceived ? '1px solid #dc3545' : '1px solid #ced4da', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: 'white', color: '#495057', height: '36px' }} 
                  disabled={loading} 
                  placeholder="Select date" 
                />
                {errors.dateReceived && (
                  <p style={{ color: '#dc3545', fontSize: '0.625rem', marginTop: '0.125rem' }}>{errors.dateReceived}</p>
                )}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', color: '#2c5530', fontSize: '0.75rem', fontWeight: '500' }}>
                Planted Seedlings *
              </label>
              <input 
                type="number" 
                name="planted" 
                value={formData.planted} 
                onChange={handleInputChange} 
                min="1" 
                max={formData.received} 
                style={{ width: '100%', padding: '0.5rem', border: errors.planted ? '1px solid #dc3545' : '1px solid #ced4da', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: 'white', color: '#495057', height: '36px' }} 
                disabled={loading} 
                placeholder="Enter number" 
              />
              {errors.planted && (
                <p style={{ color: '#dc3545', fontSize: '0.625rem', marginTop: '0.125rem' }}>{errors.planted}</p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', color: '#2c5530', fontSize: '0.75rem', fontWeight: '500' }}>
                Hectares *
              </label>
              <input 
                type="number" 
                name="hectares" 
                value={formData.hectares} 
                onChange={handleInputChange} 
                min="0.1" 
                step="0.1" 
                style={{ width: '100%', padding: '0.5rem', border: errors.hectares ? '1px solid #dc3545' : '1px solid #ced4da', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: 'white', color: '#495057', height: '36px' }} 
                disabled={loading} 
                placeholder="Enter hectares" 
              />
              {errors.hectares && (
                <p style={{ color: '#dc3545', fontSize: '0.625rem', marginTop: '0.125rem' }}>{errors.hectares}</p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', color: '#2c5530', fontSize: '0.75rem', fontWeight: '500' }}>
                Plot *
              </label>
              <input 
                type="text" 
                name="plot" 
                value={formData.plot} 
                onChange={handleInputChange} 
                style={{ width: '100%', padding: '0.5rem', border: errors.plot ? '1px solid #dc3545' : '1px solid #ced4da', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: 'white', color: '#495057', height: '36px' }} 
                disabled={loading} 
                placeholder="Enter plot number" 
              />
              {errors.plot && (
                <p style={{ color: '#dc3545', fontSize: '0.625rem', marginTop: '0.125rem' }}>{errors.plot}</p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.375rem', color: '#2c5530', fontSize: '0.75rem', fontWeight: '500' }}>
                Date of Planting *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <input 
                    type="date" 
                    name="dateOfPlantingStart" 
                    value={formData.dateOfPlantingStart} 
                    onChange={handleInputChange} 
                    style={{ width: '100%', padding: '0.5rem', border: errors.dateOfPlantingStart ? '1px solid #dc3545' : '1px solid #ced4da', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: 'white', color: '#495057', height: '36px' }} 
                    disabled={loading} 
                    placeholder="Start date" 
                  />
                  {errors.dateOfPlantingStart && (
                    <p style={{ color: '#dc3545', fontSize: '0.625rem', marginTop: '0.125rem' }}>{errors.dateOfPlantingStart}</p>
                  )}
                </div>
                <div>
                  <input 
                    type="date" 
                    name="dateOfPlantingEnd" 
                    value={formData.dateOfPlantingEnd} 
                    onChange={handleInputChange} 
                    style={{ width: '100%', padding: '0.5rem', border: errors.dateOfPlantingEnd ? '1px solid #dc3545' : '1px solid #ced4da', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: 'white', color: '#495057', height: '36px' }} 
                    disabled={loading} 
                    placeholder="End date (optional)" 
                  />
                  {errors.dateOfPlantingEnd && (
                    <p style={{ color: '#dc3545', fontSize: '0.625rem', marginTop: '0.125rem' }}>{errors.dateOfPlantingEnd}</p>
                  )}
                </div>
              </div>
              <p style={{ color: '#6c757d', fontSize: '0.625rem', marginTop: '0.125rem' }}>
                If planting spanned multiple days, provide an end date.
              </p>
            </div>
          </form>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e8f5e8' }}>
          <Button type="secondary" size="medium" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          {loading ? (
            <Button type="primary" size="medium" disabled={loading}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                Updating...
              </div>
            </Button>
          ) : (
            <Button type="primary" size="medium" onClick={handleSubmit} disabled={loading}>
              Update Record
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditSeedlingRecordModal;


