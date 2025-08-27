import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MdOutlineDashboard,
  MdDashboard,
} from 'react-icons/md';
import {
  RiMapPinLine,
  RiMapPinFill,
  RiFolderUserLine,
  RiFolderUserFill,
  RiSeedlingLine,
  RiSeedlingFill,
  RiBarChartLine,
  RiBarChartFill,
} from 'react-icons/ri';
import {
  PiCoffeeLight,
  PiCoffeeFill,
} from 'react-icons/pi';
import {
  BsClipboard2Data,
  BsClipboard2DataFill,
} from 'react-icons/bs';
import SidebarButtons from '../ui/SidebarButtons';
import { getActiveFromPath, navigateToPage } from '../../utils/navigation';

// Navigation items configuration with icons and subcategories
const navItems = [
  { 
    label: 'Dashboard', 
    inactiveIcon: <MdOutlineDashboard />,
    activeIcon: <MdDashboard />,
    path: '/dashboard'
  },
  { 
    label: 'Map Monitoring', 
    inactiveIcon: <RiMapPinLine />,
    activeIcon: <RiMapPinFill />,
    path: '/map-monitoring'
  },
  { 
    label: 'Coffee Beneficiaries', 
    inactiveIcon: <PiCoffeeLight />,
    activeIcon: <PiCoffeeFill />,
    hasSubcategories: true,
    subcategories: [
      { 
        label: 'Personal Details',
        inactiveIcon: <RiFolderUserLine />,
        activeIcon: <RiFolderUserFill />,
        path: '/beneficiaries/personal-details'
      },
      { 
        label: 'Seedling Records',
        inactiveIcon: <RiSeedlingLine />,
        activeIcon: <RiSeedlingFill />,
        path: '/beneficiaries/seedling-records'
      },
      { 
        label: 'Crop Status',
        inactiveIcon: <RiBarChartLine />,
        activeIcon: <RiBarChartFill />,
        path: '/beneficiaries/crop-status'
      }
    ]
  },
  { 
    label: 'Reports', 
    inactiveIcon: <BsClipboard2Data />,
    activeIcon: <BsClipboard2DataFill />,
    path: '/reports'
  },
];

// Sidebar component with expandable navigation
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get active page from current URL
  const active = getActiveFromPath(location.pathname);
  
  // Track which navigation items are expanded
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Toggle expanded state of navigation item
  const toggleExpanded = (itemLabel) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemLabel)) {
      newExpanded.delete(itemLabel);
    } else {
      newExpanded.add(itemLabel);
    }
    setExpandedItems(newExpanded);
  };

  const isItemExpanded = (itemLabel) => expandedItems.has(itemLabel);

  // Handle main navigation button clicks
  const handleMainButtonClick = (item) => {
    if (item.hasSubcategories) {
      // For items with subcategories, toggle expansion
      toggleExpanded(item.label);
    } else {
      // For items without subcategories, navigate directly and close all expansions
      navigateToPage(item.label, navigate);
      setExpandedItems(new Set());
    }
  };

  // Handle subcategory button clicks
  const handleSubButtonClick = (subItem, parentItem) => {
    navigateToPage(subItem.label, navigate);
    // Ensure the parent item is expanded when a subcategory is clicked
    if (!isItemExpanded(parentItem.label)) {
      setExpandedItems(new Set([...expandedItems, parentItem.label]));
    }
  };

  // Main sidebar container styles
  const sidebarStyles = {
    background: 'var(--dark-green)',
    color: 'var(--white)',
    boxSizing: 'border-box',
    padding: '2.5rem 0.5rem',
    fontFamily: 'var(--font-main)',
    fontWeight: 400,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    flex: 1,
    minHeight: 0,
  };

  // Navigation container styles
  const navStyles = {
    width: '100%',
    padding: '0 0.25rem',
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
    gap: '0.6rem',
  };

  const listItemStyles = {
    width: '100%'
  };

  return (
    <aside style={sidebarStyles}>
      <nav style={navStyles}>
        <ul style={navListStyles}>
          {navItems.map((item) => {
            const isExpanded = isItemExpanded(item.label);
            const hasActiveSubcategory = item.hasSubcategories && item.subcategories && 
              item.subcategories.some(subItem => active === subItem.label);
            
            // Determine if this main button should be active
            let isMainButtonActive = false;
            
            if (item.hasSubcategories) {
              // For items with subcategories (like Coffee Beneficiaries)
              // They are active if they are expanded OR if one of their subcategories is active
              isMainButtonActive = isExpanded || hasActiveSubcategory;
            } else {
              // For items without subcategories, they are active only if they match the current active page
              // AND no subcategories are currently expanded
              const anySubcategoriesExpanded = expandedItems.size > 0;
              isMainButtonActive = active === item.label && !anySubcategoriesExpanded;
            }

            return (
              <li key={item.label} style={listItemStyles}>
                <SidebarButtons
                  item={item}
                  isActive={isMainButtonActive}
                  isExpanded={isExpanded}
                  isParentActive={isMainButtonActive}
                  hasActiveSubcategory={hasActiveSubcategory}
                  active={active}
                  onMainButtonClick={handleMainButtonClick}
                  onSubButtonClick={handleSubButtonClick}
                  isItemExpanded={isItemExpanded}
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