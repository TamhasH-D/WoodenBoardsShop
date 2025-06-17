import React, { useState, useCallback, memo } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import ChatSettings from './ChatSettings';
import { ConnectionStatus } from './StatusIndicators';

const ChatContainer = memo(({ 
  threads, 
  selectedThread, 
  messages,
  onThreadSelect, 
  onSendMessage,
  onTyping,
  onRefresh,
  loading,
  messagesLoading,
  isConnected,
  isTyping,
  sellerId,
  error 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSettings, setShowSettings] = useState(false);

  // Handle window resize for responsive design
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleOpenSettings = useCallback(() => {
    setShowSettings(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
  }, []);

  const containerStyle = {
    height: '100vh',
    maxHeight: '800px',
    display: 'flex',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  };

  const sidebarContainerStyle = {
    width: isMobile ? (selectedThread ? '0' : '100%') : '400px',
    minWidth: isMobile ? '0' : '350px',
    height: '100%',
    transition: 'all 0.3s ease',
    overflow: 'hidden'
  };

  const windowContainerStyle = {
    flex: 1,
    height: '100%',
    display: isMobile && !selectedThread ? 'none' : 'flex'
  };

  const mobileBackButtonStyle = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    zIndex: 10,
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid #e5e7eb',
    borderRadius: '20px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backdropFilter: 'blur(10px)'
  };

  const errorBannerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '12px 20px',
    fontSize: '14px',
    zIndex: 20,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const connectionIndicatorStyle = {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    zIndex: 10,
    padding: '8px 12px',
    backgroundColor: isConnected ? '#dcfce7' : '#fef2f2',
    color: isConnected ? '#166534' : '#dc2626',
    borderRadius: '20px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${isConnected ? '#bbf7d0' : '#fecaca'}`
  };

  return (
    <div style={{ position: 'relative' }}>
      {error && (
        <div style={errorBannerStyle}>
          <span>⚠️ {error}</span>
          <button
            onClick={onRefresh}
            style={{
              padding: '4px 8px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Повторить
          </button>
        </div>
      )}

      <div style={containerStyle}>
        <div style={sidebarContainerStyle}>
          <ChatSidebar
            threads={threads}
            selectedThread={selectedThread}
            onThreadSelect={onThreadSelect}
            loading={loading}
            onRefresh={onRefresh}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onOpenSettings={handleOpenSettings}
          />
        </div>

        <div style={windowContainerStyle}>
          {isMobile && selectedThread && (
            <button
              style={mobileBackButtonStyle}
              onClick={() => onThreadSelect(null)}
            >
              ← Назад
            </button>
          )}
          
          <ChatWindow
            thread={selectedThread}
            messages={messages}
            onSendMessage={onSendMessage}
            onTyping={onTyping}
            loading={messagesLoading}
            isConnected={isConnected}
            isTyping={isTyping}
            sellerId={sellerId}
          />
        </div>
      </div>

      {selectedThread && (
        <div style={connectionIndicatorStyle}>
          <ConnectionStatus isConnected={isConnected} />
        </div>
      )}

      <ChatSettings
        isOpen={showSettings}
        onClose={handleCloseSettings}
      />
    </div>
  );
});

ChatContainer.displayName = 'ChatContainer';

export default ChatContainer;
