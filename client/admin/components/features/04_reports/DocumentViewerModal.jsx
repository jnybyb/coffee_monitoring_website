import React from 'react';

// Ensures PDF.js opens with page-fit zoom so content fits the wrapper
const getViewerSrc = (url) => {
  if (!url) return url;
  return url.includes('#') ? `${url}&zoom=page-fit` : `${url}#zoom=page-fit`;
};

const DocumentViewerModal = ({
  isOpen,
  onClose,
  previewUrl,
  paperSize,
  orientation,
  pageMargin,
  onChangePaperSize,
  onChangeOrientation,
  onChangePageMargin,
  iframeRef,
  onPrint
}) => {
  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const modalContainerStyle = {
    background: '#fff',
    borderRadius: '4px',
    width: '65vw',
    height: '98vh',
    maxWidth: '1400px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    overflow: 'hidden'
  };

  const bodyStyle = {
    flex: 1,
    display: 'flex',
    position: 'relative',
    minHeight: 0
  };

  const previewStyle = {
    flex: 1,
    background: '#dcdcdc',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    overflow: 'hidden'
  };

  const iframeWrapper = {
    background: '#fff',
    boxShadow: '0 0 6px rgba(0,0,0,0.15)',
    flexShrink: 0,
    width: '100%',
    maxWidth: orientation === 'portrait' ? '794px' : '1123px', // A4 approx px sizes
    // Keep page proportions but limit height to reduce double scrollbars
    aspectRatio: orientation === 'portrait' ? '794 / 1123' : '1123 / 794',
    maxHeight: 'calc(100vh - 14px)'
  };

  const sidebarStyle = {
    width: '285px',
    borderRight: '1px solid #e5e7eb',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    overflowY: 'auto',
    background: '#fafafa'
  };

  const labelStyle = {
    fontSize: '0.75rem',
    color: '#6c757d',
    marginBottom: '0.25rem',
    fontWeight: 500
  };

  const selectStyle = {
    width: '100%',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    padding: '0.35rem',
    fontSize: '0.8rem'
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: '0.5rem',
    marginTop: 'auto'
  };

  const primaryBtn = {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '0.4rem 0.75rem',
    fontSize: '0.8rem',
    cursor: 'pointer'
  };

  const secondaryBtn = {
    background: 'transparent',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    padding: '0.4rem 0.75rem',
    fontSize: '0.8rem',
    cursor: 'pointer'
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalContainerStyle} onClick={(e) => e.stopPropagation()}>

        {/* Body */}
        <div style={bodyStyle}>
          {/* Sidebar settings (left) */}
          <div style={sidebarStyle}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>
              Settings
            </div>

            <div>
              <label style={labelStyle}>Paper</label>
              <select
                value={paperSize}
                onChange={(e) => onChangePaperSize(e.target.value)}
                style={selectStyle}
              >
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
                <option value="Legal">Legal</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Orientation</label>
              <select
                value={orientation}
                onChange={(e) => onChangeOrientation(e.target.value)}
                style={selectStyle}
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Margin (mm)</label>
              <input
                type="number"
                min="5"
                max="50"
                value={pageMargin}
                onChange={(e) =>
                  onChangePageMargin(parseInt(e.target.value || '15', 10))
                }
                style={selectStyle}
              />
            </div>

            {/* Action buttons */}
            <div style={buttonGroupStyle}>
              <button type="button" onClick={onPrint} style={primaryBtn}>
                Print
              </button>
              <button type="button" onClick={onClose} style={secondaryBtn}>
                Close
              </button>
            </div>
          </div>

          {/* Preview area (right) */}
          <div style={previewStyle}>
            {previewUrl && (
              <div style={iframeWrapper}>
                <iframe
                  ref={iframeRef}
                  title="Report Preview"
                  src={getViewerSrc(previewUrl)}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;
