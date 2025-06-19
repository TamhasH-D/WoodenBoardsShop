import React, { memo } from 'react';

const ChatSettings = memo(({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease-out'
  };

  const modalStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    animation: 'slideIn 0.3s ease-out'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e5e7eb'
  };

  const titleStyle = {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: '#374151'
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.2s ease'
  };

  const sectionStyle = {
    marginBottom: '24px'
  };

  const sectionTitleStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '12px'
  };

  const settingItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6'
  };

  const settingLabelStyle = {
    fontSize: '14px',
    color: '#374151',
    flex: 1
  };

  const settingDescStyle = {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px'
  };

  const toggleStyle = (enabled) => ({
    position: 'relative',
    width: '44px',
    height: '24px',
    backgroundColor: enabled ? '#10b981' : '#d1d5db',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    outline: 'none'
  });

  const toggleKnobStyle = (enabled) => ({
    position: 'absolute',
    top: '2px',
    left: enabled ? '22px' : '2px',
    width: '20px',
    height: '20px',
    backgroundColor: 'white',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
  });

  const sliderStyle = {
    width: '100%',
    height: '4px',
    borderRadius: '2px',
    background: '#e5e7eb',
    outline: 'none',
    cursor: 'pointer'
  };

  const buttonStyle = {
    padding: '8px 16px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#d1d5db',
    cursor: 'not-allowed'
  };

  return (
    <>
      <div style={overlayStyle} onClick={onClose}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <div style={headerStyle}>
            <h2 style={titleStyle}>Настройки чата</h2>
            <button
              style={closeButtonStyle}
              onClick={onClose}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ×
            </button>
          </div>

          {/* Appearance Section */}
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>🎨 Внешний вид</h3>
            
            <div style={settingItemStyle}>
              <div>
                <div style={settingLabelStyle}>Автоскролл</div>
                <div style={settingDescStyle}>
                  Автоматически прокручивать к новым сообщениям
                </div>
              </div>
              <button style={toggleStyle(true)}>
                <div style={toggleKnobStyle(true)} />
              </button>
            </div>

            <div style={settingItemStyle}>
              <div>
                <div style={settingLabelStyle}>Показывать время</div>
                <div style={settingDescStyle}>
                  Отображать время отправки сообщений
                </div>
              </div>
              <button style={toggleStyle(true)}>
                <div style={toggleKnobStyle(true)} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: translateY(-20px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
      `}</style>
    </>
  );
});

ChatSettings.displayName = 'ChatSettings';

export default ChatSettings;
