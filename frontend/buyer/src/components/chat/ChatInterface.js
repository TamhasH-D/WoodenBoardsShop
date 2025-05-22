import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../context/ApiContext';
import Button from '../ui/Button';
import Card from '../ui/Card';

const ChatInterface = ({ sellerId, productId = null }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const { apiService } = useApi();
  
  const [chatThread, setChatThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Load or create chat thread
  useEffect(() => {
    const loadOrCreateChatThread = async () => {
      if (!isAuthenticated() || !sellerId) return;
      
      try {
        setLoading(true);
        
        // Try to find existing chat thread
        const threadsResponse = await apiService.getChatThreads();
        const existingThread = threadsResponse.data.find(
          thread => thread.seller_id === sellerId && thread.buyer_id === currentUser.id
        );
        
        if (existingThread) {
          setChatThread(existingThread);
          
          // Load messages for this thread
          const messagesResponse = await apiService.getChatMessages(existingThread.id);
          setMessages(messagesResponse.data);
        } else {
          // Create new chat thread
          const newThreadData = {
            seller_id: sellerId,
            buyer_id: currentUser.id
          };
          
          const newThreadResponse = await apiService.createChatThread(newThreadData);
          setChatThread(newThreadResponse.data);
        }
      } catch (error) {
        console.error('Error loading chat thread:', error);
        setError('Не удалось загрузить чат. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    loadOrCreateChatThread();
  }, [apiService, sellerId, currentUser, isAuthenticated]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !chatThread) return;
    
    try {
      setSending(true);
      
      // Create message data
      const messageData = {
        thread_id: chatThread.id,
        sender_id: currentUser.id,
        content: newMessage.trim(),
        is_read: false
      };
      
      // Add product reference if provided
      if (productId) {
        messageData.product_id = productId;
      }
      
      // Send message to API
      const response = await apiService.createChatMessage(messageData);
      
      // Add new message to list
      setMessages(prevMessages => [...prevMessages, response.data]);
      
      // Clear input
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Не удалось отправить сообщение. Пожалуйста, попробуйте позже.');
    } finally {
      setSending(false);
    }
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
  
  // Loading state
  if (loading) {
    return (
      <Card>
        <div className="flex flex-col h-96">
          <div className="border-b border-gray-200 px-4 py-3">
            <div className="h-6 bg-gray-300 rounded w-1/3 animate-pulse"></div>
          </div>
          <div className="flex-grow p-4 overflow-y-auto">
            <div className="flex flex-col space-y-4">
              <div className="h-12 bg-gray-300 rounded w-2/3 animate-pulse"></div>
              <div className="h-12 bg-gray-300 rounded w-1/2 self-end animate-pulse"></div>
              <div className="h-12 bg-gray-300 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
          <div className="border-t border-gray-200 p-4">
            <div className="h-10 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      </Card>
    );
  }
  
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
          <h3 className="text-lg font-semibold text-wood-text">Чат с продавцом</h3>
        </div>
        
        {/* Messages */}
        <div className="flex-grow p-4 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              Нет сообщений. Начните общение с продавцом.
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex flex-col max-w-3/4 ${
                    message.sender_id === currentUser.id ? 'self-end items-end' : 'self-start items-start'
                  }`}
                >
                  <div 
                    className={`rounded-lg px-4 py-2 ${
                      message.sender_id === currentUser.id 
                        ? 'bg-wood-accent text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.content}
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
              disabled={sending}
            />
            <Button 
              type="submit" 
              variant="primary"
              disabled={sending || !newMessage.trim()}
            >
              {sending ? (
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
