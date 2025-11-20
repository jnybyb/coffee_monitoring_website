// Function to get active page from URL
export const getActiveFromPath = (pathname) => {
  let result;
  switch (pathname) {
    case '/dashboard':
      result = 'Dashboard';
      break;
    case '/farm-monitoring':
      result = 'Farm Monitoring';
      break;
    case '/beneficiaries':
      result = 'Coffee Beneficiaries';
      break;
    case '/reports':
      result = 'Reports';
      break;
    default:
      result = 'Dashboard';
  }
  return result;
};

// Function to navigate to URL based on active page
export const navigateToPage = (page, navigate) => {
  switch (page) {
    case 'Dashboard':
      navigate('/dashboard');
      break;
    case 'Farm Monitoring':
      navigate('/farm-monitoring');
      break;
    case 'Coffee Beneficiaries':
      navigate('/beneficiaries');
      break;
    case 'Reports':
      navigate('/reports');
      break;
    default:
      navigate('/dashboard');
  }
};
