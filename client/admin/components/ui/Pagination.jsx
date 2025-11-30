import React from 'react';

const Pagination = ({
  currentPage,
  totalRecords,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50]
}) => {
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const start = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(totalRecords, currentPage * pageSize);

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 12px',
      backgroundColor: 'white',
      border: 'none',
      borderTop: '0.5px solid rgba(36, 99, 59, 0.3)',
      borderRadius: 0,
      boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
      position: 'sticky',
      bottom: 0,
      width: 'auto',
      zIndex: 5
    },
    left: {
      color: '#6c757d',
      fontSize: '10px'
    },
    right: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    pager: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    btn: {
      minWidth: '22px',
      height: '22px',
      padding: '0 5px',
      borderRadius: '5px',
      border: '1px solid #bfc7c2',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontSize: '9px',
      color: '#2b2f33',
      fontWeight: 500
    },
    btnNav: {
      backgroundColor: '#f0f7f3',
      border: '1px solid rgba(45, 124, 74, 0.4)',
      color: '#2d7c4a',
      fontSize: '12px',
      fontWeight: 600
    },
    btnActive: {
      backgroundColor: 'var(--dark-green)',
      borderColor: 'var(--dark-green)',
      color: 'white'
    },
    btnDisabled: {
      opacity: 0.3,
      cursor: 'not-allowed'
    },
    ellipsis: {
      padding: '0 3px',
      color: '#868e96',
      fontSize: '9px'
    }
  };

  /**
   * PAGINATION LAYOUT ALGORITHM
   * 
   * Computes which page numbers and ellipsis to display based on current page and total pages.
   * 
   * RULES:
   * 1. Always show: First 2 pages (1, 2) and Last 2 pages (n-1, n)
   * 2. Show context: Page before and after the active page
   * 3. Use ellipsis (...): When pages are skipped between sections
   * 
   * DECISION LOGIC:
   * 
   * Case 1: Total Pages ≤ 7
   *   - Display all pages without ellipsis
   *   - Example (5 pages): < 1 2 3 4 5 >
   *   - Example (7 pages): < 1 2 3 4 5 6 7 >
   * 
   * Case 2: Active Page ≤ 3 (Near Start)
   *   - Display: 1 2 3 [4 if page=3] ... n-1 n
   *   - Page 1: < 1 2 3 ... 9 10 >
   *   - Page 2: < 1 2 3 ... 9 10 >
   *   - Page 3: < 1 2 3 4 ... 9 10 > (shows next page 4)
   * 
   * Case 3: Active Page ≥ n-2 (Near End)
   *   - Display: 1 2 ... [n-3 if page=n-2] n-2 n-1 n
   *   - Page 10 of 10: < 1 2 ... 8 9 10 >
   *   - Page 9 of 10: < 1 2 ... 8 9 10 >
   *   - Page 8 of 10: < 1 2 ... 7 8 9 10 > (shows prev page 7)
   * 
   * Case 4: Active Page in Middle (4 to n-3)
   *   - Display: 1 2 ... (x-1) x (x+1) ... n-1 n
   *   - Page 7 of 10: < 1 2 ... 6 7 8 ... 9 10 >
   *   - Page 5 of 10: < 1 2 ... 4 5 6 ... 9 10 >
   * 
   * WHEN TO SHOW ELLIPSIS:
   *   - Left ellipsis: When gap exists between page 2 and the middle section
   *   - Right ellipsis: When gap exists between the middle section and page (n-1)
   * 
   * This ensures users always see:
   *   - Where they are (current page + neighbors)
   *   - Where they can jump to (first 2 and last 2 pages)
   *   - That there are more pages in between (ellipsis)
   */
  const getPageNumbers = () => {
    const pages = [];
    
    // Case 1: If total pages <= 7, show all pages without ellipsis
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    
    // Always show first 2 pages
    pages.push(1, 2);
    
    // Case 2: Current page is 1, 2, or 3 (Near Start)
    if (currentPage <= 3) {
      // Show: 1 2 3 ... 8 9 (for pages 1 and 2)
      // Show: 1 2 3 4 ... 8 9 (for page 3)
      pages.push(3); // Always show page 3
      if (currentPage === 3) pages.push(4); // Show page 4 only when active page is 3
      pages.push('dots-right'); // Add right ellipsis
      pages.push(totalPages - 1, totalPages); // Add last 2 pages
    }
    // Case 3: Current page is in last 3 pages (Near End)
    else if (currentPage >= totalPages - 2) {
      // Show: 1 2 ... 6 7 8 9 (if current is 7, 8, or 9)
      pages.push('dots-left'); // Add left ellipsis
      if (currentPage === totalPages - 2) {
        pages.push(totalPages - 3, totalPages - 2); // Show 2 pages before last 2
      } else {
        pages.push(totalPages - 2); // Show 1 page before last 2
      }
      pages.push(totalPages - 1, totalPages); // Add last 2 pages
    }
    // Case 4: Current page is in the middle (show prev, current, next)
    else {
      // Show: 1 2 ... 6 7 8 ... 9 10 (for page 7 of 10)
      pages.push('dots-left'); // Add left ellipsis
      pages.push(currentPage - 1, currentPage, currentPage + 1); // Show current page and neighbors
      pages.push('dots-right'); // Add right ellipsis
      pages.push(totalPages - 1, totalPages); // Add last 2 pages
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        Items {start}-{end} of {totalRecords} entries
      </div>
      <div style={styles.right}>
        <div style={styles.pager}>
          <button
            style={{ ...styles.btn, ...styles.btnNav, ...(currentPage === 1 ? styles.btnDisabled : {}) }}
            onClick={() => onPageChange && onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            ‹
          </button>
          {pageNumbers.map((item, idx) => {
            if (typeof item === 'string') {
              return <span key={`dots-${idx}`} style={styles.ellipsis}>…</span>;
            }
            const isActive = item === currentPage;
            return (
              <button
                key={item}
                style={{ ...styles.btn, ...(isActive ? styles.btnActive : {}) }}
                onClick={() => onPageChange && onPageChange(item)}
                aria-current={isActive ? 'page' : undefined}
              >
                {item}
              </button>
            );
          })}
          <button
            style={{ ...styles.btn, ...styles.btnNav, ...(currentPage === totalPages ? styles.btnDisabled : {}) }}
            onClick={() => onPageChange && onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;


