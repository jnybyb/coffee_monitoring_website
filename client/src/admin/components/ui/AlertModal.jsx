import React from 'react';

const AlertModal = ({ 
  isOpen, 
  onClose, 
  type = 'success', 
  title, 
  message, 
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
  onConfirm,
  onCancel,
  autoClose = false,
  autoCloseDelay = 3000,
  maxWidth = 320
}) => {
  React.useEffect(() => {
    if (isOpen && autoClose && !showCancel) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose, showCancel]);

  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getAlertConfig = () => {
    const configs = {
      success: {
        icon: '✓',
        headerColor: 'var(--emerald-green)',
        iconColor: 'var(--emerald-green)',
        textColor: 'var(--black)',
        buttonColor: 'var(--emerald-green)',
        buttonTextColor: 'var(--emerald-green)'
      },
      error: {
        icon: '✕',
        headerColor: 'var(--red)',
        iconColor: 'var(--red)',
        textColor: 'var(--black)',
        buttonColor: 'var(--red)',
        buttonTextColor: 'var(--red)'
      },
      warning: {
        icon: '!',
        headerColor: 'var(--olive-green)',
        iconColor: 'var(--olive-green)',
        textColor: 'var(--black)',
        buttonColor: 'var(--olive-green)',
        buttonTextColor: 'var(--olive-green)'
      },
      info: {
        icon: '?',
        headerColor: 'var(--pine-green)',
        iconColor: 'var(--pine-green)',
        textColor: 'var(--black)',
        buttonColor: 'var(--pine-green)',
        buttonTextColor: 'var(--pine-green)'
      }
    };
    return configs[type] || configs.success;
  };

  const config = getAlertConfig();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
        padding: '7px'
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '6px',
          maxWidth: `${maxWidth}px`,
          width: '100%',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
          animation: 'modalSlideIn 0.2s ease-out',
          position: 'relative'
        }}
      >
        <div style={{
          backgroundColor: config.headerColor,
          height: '60px',
          position: 'relative',
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 1px, transparent 1px), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 1px, transparent 1px), radial-gradient(circle at 40% 80%, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px, 15px 15px, 25px 25px'
        }} />

        <div style={{
          position: 'absolute',
          top: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'white',
          border: `3px solid ${config.iconColor}`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2,
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: config.iconColor,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            {config.icon}
          </div>
        </div>

        <div style={{
          padding: '50px 30px 30px 30px',
          textAlign: 'center'
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            color: config.textColor,
            fontSize: '20px',
            fontWeight: 'bold',
            fontFamily: 'var(--font-main), Arial, sans-serif'
          }}>
            {title}
          </h3>

          {message ? (
            <div style={{
              marginBottom: '30px',
              color: config.textColor,
              fontSize: '14px',
              lineHeight: '1.5',
              textAlign: 'center',
              fontFamily: 'var(--font-main), Arial, sans-serif'
            }}>
              {message}
            </div>
          ) : null}

          {showCancel && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '15px'
            }}>
              <button
                onClick={onCancel || onClose}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  border: `2px solid ${config.buttonColor}`,
                  backgroundColor: 'white',
                  color: config.buttonTextColor,
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  fontFamily: 'var(--font-main), Arial, sans-serif'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = config.buttonColor;
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = config.buttonTextColor;
                }}
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm || onClose}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  border: `2px solid ${config.buttonColor}`,
                  backgroundColor: 'white',
                  color: config.buttonTextColor,
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  fontFamily: 'var(--font-main), Arial, sans-serif'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = config.buttonColor;
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = config.buttonTextColor;
                }}
              >
                {confirmText}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: translateY(-20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};

export default AlertModal; 