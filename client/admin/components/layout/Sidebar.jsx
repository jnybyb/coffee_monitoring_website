import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MdOutlineDashboard,
  MdDashboard,
} from 'react-icons/md';
import { GrMapLocation } from "react-icons/gr";
import { FaMapMarkedAlt } from "react-icons/fa";
import { HiOutlineUsers } from "react-icons/hi2";
import { HiUsers } from "react-icons/hi2";
import {
  BsClipboard2Data,
  BsClipboard2DataFill,
} from 'react-icons/bs';
import SidebarButtons from '../ui/SidebarButtons';
import { getActiveFromPath, navigateToPage } from '../../utils/navigation';

// Navigation items configuration with icons
const navItems = [
  { 
    label: 'Dashboard', 
    inactiveIcon: <MdOutlineDashboard />,
    activeIcon: <MdDashboard />,
    path: '/dashboard'
  },
  { 
    label: 'Farm Monitoring', 
    inactiveIcon: <GrMapLocation />,
    activeIcon: <FaMapMarkedAlt />,
    path: '/farm-monitoring'
  },
  { 
    label: 'Coffee Beneficiaries', 
    inactiveIcon: <HiOutlineUsers />,
    activeIcon: <HiUsers />, 
    path: '/beneficiaries'
  },
  { 
    label: 'Reports', 
    inactiveIcon: <BsClipboard2Data />,
    activeIcon: <BsClipboard2DataFill />,
    path: '/reports'
  },
];

// Sidebar component with simplified structure
const Sidebar = ({ buttonHeight = '55px' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get active page from current URL
  const active = getActiveFromPath(location.pathname);

  // Handle navigation button clicks
  const handleNavigation = (item) => {
    navigateToPage(item.label, navigate);
  };

  // Main sidebar container styles
  const sidebarStyles = {
    background: 'var(--dark-green)',
    color: 'var(--white)',
    boxSizing: 'border-box',
    padding: '7px',
    fontFamily: 'var(--font-main)',
    fontWeight: 400,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    flex: 1,
    minHeight: 0,
    width: '220px',
  };

  // Navigation container styles
  const navStyles = {
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  };

  const navListStyles = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  };

  const listItemStyles = {
    width: '100%',
    display: 'flex',
  };

  return (
    <aside style={sidebarStyles}>
      <nav style={navStyles}>
        <ul style={navListStyles}>
          {navItems.map((item, index) => {
            const isParentActive = active === item.label;
            
            return (
              <li key={item.label} style={listItemStyles}>
                <SidebarButtons
                  item={item}
                  isParentActive={isParentActive}
                  onMainButtonClick={handleNavigation}
                  buttonHeight={buttonHeight}
                />
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;