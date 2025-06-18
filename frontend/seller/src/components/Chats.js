import React, { useEffect } from 'react';
import { ChatContainer } from './chat';
import { useChat } from '../hooks/useChat';
import { SELLER_TEXTS } from '../utils/localization';

function Chats() {
  const {
    threads,
    selectedThread,
    messages,
    loading,
    messagesLoading,
    error,
    isConnected,
    isTyping,
    sellerId,
    selectThread,
    sendMessage,
    sendTypingIndicator,
    refreshThreads,
    clearError
  } = useChat();

  // Refresh threads on component mount.
  // Initial refresh on mount
  useEffect(() => {
    refreshThreads();
  }, [refreshThreads]);

  // Polling useEffect has been removed.

  useEffect(() => {
    console.log("Chat connection status:", isConnected);
  }, [isConnected]);

  useEffect(() => {
    if (isConnected) {
      refreshThreads();
    }
  }, [isConnected, refreshThreads]);

  const handleThreadSelect = (thread) => {
    selectThread(thread);
  };

  const handleSendMessage = async (messageText) => {
    const success = await sendMessage(messageText);
    if (!success) {
      // Handle error - could show toast notification or rely on error state from useChat
      // The error state is set within useChat's sendMessage if it fails.
      console.error('Failed to send message (error should be set in useChat state)');
    }
    // No explicit refreshThreads() here; rely on optimistic update and WebSocket.
  };

  const handleTyping = (isTyping) => {
    sendTypingIndicator(isTyping);
  };

  const handleRefresh = () => {
    clearError();
    refreshThreads();
  };

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '24px',
        marginBottom: '30px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <div>
            <h1 style={{ margin: 0, color: '#374151', fontSize: '32px', fontWeight: '700' }}>
              💬 {SELLER_TEXTS.CHATS || 'Чаты с покупателями'}
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '16px' }}>
              Профессиональное общение с покупателями о ваших товарах
            </p>
          </div>
        </div>

        <ChatContainer
          threads={threads}
          selectedThread={selectedThread}
          messages={messages}
          onThreadSelect={handleThreadSelect}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          onRefresh={handleRefresh}
          loading={loading}
          messagesLoading={messagesLoading}
          isConnected={isConnected}
          isTyping={isTyping}
          sellerId={sellerId}
          error={error}
        />
      </div>
    </div>
  );
}

export default Chats;
