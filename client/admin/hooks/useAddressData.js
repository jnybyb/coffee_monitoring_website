import { useState, useEffect, useCallback } from 'react';
import { addressesAPI } from '../services/api';

export const useAddressData = () => {
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
  }, []);

  const loadProvinces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await addressesAPI.getProvinces();
      setProvinces(data);
    } catch (err) {
      setError('Failed to load provinces');
      console.error('Error loading provinces:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMunicipalities = useCallback(async (province) => {
    if (!province) {
      setMunicipalities([]);
      setBarangays([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await addressesAPI.getMunicipalities(province);
      setMunicipalities(data);
      setBarangays([]); // Reset barangays when province changes
    } catch (err) {
      setError('Failed to load municipalities');
      console.error('Error loading municipalities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBarangays = useCallback(async (province, municipality) => {
    if (!province || !municipality) {
      setBarangays([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await addressesAPI.getBarangays(province, municipality);
      setBarangays(data);
    } catch (err) {
      setError('Failed to load barangays');
      console.error('Error loading barangays:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetMunicipalities = useCallback(() => {
    setMunicipalities([]);
    setBarangays([]);
  }, []);

  const resetBarangays = useCallback(() => {
    setBarangays([]);
  }, []);

  return {
    provinces,
    municipalities,
    barangays,
    loading,
    error,
    loadProvinces,
    loadMunicipalities,
    loadBarangays,
    resetMunicipalities,
    resetBarangays
  };
};
