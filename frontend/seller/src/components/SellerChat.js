import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FiSend, FiUser, FiMessageCircle, FiClock, FiRefreshCw } from 'react-icons/fi';
import apiService from '../apiService';

function SellerChat() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const sellerId = 'seller-test-001'; // Use test seller ID

  const [message, setMessage] = useState('');
  const [selectedReceiverId, setSelectedReceiverId] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch chat messages for seller
  const { data: messagesData, isLoading: isLoadingMessages, error } = useQuery({
    queryKey: ['sellerChatMessages', sellerId],
    queryFn: () => apiService.getChatMessages({
      limit: 100,
      filters: { sender_id: sellerId },
      sortBy: 'created_at',
      sortDirection: 'desc'
    }),
    enabled: !!sellerId,
    refetchInterval: 10000, // Poll for new messages every 10 seconds
  });

  // Fetch received messages
  const { data: receivedMessagesData } = useQuery({
    queryKey: ['receivedChatMessages', sellerId],
    queryFn: () => apiService.getChatMessages({
      limit: 100,
      filters: { receiver_id: sellerId },
      sortBy: 'created_at',
      sortDirection: 'desc'
    }),
    enabled: !!sellerId,
    refetchInterval: 10000,
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (messageData) => apiService.createChatMessage(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerChatMessages'] });
      queryClient.invalidateQueries({ queryKey: ['receivedChatMessages'] });
      setMessage('');
      toast.success('Сообщение отправлено');
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error(`Ошибка при отправке сообщения: ${error.message}`);
    }
  });

  // Combine and organize messages by conversation
  const organizeConversations = () => {
    const allMessages = [
      ...(messagesData?.data || []),
      ...(receivedMessagesData?.data || [])
    ];

    // Group messages by conversation partner
    const conversations = {};

    allMessages.forEach(msg => {
      const partnerId = msg.sender_id === sellerId ? msg.receiver_id : msg.sender_id;

      if (!conversations[partnerId]) {
        conversations[partnerId] = {
          partnerId,
          messages: [],
          lastMessage: null,
          unreadCount: 0
        };
      }

      conversations[partnerId].messages.push(msg);

      // Update last message
      if (!conversations[partnerId].lastMessage ||
          new Date(msg.created_at) > new Date(conversations[partnerId].lastMessage.created_at)) {
        conversations[partnerId].lastMessage = msg;
      }

      // Count unread messages (messages received by seller)
      if (msg.receiver_id === sellerId) {
        conversations[partnerId].unreadCount++;
      }
    });

    // Sort conversations by last message time
    return Object.values(conversations).sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at);
    });
  };

  const conversations = organizeConversations();
  const selectedConversation = conversations.find(conv => conv.partnerId === selectedReceiverId);

  // Set selected conversation based on URL param
  useEffect(() => {
    if (threadId && conversations.length > 0) {
      const conversation = conversations.find(conv => conv.partnerId === threadId);
      if (conversation) {
        setSelectedReceiverId(conversation.partnerId);
      }
    }
  }, [threadId, conversations.length]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedReceiverId) return;

    const messageData = {
      message: message.trim(),
      sender_id: sellerId,
      receiver_id: selectedReceiverId
    };

    sendMessageMutation.mutate(messageData);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateFull = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const refreshMessages = () => {
    queryClient.invalidateQueries({ queryKey: ['sellerChatMessages'] });
    queryClient.invalidateQueries({ queryKey: ['receivedChatMessages'] });
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ошибка загрузки сообщений</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={refreshMessages}
            className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-80"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-[calc(100vh-120px)]"
    >
      <div className="flex h-full">
        {/* Chat Conversations Sidebar */}
        <div className="w-1/4 bg-white rounded-l-lg shadow-md overflow-hidden border-r border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-brand-primary font-heading">Сообщения</h2>
            <button
              onClick={refreshMessages}
              className="p-2 text-gray-500 hover:text-brand-primary"
              title="Обновить"
            >
              <FiRefreshCw size={16} />
            </button>
          </div>

          {isLoadingMessages ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Загрузка сообщений...</p>
            </div>
          ) : (
            <div className="overflow-y-auto h-[calc(100%-60px)]">
              {conversations.length > 0 ? (
                conversations.map(conversation => (
                  <div
                    key={conversation.partnerId}
                    onClick={() => {
                      setSelectedReceiverId(conversation.partnerId);
                      navigate(`/chat/${conversation.partnerId}`);
                    }}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      selectedReceiverId === conversation.partnerId ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <FiUser className="text-gray-600" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <p className="font-semibold">
                            Пользователь {conversation.partnerId.slice(0, 8)}...
                          </p>
                          <p className="text-xs text-gray-500">
                            <FiClock className="inline mr-1" />
                            {conversation.lastMessage ?
                              formatDateFull(conversation.lastMessage.created_at) :
                              'Нет сообщений'
                            }
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage ?
                            conversation.lastMessage.message :
                            'Нет сообщений'
                          }
                        </p>
                      </div>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="flex justify-end">
                        <span className="bg-brand-accent text-white text-xs rounded-full px-2 py-1">
                          {conversation.unreadCount}
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
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <FiUser className="text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold">
                    Пользователь {selectedConversation.partnerId.slice(0, 8)}...
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {selectedConversation.partnerId}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
                {selectedConversation.messages.length > 0 ? (
                  <div className="space-y-4">
                    {selectedConversation.messages
                      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                      .map(msg => {
                        const isSeller = msg.sender_id === sellerId;
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
                  {sendMessageMutation.isPending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <FiSend size={20} />
                  )}
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
