import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';

// If user is not authenticated, redirects to login page
const ProtectedRoute = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const validateAuth = async () => {
      // Attempt to retrieve authentication token from localStorage
      let token = null;
      try {
        token = localStorage.getItem('auth_token');
      } catch (_) {}

      // If no token found, mark as not authenticated
      if (!token) {
        setIsAuthenticated(false);
        setIsValidating(false);
        return;
      }

      // Validate token with server
      try {
        await authAPI.me();
        // Token is valid
        setIsAuthenticated(true);
      } catch (error) {
        // Token is invalid or server is unreachable/restarted
        console.log('Auth validation failed:', error.message);
        try {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        } catch (_) {}
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateAuth();
  }, []);

  // If not authenticated, redirect to login page
  if (!isAuthenticated && !isValidating) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Show nothing while validating (no loading screen)
  if (isValidating) {
    return null;
  }
  
  // If authenticated, render the protected content
  return children;
};

export default ProtectedRoute;