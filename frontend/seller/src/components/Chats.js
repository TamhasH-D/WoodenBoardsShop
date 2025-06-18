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

  // Poll for new threads/messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Polling refreshThreads");
      refreshThreads();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshThreads]);

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
    if (success) {
      // Refresh threads to load the latest messages.
      refreshThreads();
    } else {
      // Handle error - could show toast notification
      console.error('Failed to send message');
    }
  };

  const handleTyping = (isTyping) => {
    sendTypingIndicator(isTyping);
  };

  const handleRefresh = () => {
    clearError();
    refreshThreads();
  };

  return (
    <div className="max-w-7xl mx-auto p-5 bg-slate-50 min-h-screen">
      <div className="bg-white p-7 md:p-8 rounded-2xl mb-8 shadow-xl border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4 sm:gap-0">
          <div>
            <h1 className="m-0 text-slate-700 text-2xl sm:text-3xl font-bold">
              💬 {SELLER_TEXTS.CHATS || 'Чаты с покупателями'}
            </h1>
            <p className="mt-2 text-slate-500 text-base sm:text-lg">
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
