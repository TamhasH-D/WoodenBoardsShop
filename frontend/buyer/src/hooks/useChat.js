import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api';
import websocketManager from '../utils/websocketManager';
import { getCurrentBuyerId } from '../utils/auth';

/**
 * Хук для работы с чатом
 * Обеспечивает стабильную работу WebSocket и управление состоянием чата
 */
export const useChat = (sellerId, productTitle) => {
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buyerId, setBuyerId] = useState(null);

  const messagesRef = useRef(new Map()); // Для предотвращения дублирования сообщений
  const initializingRef = useRef(false);

  // Инициализация buyerId
  useEffect(() => {
    const initBuyer = async () => {
      if (initializingRef.current) return;
      initializingRef.current = true;

      try {
        const id = await getCurrentBuyerId();
        setBuyerId(id);
        console.log('[useChat] Buyer ID initialized:', id);
      } catch (err) {
        console.error('[useChat] Failed to get buyer ID:', err);
        setError('Ошибка аутентификации');
      } finally {
        initializingRef.current = false;
      }
    };

    initBuyer();
  }, []);

  // Обработчик WebSocket сообщений
  const handleWebSocketMessage = useCallback((data) => {
    console.log('[useChat] WebSocket message received:', data);

    if (data.type === 'message') {
      const messageId = data.message_id || `ws-${Date.now()}`;
      
      // Проверяем, не получали ли мы уже это сообщение
      if (messagesRef.current.has(messageId)) {
        console.log('[useChat] Duplicate message ignored:', messageId);
        return;
      }

      const newMessage = {
        id: messageId,
        message: data.message,
        sender_id: data.sender_id,
        sender_type: data.sender_type,
        created_at: data.timestamp || new Date().toISOString(),
        thread_id: data.thread_id,
        buyer_id: data.sender_type === 'buyer' ? data.sender_id : null,
        seller_id: data.sender_type === 'seller' ? data.sender_id : null,
        is_read_by_buyer: data.sender_type === 'buyer',
        is_read_by_seller: data.sender_type === 'seller'
      };

      messagesRef.current.set(messageId, newMessage);
      
      setMessages(prev => {
        // Проверяем еще раз в состоянии
        const exists = prev.some(msg => msg.id === messageId);
        if (exists) {
          console.log('[useChat] Message already in state:', messageId);
          return prev;
        }
        
        console.log('[useChat] Adding new message to state:', messageId);
        return [...prev, newMessage];
      });
    } else if (data.type === 'typing') {
      // Обработка индикатора набора текста
      console.log('[useChat] User typing:', data.sender_id);
    } else if (data.type === 'user_joined') {
      console.log('[useChat] User joined:', data.sender_id);
    } else if (data.type === 'user_left') {
      console.log('[useChat] User left:', data.sender_id);
    }
  }, []);

  // Загрузка существующего чата
  const loadExistingChat = useCallback(async () => {
    if (!buyerId || !sellerId) return;

    try {
      setLoading(true);
      setError(null);

      console.log('[useChat] Loading existing chat for buyer:', buyerId, 'seller:', sellerId);
      const result = await apiService.getBuyerChats(buyerId);
      const existingThread = result.data?.find(t => t.seller_id === sellerId);

      if (existingThread) {
        console.log('[useChat] Found existing thread:', existingThread.id);
        setThread(existingThread);

        // Загружаем сообщения
        const messagesResult = await apiService.getChatMessages(existingThread.id, 0, 50);
        const loadedMessages = messagesResult.data || [];
        
        // Обновляем ref для предотвращения дублирования
        messagesRef.current.clear();
        loadedMessages.forEach(msg => {
          messagesRef.current.set(msg.id, msg);
        });
        
        setMessages(loadedMessages);

        // Подключаемся к WebSocket
        websocketManager.addMessageHandler(existingThread.id, handleWebSocketMessage);
        websocketManager.connect(existingThread.id, buyerId, 'buyer', setIsConnected);
      } else {
        console.log('[useChat] No existing thread found');
        setThread(null);
        setMessages([]);
        messagesRef.current.clear();
      }
    } catch (err) {
      console.error('[useChat] Error loading chat:', err);
      setError('Ошибка загрузки чата');
    } finally {
      setLoading(false);
    }
  }, [buyerId, sellerId, handleWebSocketMessage]);

  // Создание нового чата
  const createChat = useCallback(async () => {
    if (!buyerId || !sellerId) {
      throw new Error('Buyer ID or Seller ID not available');
    }

    try {
      console.log('[useChat] Creating new chat thread');
      const result = await apiService.startChatWithSeller(buyerId, sellerId);
      const newThread = result.data;
      
      setThread(newThread);
      setMessages([]);
      messagesRef.current.clear();

      // Подключаемся к WebSocket для нового треда
      websocketManager.addMessageHandler(newThread.id, handleWebSocketMessage);
      websocketManager.connect(newThread.id, buyerId, 'buyer', setIsConnected);

      return newThread;
    } catch (err) {
      console.error('[useChat] Error creating chat:', err);
      throw err;
    }
  }, [buyerId, sellerId, handleWebSocketMessage]);

  // Отправка сообщения
  const sendMessage = useCallback(async (messageText) => {
    if (!messageText.trim()) return false;
    if (!buyerId) throw new Error('Buyer ID not available');

    let currentThread = thread;

    // Создаем чат если его нет
    if (!currentThread) {
      currentThread = await createChat();
    }

    if (!currentThread) {
      throw new Error('Failed to create or get chat thread');
    }

    // Генерируем уникальный ID для сообщения
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const messageData = {
      id: messageId,
      message: messageText.trim(),
      is_read_by_buyer: true,
      is_read_by_seller: false,
      thread_id: currentThread.id,
      buyer_id: buyerId,
      seller_id: null
    };

    try {
      // Отправляем через API
      console.log('[useChat] Sending message via API:', messageData);
      const result = await apiService.sendMessage(messageData);

      if (result) {
        // Отправляем через WebSocket для real-time обновления
        const wsMessage = {
          type: 'message',
          message: messageText.trim(),
          message_id: messageId,
          sender_id: buyerId,
          sender_type: 'buyer',
          thread_id: currentThread.id,
          timestamp: new Date().toISOString()
        };

        const sent = websocketManager.sendMessage(currentThread.id, wsMessage);
        if (!sent) {
          console.warn('[useChat] Failed to send via WebSocket, message will appear when connection restored');
        }

        return true;
      }
      
      throw new Error('API call failed');
    } catch (err) {
      console.error('[useChat] Error sending message:', err);
      throw err;
    }
  }, [thread, buyerId, createChat]);

  // Отправка индикатора набора текста
  const sendTypingIndicator = useCallback(() => {
    if (!thread || !buyerId) return;

    const typingMessage = {
      type: 'typing',
      sender_id: buyerId,
      thread_id: thread.id
    };

    websocketManager.sendMessage(thread.id, typingMessage);
  }, [thread, buyerId]);

  // Загружаем чат при изменении buyerId или sellerId
  useEffect(() => {
    if (buyerId && sellerId) {
      loadExistingChat();
    }
  }, [buyerId, sellerId, loadExistingChat]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (thread) {
        websocketManager.removeMessageHandler(thread.id, handleWebSocketMessage);
        websocketManager.disconnect(thread.id);
      }
    };
  }, [thread, handleWebSocketMessage]);

  return {
    thread,
    messages,
    isConnected,
    loading,
    error,
    buyerId,
    sendMessage,
    sendTypingIndicator,
    hasExistingChat: !!thread,
    defaultMessage: productTitle ? `Заинтересовался вашим товаром "${productTitle}"` : ''
  };
};
