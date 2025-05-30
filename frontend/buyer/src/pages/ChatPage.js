import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ChatInterface from '../components/chat/ChatInterface';
import apiService from '../apiService';

const ChatPage = () => {
  const { sellerId } = useParams();
  const [activeSellerId, setActiveSellerId] = useState(sellerId || null);
  const [error, setError] = useState(null);

  // Mock authentication - replace with real auth
  const isAuthenticated = () => true; // Replace with real auth check
  const buyerId = 'buyer-id'; // Replace with real buyer ID

  // Fetch chat messages for buyer
  const { data: sentMessagesData, isLoading: sentLoading } = useQuery({
    queryKey: ['buyerSentMessages', buyerId],
    queryFn: () => apiService.getChatMessages({
      limit: 100,
      filters: { sender_id: buyerId },
      sortBy: 'created_at',
      sortDirection: 'desc'
    }),
    enabled: isAuthenticated(),
    refetchInterval: 10000, // Poll for new messages every 10 seconds
  });

  // Fetch received messages
  const { data: receivedMessagesData, isLoading: receivedLoading } = useQuery({
    queryKey: ['buyerReceivedMessages', buyerId],
    queryFn: () => apiService.getChatMessages({
      limit: 100,
      filters: { receiver_id: buyerId },
      sortBy: 'created_at',
      sortDirection: 'desc'
    }),
    enabled: isAuthenticated(),
    refetchInterval: 10000,
  });

  const isLoading = sentLoading || receivedLoading;

  // Organize conversations by seller
  const conversations = useMemo(() => {
    const allMessages = [
      ...(sentMessagesData?.data || []),
      ...(receivedMessagesData?.data || [])
    ];

    // Group messages by conversation partner (seller)
    const conversationMap = {};

    allMessages.forEach(msg => {
      const sellerId = msg.sender_id === buyerId ? msg.receiver_id : msg.sender_id;

      if (!conversationMap[sellerId]) {
        conversationMap[sellerId] = {
          sellerId,
          messages: [],
          lastMessage: null,
          unreadCount: 0
        };
      }

      conversationMap[sellerId].messages.push(msg);

      // Update last message
      if (!conversationMap[sellerId].lastMessage ||
          new Date(msg.created_at) > new Date(conversationMap[sellerId].lastMessage.created_at)) {
        conversationMap[sellerId].lastMessage = msg;
      }

      // Count unread messages (messages received by buyer)
      if (msg.receiver_id === buyerId) {
        conversationMap[sellerId].unreadCount++;
      }
    });

    // Sort conversations by last message time
    return Object.values(conversationMap).sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at);
    });
  }, [sentMessagesData, receivedMessagesData, buyerId]);

  // Set active seller from URL or first conversation
  useEffect(() => {
    if (sellerId) {
      setActiveSellerId(sellerId);
    } else if (conversations.length > 0 && !activeSellerId) {
      setActiveSellerId(conversations[0].sellerId);
    }
  }, [sellerId, conversations, activeSellerId]);
  
  // Not authenticated view
  if (!isAuthenticated()) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-lg mx-auto text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <h1 className="text-3xl font-bold text-wood-text mb-4">Чаты с продавцами</h1>
            <p className="text-gray-600 mb-8">Войдите в аккаунт, чтобы просматривать и отправлять сообщения продавцам</p>
            <Link to="/login">
              <Button variant="primary">Войти</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-wood-text mb-8">Чаты с продавцами</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <Card className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-12 bg-gray-300 rounded"></div>
                  <div className="h-12 bg-gray-300 rounded"></div>
                  <div className="h-12 bg-gray-300 rounded"></div>
                </div>
              </Card>
            </div>
            <div className="md:col-span-3">
              <Card className="animate-pulse h-96">
                <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
                <div className="space-y-4 mb-4">
                  <div className="h-12 bg-gray-300 rounded w-2/3"></div>
                  <div className="h-12 bg-gray-300 rounded w-1/2 ml-auto"></div>
                  <div className="h-12 bg-gray-300 rounded w-3/4"></div>
                </div>
                <div className="h-12 bg-gray-300 rounded mt-auto"></div>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h1 className="text-3xl font-bold text-wood-text mb-4">Ошибка</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Попробовать снова
          </Button>
        </div>
      </Layout>
    );
  }
  
  // No chats view
  if (conversations.length === 0 && !isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-wood-text mb-8">Чаты с продавцами</h1>
          <Card>
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              <h2 className="text-2xl font-bold text-wood-text mb-4">У вас пока нет чатов</h2>
              <p className="text-gray-600 mb-8">Начните общение с продавцом на странице товара</p>
              <Link to="/products">
                <Button variant="primary">Перейти в каталог</Button>
              </Link>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-wood-text mb-8">Чаты с продавцами</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Seller List */}
          <div className="md:col-span-1">
            <Card>
              <h2 className="text-xl font-semibold text-wood-text mb-4">Продавцы</h2>
              <div className="space-y-2">
                {conversations.map(conversation => (
                  <button
                    key={conversation.sellerId}
                    className={`w-full text-left px-4 py-3 rounded-lg transition duration-150 ${
                      conversation.sellerId === activeSellerId
                        ? 'bg-wood-accent text-white'
                        : 'hover:bg-gray-100 text-wood-text'
                    }`}
                    onClick={() => setActiveSellerId(conversation.sellerId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Продавец {conversation.sellerId.slice(0, 8)}...</div>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="text-sm opacity-80 truncate">
                      {conversation.lastMessage ?
                        conversation.lastMessage.message :
                        'Нет сообщений'
                      }
                    </div>
                    <div className="text-xs opacity-60">
                      {conversation.lastMessage ?
                        new Date(conversation.lastMessage.created_at).toLocaleDateString('ru-RU') :
                        ''
                      }
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
          
          {/* Chat Interface */}
          <div className="md:col-span-3">
            {activeSellerId ? (
              <ChatInterface
                sellerId={activeSellerId}
                buyerId={buyerId}
                conversation={conversations.find(c => c.sellerId === activeSellerId)}
              />
            ) : (
              <Card>
                <div className="flex items-center justify-center h-96">
                  <p className="text-gray-500">Выберите чат для начала общения</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChatPage;
