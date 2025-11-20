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
      color: '#2d7c4a'
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

  const getPageNumbers = () => {
    const pages = [];
    const siblingCount = 1;
    const totalNumbers = siblingCount * 2 + 3; // first, current, last
    const totalBlocks = totalNumbers + 2; // add two ellipsis

    if (totalPages <= totalBlocks) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
      return pages;
    }

    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);

    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < totalPages - 1;

    if (!showLeftDots && showRightDots) {
      const leftRange = [1, 2, 3, 4, 5];
      return [...leftRange, 'dots-right', totalPages];
    }

    if (showLeftDots && !showRightDots) {
      const rightRange = [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      return [1, 'dots-left', ...rightRange];
    }

    return [1, 'dots-left', leftSibling, currentPage, rightSibling, 'dots-right', totalPages];
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


