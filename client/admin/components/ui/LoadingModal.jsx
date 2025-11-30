import React from 'react';

const InlineSpinner = ({ size = '35px', color = 'var(--dark-green)' }) => {
  const spinnerStyle = {
    width: size,
    height: size,
    border: '3px solid #f3f3f3',
    borderTop: `3px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  };
  const keyframesStyle = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  return (
    <>
      <style>{keyframesStyle}</style>
      <div style={spinnerStyle}></div>
    </>
  );
};

const LoadingModal = ({
  isOpen,
  title = 'Processing',
  message = 'Please wait...',
  subMessage,
  progress = null,
  dismissible = false,
  onClose,
  spinnerColor = 'var(--dark-green)'
}) => {
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && dismissible && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, dismissible, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && dismissible && onClose) {
      onClose();
    }
  };

  const progressValue = typeof progress === 'number' && progress >= 0 && progress <= 100 ? progress : null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2500,
        padding: '10px'
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '6px',
          width: '100%',
          maxWidth: '280px',
          padding: '40px 5px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <div style={{ marginBottom: '12px' }}>
          <InlineSpinner size="35px" color={spinnerColor} />
        </div>
        <h3
          style={{
            margin: '0 0 6px 0',
            color: 'var(--black)',
            fontSize: '16px',
            fontWeight: 700
          }}
        >
          {title}
        </h3>
        <div
          style={{
            color: '#495057',
            fontSize: '13px',
            marginBottom: subMessage ? '6px' : progressValue !== null ? '14px' : 0
          }}
        >
          {message}
        </div>
        {subMessage && (
          <div style={{ color: '#6c757d', fontSize: '12px', marginBottom: progressValue !== null ? '14px' : 0 }}>
            {subMessage}
          </div>
        )}
        {progressValue !== null && (
          <div style={{ width: '100%', marginTop: '2px' }}>
            <div
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#f1f3f5',
                borderRadius: '999px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${progressValue}%`,
                  height: '100%',
                  backgroundColor: spinnerColor
                }}
              />
            </div>
            <div style={{ marginTop: '6px', fontSize: '12px', color: '#6c757d' }}>{progressValue}%</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingModal;

// Convenience wrappers for common use cases
export const SavingModal = ({ isOpen, onClose }) => (
  <LoadingModal 
    isOpen={isOpen} 
    title="Saving..." 
    message="Saving your changes" 
    dismissible={false} 
    spinnerColor="var(--dark-green)"
    onClose={onClose}
  />
);

export const DeletingModal = ({ isOpen, onClose }) => (
  <LoadingModal 
    isOpen={isOpen} 
    title="Deleting..." 
    message="Removing item" 
    dismissible={false} 
    spinnerColor="var(--dark-green)"
    onClose={onClose}
  />
);

export const LoggingInModal = ({ isOpen, onClose }) => (
  <LoadingModal 
    isOpen={isOpen} 
    title="Signing in..." 
    message="Authenticating your credentials" 
    dismissible={false} 
    spinnerColor="var(--dark-green)"
    onClose={onClose}
  />
);

export const DeleteLoadingModal = ({ isOpen, onClose }) => (
  <LoadingModal 
    isOpen={isOpen} 
    title="Deleting..." 
    message="Removing item" 
    dismissible={false} 
    spinnerColor="#dc3545"
    onClose={onClose}
  />
);
