import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ChatInterface from '../components/chat/ChatInterface';
import { useApi } from '../context/ApiContext';
import { useAuth } from '../context/AuthContext';

const ChatPage = () => {
  const { sellerId } = useParams();
  const { apiService } = useApi();
  const { isAuthenticated } = useAuth();
  
  const [seller, setSeller] = useState(null);
  const [chatThreads, setChatThreads] = useState([]);
  const [activeSellerId, setActiveSellerId] = useState(sellerId || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load chat threads
  useEffect(() => {
    const loadChatThreads = async () => {
      if (!isAuthenticated()) return;
      
      try {
        setLoading(true);
        
        // Get all chat threads
        const response = await apiService.getChatThreads();
        setChatThreads(response.data);
        
        // If no active seller is set, use the first thread's seller
        if (!activeSellerId && response.data.length > 0) {
          setActiveSellerId(response.data[0].seller_id);
        }
        
        // Load seller info if we have an active seller
        if (activeSellerId) {
          // This would normally be an API call to get seller info
          // For now, we'll use mock data
          setSeller({
            id: activeSellerId,
            name: 'Продавец',
            rating: 4.5,
            location: 'Москва'
          });
        }
      } catch (error) {
        console.error('Error loading chat threads:', error);
        setError('Не удалось загрузить чаты. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    loadChatThreads();
  }, [apiService, activeSellerId, isAuthenticated]);
  
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
  if (loading) {
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
  if (chatThreads.length === 0) {
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
                {chatThreads.map(thread => (
                  <button
                    key={thread.id}
                    className={`w-full text-left px-4 py-3 rounded-lg transition duration-150 ${
                      thread.seller_id === activeSellerId
                        ? 'bg-wood-accent text-white'
                        : 'hover:bg-gray-100 text-wood-text'
                    }`}
                    onClick={() => setActiveSellerId(thread.seller_id)}
                  >
                    <div className="font-medium">Продавец {thread.seller_id}</div>
                    <div className="text-sm opacity-80">
                      {new Date(thread.updated_at).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
          
          {/* Chat Interface */}
          <div className="md:col-span-3">
            {activeSellerId && (
              <ChatInterface sellerId={activeSellerId} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChatPage;
