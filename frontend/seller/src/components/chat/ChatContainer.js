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
  // const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Removed isMobile state
  const [showSettings, setShowSettings] = useState(false);

  // Handle window resize for responsive design - REMOVED
  // React.useEffect(() => {
  //   const handleResize = () => {
  //     setIsMobile(window.innerWidth < 768);
  //   };
  //
  //   window.addEventListener('resize', handleResize);
  //   return () => window.removeEventListener('resize', handleResize);
  // }, []);

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleOpenSettings = useCallback(() => {
    setShowSettings(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
  }, []);

  // const containerStyle = { // Removed
  //   height: '100vh',
  //   maxHeight: '800px',
  //   display: 'flex',
  //   backgroundColor: '#ffffff',
  //   borderRadius: '16px',
  //   overflow: 'hidden',
  //   boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
  //   border: '1px solid #e5e7eb'
  // };

  // const sidebarContainerStyle = { // Removed
  //   // width: isMobile ? (selectedThread ? '0' : '100%') : '400px', // Will be replaced by Tailwind
  //   // minWidth: isMobile ? '0' : '350px', // Will be replaced by Tailwind
  //   height: '100%',
  //   transition: 'all 0.3s ease', // May keep for animation
  //   overflow: 'hidden'
  // };

  // const windowContainerStyle = { // Removed
  //   flex: 1,
  //   height: '100%',
  //   // display: isMobile && !selectedThread ? 'none' : 'flex' // Will be replaced by Tailwind
  // };

  // const mobileBackButtonStyle = { // Removed
  //   position: 'absolute',
  //   top: '20px',
  //   left: '20px',
  //   zIndex: 10,
  //   padding: '8px 12px',
  //   backgroundColor: 'rgba(255, 255, 255, 0.9)',
  //   border: '1px solid #e5e7eb',
  //   borderRadius: '20px',
  //   fontSize: '14px',
  //   cursor: 'pointer',
  //   display: 'flex',
  //   alignItems: 'center',
  //   gap: '6px',
  //   backdropFilter: 'blur(10px)'
  // };

  // const errorBannerStyle = { // Removed
  //   position: 'absolute',
  //   top: 0,
  //   left: 0,
  //   right: 0,
  //   backgroundColor: '#fef2f2',
  //   border: '1px solid #fecaca',
  //   color: '#dc2626',
  //   padding: '12px 20px',
  //   fontSize: '14px',
  //   zIndex: 20,
  //   display: 'flex',
  //   justifyContent: 'space-between',
  //   alignItems: 'center'
  // };

  // const connectionIndicatorStyle = { // Removed
  //   position: 'absolute',
  //   bottom: '20px',
  //   right: '20px',
  //   zIndex: 10,
  //   padding: '8px 12px',
  //   backgroundColor: isConnected ? '#dcfce7' : '#fef2f2',
  //   color: isConnected ? '#166534' : '#dc2626',
  //   borderRadius: '20px',
  //   fontSize: '12px',
  //   display: 'flex',
  //   alignItems: 'center',
  //   gap: '6px',
  //   boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  //   border: `1px solid ${isConnected ? '#bbf7d0' : '#fecaca'}`
  // };

  return (
    <div className="relative">
      {error && (
        <div className="absolute top-0 left-0 right-0 z-20 bg-red-50 border border-red-300 text-red-600 px-5 py-3 text-sm flex justify-between items-center">
          <span>⚠️ {error}</span>
          <button
            onClick={onRefresh}
            className="px-2 py-1 bg-red-600 text-white border-none rounded text-xs cursor-pointer"
          >
            Повторить
          </button>
        </div>
      )}

      <div className="h-[80vh] flex bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
        <div className={`h-full transition-all duration-300 ease-in-out overflow-hidden w-full md:w-[400px] md:min-w-[350px] ${selectedThread ? 'hidden md:block' : 'block'}`}>
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

        <div className={`flex-1 h-full md:flex ${!selectedThread ? 'hidden md:flex' : 'flex'}`}>
          {/* {isMobile && selectedThread && ( // Re-evaluate this condition with Tailwind */}
          {selectedThread && ( // Simplified for now, assuming button is only for mobile view, Tailwind will hide/show parent
            <button
              className="md:hidden absolute top-5 left-5 z-10 px-3 py-2 bg-white/90 border border-slate-200 rounded-full text-sm cursor-pointer flex items-center gap-1.5 backdrop-blur-md"
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
        <div className={`absolute bottom-5 right-5 z-10 px-3 py-2 rounded-full text-xs flex items-center gap-1.5 shadow-lg border ${isConnected ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
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
