import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../ui/Button';
import Card from '../ui/Card';
import apiService from '../../apiService';

const ChatInterface = ({ sellerId, buyerId, conversation, productId = null }) => {
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const messagesEndRef = useRef(null);

  // Mock authentication - replace with real auth
  const isAuthenticated = () => true;
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Get messages from conversation
  const messages = conversation?.messages || [];

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (messageData) => apiService.createChatMessage(messageData),
    onSuccess: () => {
      // Invalidate and refetch chat messages
      queryClient.invalidateQueries(['buyerSentMessages']);
      queryClient.invalidateQueries(['buyerReceivedMessages']);
      setNewMessage('');
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      setError('Не удалось отправить сообщение. Пожалуйста, попробуйте позже.');
    }
  });

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !sellerId || !buyerId) return;

    // Create message data
    const messageData = {
      sender_id: buyerId,
      receiver_id: sellerId,
      message: newMessage.trim(),
    };

    // Add product reference if provided
    if (productId) {
      messageData.product_id = productId;
    }

    sendMessageMutation.mutate(messageData);
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
           ' ' + 
           date.toLocaleDateString();
  };
  
  // Not authenticated view
  if (!isAuthenticated()) {
    return (
      <Card>
        <div className="text-center py-6">
          <h3 className="text-xl font-semibold text-wood-text mb-4">Чат с продавцом</h3>
          <p className="text-gray-600 mb-4">Войдите в аккаунт, чтобы начать общение с продавцом</p>
          <Button variant="primary" onClick={() => window.location.href = '/login'}>
            Войти
          </Button>
        </div>
      </Card>
    );
  }
  
  // Loading state for sending message
  const isSending = sendMessageMutation.isPending;
  
  // Error state
  if (error) {
    return (
      <Card>
        <div className="text-center py-6">
          <svg className="w-12 h-12 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="text-xl font-semibold text-wood-text mb-2">Ошибка</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Попробовать снова
          </Button>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-0">
      <div className="flex flex-col h-96">
        {/* Chat Header */}
        <div className="border-b border-gray-200 px-4 py-3">
          <h3 className="text-lg font-semibold text-wood-text">
            Чат с продавцом {sellerId?.slice(0, 8)}...
          </h3>
        </div>

        {/* Messages */}
        <div className="flex-grow p-4 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              Нет сообщений. Начните общение с продавцом.
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              {messages
                .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                .map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col max-w-3/4 ${
                    message.sender_id === buyerId ? 'self-end items-end' : 'self-start items-start'
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.sender_id === buyerId
                        ? 'bg-wood-accent text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.message}
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {formatTimestamp(message.created_at)}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Введите сообщение..."
              className="flex-grow rounded-lg border-gray-300 focus:border-wood-accent focus:ring focus:ring-wood-accent focus:ring-opacity-50"
              disabled={isSending}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={isSending || !newMessage.trim()}
            >
              {isSending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  <span>Отправка...</span>
                </div>
              ) : (
                'Отправить'
              )}
            </Button>
          </form>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;
