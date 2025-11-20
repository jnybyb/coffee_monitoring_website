import React from 'react';
import { useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import CoffeeBeneficiaries from './components/features/03_beneficiaries/Coffee_Beneficiaries';
import Farm_Monitoring from './components/features/02_farm-monitoring/Farm_Monitoring';
import Reports from './components/features/04_reports/Reports';
import Dashboard from './components/features/01_dashboard/Dashboard';
import { getActiveFromPath } from './utils/navigation';

const Admin = () => {
  const location = useLocation();
  const active = getActiveFromPath(location.pathname);

  // Render content based on active page
  let content;
  
  switch (active) {
    case 'Farm Monitoring':
      content = <Farm_Monitoring />;
      break;
    
    case 'Coffee Beneficiaries':
      content = <CoffeeBeneficiaries />;
      break;
    
    case 'Reports':
      content = <Reports />;
      break;
    
    default:
      content = <Dashboard active={active} />;
  }

  return (
    <Layout>
      <div className="admin-content" style={{ display: 'flex', flex: 1, minHeight: 0, height: '100%', flexDirection: 'column' }}>
        {content}
      </div>
    </Layout>
  );
};

export default Admin;
