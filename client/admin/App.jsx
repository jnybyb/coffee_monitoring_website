import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Import separate page components
import Admin from './Admin';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />

        {/* All routes go through Admin to maintain sidebar and header */}
        <Route path="/dashboard" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/farm-monitoring" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/beneficiaries" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Admin /></ProtectedRoute>} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
