import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FiSend, FiUser, FiMessageCircle, FiClock } from 'react-icons/fi';
import { chatService } from '../services';

function SellerChat() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const sellerId = localStorage.getItem('sellerId') || 'demo-seller-id'; // Replace with actual auth logic
  
  const [message, setMessage] = useState('');
  const [selectedThread, setSelectedThread] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Fetch chat threads
  const { data: threadsData, isLoading: isLoadingThreads } = useQuery({
    queryKey: ['sellerChatThreads', sellerId],
    queryFn: () => chatService.getSellerChatThreads(sellerId),
    enabled: !!sellerId,
  });
  
  // Fetch messages for selected thread
  const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['chatMessages', selectedThread?.id],
    queryFn: () => chatService.getChatMessages(selectedThread?.id),
    enabled: !!selectedThread?.id,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (messageData) => chatService.sendMessage(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', selectedThread?.id] });
      setMessage('');
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error('Ошибка при отправке сообщения');
    }
  });
  
  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (messageId) => chatService.markMessageAsReadBySeller(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', selectedThread?.id] });
    }
  });
  
  // Set selected thread based on URL param
  useEffect(() => {
    if (threadId && threadsData?.data) {
      const thread = threadsData.data.find(t => t.id === threadId);
      if (thread) {
        setSelectedThread(thread);
      }
    }
  }, [threadId, threadsData]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messagesData]);
  
  // Mark unread messages as read
  useEffect(() => {
    if (messagesData?.data && selectedThread) {
      const unreadMessages = messagesData.data.filter(
        msg => !msg.is_read_by_seller && msg.buyer_id !== sellerId
      );
      
      unreadMessages.forEach(msg => {
        markAsReadMutation.mutate(msg.id);
      });
    }
  }, [messagesData, selectedThread, sellerId]);
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedThread) return;
    
    const messageData = {
      id: Date.now().toString(), // Replace with UUID in production
      message: message.trim(),
      is_read_by_buyer: false,
      is_read_by_seller: true,
      thread_id: selectedThread.id,
      buyer_id: selectedThread.buyer_id,
      seller_id: sellerId
    };
    
    sendMessageMutation.mutate(messageData);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };
  
  const getThreadLastMessage = (thread) => {
    // This is a placeholder. In a real app, you'd get the last message from the API
    return 'Последнее сообщение...';
  };
  
  const getUnreadCount = (thread) => {
    // This is a placeholder. In a real app, you'd get the unread count from the API
    return Math.floor(Math.random() * 5);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-[calc(100vh-120px)]"
    >
      <div className="flex h-full">
        {/* Chat Threads Sidebar */}
        <div className="w-1/4 bg-white rounded-l-lg shadow-md overflow-hidden border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-brand-primary font-heading">Сообщения</h2>
          </div>
          
          {isLoadingThreads ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Загрузка чатов...</p>
            </div>
          ) : (
            <div className="overflow-y-auto h-[calc(100%-60px)]">
              {threadsData?.data?.length > 0 ? (
                threadsData.data.map(thread => (
                  <div
                    key={thread.id}
                    onClick={() => {
                      setSelectedThread(thread);
                      navigate(`/chat/${thread.id}`);
                    }}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      selectedThread?.id === thread.id ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <FiUser className="text-gray-600" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <p className="font-semibold">Покупатель {thread.buyer_id.slice(0, 8)}</p>
                          <p className="text-xs text-gray-500">
                            <FiClock className="inline mr-1" />
                            {new Date(thread.created_at).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{getThreadLastMessage(thread)}</p>
                      </div>
                    </div>
                    {getUnreadCount(thread) > 0 && (
                      <div className="flex justify-end">
                        <span className="bg-brand-accent text-white text-xs rounded-full px-2 py-1">
                          {getUnreadCount(thread)}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <FiMessageCircle className="mx-auto text-gray-300 mb-2" size={40} />
                  <p>У вас пока нет сообщений</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Chat Messages */}
        <div className="w-3/4 bg-white rounded-r-lg shadow-md flex flex-col">
          {selectedThread ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <FiUser className="text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold">Покупатель {selectedThread.buyer_id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-500">ID: {selectedThread.id.slice(0, 8)}</p>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
                {isLoadingMessages ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Загрузка сообщений...</p>
                  </div>
                ) : messagesData?.data?.length > 0 ? (
                  <div className="space-y-4">
                    {messagesData.data.map(msg => {
                      const isSeller = msg.seller_id === sellerId;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isSeller ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isSeller
                                ? 'bg-brand-primary text-white rounded-tr-none'
                                : 'bg-white border border-gray-200 rounded-tl-none'
                            }`}
                          >
                            <p>{msg.message}</p>
                            <p className={`text-xs mt-1 text-right ${isSeller ? 'text-gray-200' : 'text-gray-500'}`}>
                              {formatDate(msg.created_at)}
                              {isSeller && (
                                <span className="ml-2">
                                  {msg.is_read_by_buyer ? '✓✓' : '✓'}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Нет сообщений. Начните общение!</p>
                  </div>
                )}
              </div>
              
              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Введите сообщение..."
                  className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <button
                  type="submit"
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className={`bg-brand-accent text-white p-2 rounded-r-lg ${
                    !message.trim() || sendMessageMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'
                  }`}
                >
                  <FiSend size={20} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center text-center p-8">
              <div>
                <FiMessageCircle className="mx-auto text-gray-300 mb-4" size={60} />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Выберите чат</h3>
                <p className="text-gray-500">Выберите чат из списка слева, чтобы начать общение</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default SellerChat;
