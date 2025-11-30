import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * Reusable DataGrid component for displaying and editing tabular data
 * @param {string} title - Table section title
 * @param {Array} rowData - Array of data objects to display
 * @param {Array} columnDefs - AG Grid column definitions
 * @param {Function} onCellValueChanged - Callback when cell value changes
 * @param {Object} customStyles - Optional custom styles for the grid container
 */
const DataGrid = ({ 
  title, 
  rowData, 
  columnDefs, 
  onCellValueChanged,
  customStyles = {}
}) => {
  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    suppressMovable: false,
  };

  const gridContainerStyle = {
    height: 400,
    width: '100%',
    fontSize: '0.65rem',
    '--ag-row-height': '28px',
    '--ag-header-height': '32px',
    '--ag-font-size': '0.53rem',
    ...customStyles
  };

  return (
    <div style={styles.tableSection}>
      <div style={styles.tableSectionHeader}>
        <h4 style={styles.tableTitle}>{title}</h4>
      </div>
      <div className="ag-theme-alpine" style={gridContainerStyle}>
        <AgGridReact
          theme="legacy"
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onCellValueChanged={onCellValueChanged}
          singleClickEdit={false}
          stopEditingWhenCellsLoseFocus={true}
        />
      </div>
    </div>
  );
};

const styles = {
  tableSection: {
    marginBottom: '2rem',
  },
  tableSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid var(--dark-green)',
  },
  tableTitle: {
    margin: 0,
    fontSize: '0.85rem',
    color: 'var(--dark-green)',
    fontWeight: 700,
  },
};

export default DataGrid;
