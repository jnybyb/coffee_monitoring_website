import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

/**
 * Hook to monitor user session and automatically logout on server restart
 * or token invalidation
 */
const useSessionMonitor = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let intervalId;
    let isActive = true;

    const checkSession = async () => {
      if (!isActive) return;

      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          // No token, redirect to login
          navigate('/login', { replace: true });
          return;
        }

        // Validate token with server
        await authAPI.me();
      } catch (error) {
        // Token is invalid or server is unreachable/restarted
        console.log('Session validation failed:', error.message);
        try {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        } catch (_) {}
        
        if (isActive) {
          navigate('/login', { replace: true });
        }
      }
    };

    // Check session every 5 minutes
    intervalId = setInterval(checkSession, 5 * 60 * 1000);

    // Cleanup on unmount
    return () => {
      isActive = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [navigate]);
};

export default useSessionMonitor;
