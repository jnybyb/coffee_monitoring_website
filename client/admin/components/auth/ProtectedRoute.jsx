import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// If user is not authenticated, redirects to login page
const ProtectedRoute = ({ children }) => {
  // Attempt to retrieve authentication token from localStorage
  let token = null;
  try {
    token = localStorage.getItem('auth_token');
  } catch (_) {}

  // Get current location for redirecting after login
  const location = useLocation();
  
  // If no token found, redirect to login page
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If token exists, render the protected content
  return children;
};

export default ProtectedRoute;