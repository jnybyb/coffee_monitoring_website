import React from 'react';

const Reports = () => {
  return (
    <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
        <div>
          <h2 style={{ color: '#2c5530', marginBottom: '0.2rem', fontSize: '1.4rem' }}>Reports</h2>
          <p style={{ color: '#6c757d', margin: '0', fontSize: '0.60rem' }}>
            Generate and view comprehensive reports for your coffee monitoring system
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
