import { useState, useEffect } from 'react';

export const useStatistics = (active) => {
  const [stats, setStats] = useState({
    totalBeneficiaries: 0,
    totalSeedsDistributed: 0,
    totalAlive: 0,
    totalDead: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeStats = () => {
      try {
        // Mock statistics data - in a real app, this would come from an API
        const mockStats = {
          totalBeneficiaries: 124,
          totalSeedsDistributed: 2480,
          totalAlive: 2156,
          totalDead: 324
        };
        setStats(mockStats);
      } catch (error) {
        console.error('Error initializing statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (active === 'Dashboard') {
      initializeStats();
    }
  }, [active]);

  return { stats, loading };
};