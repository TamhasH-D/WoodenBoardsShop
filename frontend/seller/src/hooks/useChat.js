import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api';
import websocketManager from '../services/websocketManager';
import { getCurrentSellerKeycloakId } from '../utils/auth';
import { useNotifications } from './useNotifications';

/**
 * Enhanced chat hook for seller frontend
 */
export const useChat = () => {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sellerId, setSellerId] = useState(null);

  // Refs for stable references
  const messagesRef = useRef(new Map());
  const typingTimeoutRef = useRef(null);

  // Notifications hook
  const {
    notifyNewMessage,
    notifyMessageSent,
    notifyConnection,
    notifyError
  } = useNotifications();

  // Get seller profile
  const keycloakId = getCurrentSellerKeycloakId();

  // Initialize seller profile
  useEffect(() => {
    const initializeSeller = async () => {
      if (!keycloakId) {
        setError('Не удалось получить ID продавца');
        return;
      }

      try {
        const profile = await apiService.getSellerProfileByKeycloakId(keycloakId);
        setSellerId(profile.id);
      } catch (err) {
        console.error('Failed to get seller profile:', err);
        setError('Ошибка загрузки профиля продавца');
      }
    };

    initializeSeller();
  }, [keycloakId]);

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((data, threadId) => {
    console.log('[useChat] WebSocket message received:', data);

    if (data.type === 'message') {
      // Игнорируем собственные сообщения - они уже добавлены локально
      if (data.sender_id === sellerId) {
        console.log('[useChat] Ignoring own message from WebSocket');
        return;
      }

      const newMessage = {
        id: data.message_id || Date.now(),
        message: data.message,
        sender_id: data.sender_id,
        sender_type: data.sender_type,
        created_at: data.timestamp || new Date().toISOString(),
        thread_id: threadId,
        buyer_id: data.sender_type === 'buyer' ? data.sender_id : null,
        seller_id: data.sender_type === 'seller' ? data.sender_id : null,
        is_read_by_buyer: data.sender_type === 'buyer',
        is_read_by_seller: data.sender_type === 'seller'
      };

      // Update messages for the specific thread
      setMessages(prevMessages => {
        // Avoid duplicates
        const exists = prevMessages.some(msg => msg.id === newMessage.id);
        if (exists) return prevMessages;

        const updated = [...prevMessages, newMessage].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );

        // Update messages cache
        messagesRef.current.set(threadId, updated);

        return updated;
      });

      // Update thread's last message
      setThreads(prevThreads =>
        prevThreads.map(thread =>
          thread.id === threadId
            ? {
                ...thread,
                last_message: newMessage.message,
                updated_at: newMessage.created_at,
                unread_count: newMessage.sender_type === 'buyer'
                  ? (thread.unread_count || 0) + 1
                  : thread.unread_count
              }
            : thread
        )
      );

      // Show notification for new message from buyer
      if (newMessage.sender_type === 'buyer') {
        notifyNewMessage('Покупатель', newMessage.message, threadId);
      }
    } else if (data.type === 'typing') {
      if (data.sender_type === 'buyer') {
        setIsTyping(data.is_typing);

        // Clear typing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Auto-clear typing indicator after 3 seconds
        if (data.is_typing) {
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 3000);
        }
      }
    }
  }, [sellerId, notifyNewMessage]); // Added notifyNewMessage

  // Load chat threads
  const loadThreads = useCallback(async () => {
    if (!sellerId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getSellerChats(sellerId);
      const threadsData = response.data || [];
      setThreads(threadsData);
    } catch (err) {
      console.error('Failed to load threads:', err);
      setError('Ошибка загрузки чатов');
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  // Load messages for a thread
  const loadMessages = useCallback(async (threadId) => {
    if (!threadId) return;

    // Check cache first
    const cachedMessages = messagesRef.current.get(threadId);
    if (cachedMessages) {
      setMessages(cachedMessages);
      return;
    }

    setMessagesLoading(true);

    try {
      const response = await apiService.getChatMessages(threadId);
      const messagesData = response.data || [];
      
      setMessages(messagesData);
      messagesRef.current.set(threadId, messagesData);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Ошибка загрузки сообщений');
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // Select thread and connect WebSocket
  const selectThread = useCallback(async (thread) => {
    if (!sellerId) return;

    // Disconnect from previous thread
    if (selectedThread) {
      websocketManager.removeMessageHandler(selectedThread.id, handleWebSocketMessage);
      websocketManager.disconnect(selectedThread.id);
    }

    setSelectedThread(thread);
    setIsConnected(false);
    setIsTyping(false);

    if (!thread) {
      setMessages([]);
      return;
    }

    // Load messages
    await loadMessages(thread.id);

    // Connect WebSocket
    websocketManager.addMessageHandler(thread.id, handleWebSocketMessage);
    websocketManager.connect(thread.id, sellerId, 'seller', (connected) => {
      setIsConnected(connected);
      // Notify connection status change
      // selectedThread has been updated to `thread` prior to this callback.
      if (thread) { // Check if current thread (which is `thread`) is not null
        notifyConnection(connected);
      }
    });

    // Mark messages as read
    try {
      await apiService.markMessagesAsRead(thread.id, sellerId, 'seller');
      
      // Update thread unread count
      setThreads(prevThreads => 
        prevThreads.map(t => 
          t.id === thread.id ? { ...t, unread_count: 0 } : t
        )
      );
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
      // Optionally set an error state here if needed
    }
  }, [
    sellerId,
    selectedThread,
    handleWebSocketMessage,
    loadMessages,
    notifyConnection, // Added
    setThreads,       // Added
    // setIsConnected, setMessages, setSelectedThread, setIsTyping are stable setters
  ]);

  // Send message
  const sendMessage = useCallback(async (messageText) => {
    if (!sellerId || !messageText.trim()) return false;
    let thread = selectedThread;
    if (!thread) {
      try {
        const response = await apiService.createSellerChatThread(sellerId);
        thread = response.data;
        await selectThread(thread);
      } catch (err) {
        console.error('Failed to create chat thread:', err);
        const errorMessage = 'Ошибка создания чата';
        setError(errorMessage);
        notifyError(errorMessage);
        return false;
      }
    }

    // Генерируем UUID для сообщения
    const messageId = crypto.randomUUID ? crypto.randomUUID() : `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Добавляем сообщение локально сразу для лучшего UX
      const tempMessage = {
        id: messageId,
        message: messageText.trim(),
        buyer_id: null,
        seller_id: sellerId,
        thread_id: thread.id,
        created_at: new Date().toISOString(),
        is_read_by_buyer: false,
        is_read_by_seller: true,
        sending: true // Флаг для отображения статуса отправки
      };

      setMessages(prev => [...prev, tempMessage]);

      const messageData = {
        id: messageId,
        thread_id: thread.id,
        message: messageText.trim(),
        is_read_by_buyer: false,
        is_read_by_seller: true,
        buyer_id: null,
        seller_id: sellerId
      };

      // Отправляем только через API (backend сам разошлет через WebSocket)
      const result = await apiService.sendMessage(messageData);

      if (result) {
        // Обновляем локальное сообщение - убираем флаг отправки
        setMessages(prev => prev.map(msg =>
          msg.id === messageId
            ? { ...msg, sending: false, created_at: result.data?.created_at || msg.created_at }
            : msg
        ));

        // Notify message sent
        notifyMessageSent();

        return true;
      } else {
        throw new Error('API call failed');
      }
    } catch (err) {
      console.error('Failed to send message:', err);

      // Удаляем неудачное сообщение из списка
      setMessages(prev => prev.filter(msg => msg.id !== messageId));

      const errorMessage = 'Ошибка отправки сообщения';
      setError(errorMessage);
      notifyError(errorMessage);
      return false;
    }
  }, [selectedThread, sellerId, notifyError, notifyMessageSent, selectThread, setError]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping) => {
    if (!selectedThread || !sellerId) return;

    if (websocketManager.isConnected(selectedThread.id)) {
      websocketManager.sendMessage(selectedThread.id, {
        type: 'typing',
        is_typing: isTyping,
        sender_id: sellerId,
        sender_type: 'seller',
        thread_id: selectedThread.id
      });
    }
  }, [selectedThread, sellerId]);

  // Load threads when seller ID is available
  useEffect(() => {
    if (sellerId) {
      loadThreads();
    }
  }, [sellerId, loadThreads]);

  // Connect to global WebSocket channel for new threads and buyer messages
  useEffect(() => {
    if (sellerId) {
      console.log('[useChat] Connecting to Global WebSocket channel for new threads');
      websocketManager.addMessageHandler(`global_${sellerId}`, (data) => {
        if (data.type === 'new_thread' && data.thread) {
          setThreads(prev => {
            if (prev.some(t => t.id === data.thread.id)) return prev;
            return [...prev, data.thread];
          });
        } else if (data.type === 'buyer_message' && data.thread) {
          // Update thread with buyer message info
          setThreads(prev => prev.map(t =>
            t.id === data.thread.id
              ? {
                  ...t,
                  last_message: data.message,
                  updated_at: data.timestamp || new Date().toISOString(),
                  unread_count: (t.unread_count || 0) + 1
                }
              : t
          ));
          // Create buyer message object
          const buyerMsg = {
            id: data.message_id || Date.now(),
            message: data.message,
            sender_id: data.sender_id,
            sender_type: 'buyer',
            created_at: data.timestamp || new Date().toISOString(),
            thread_id: data.thread.id,
            buyer_id: data.sender_id,
            seller_id: null, // Seller ID is null for buyer messages
            is_read_by_buyer: false, // Buyer just sent it
            is_read_by_seller: false // Seller hasn't read it yet
          };

          // If this message is for the currently selected thread,
          // handleWebSocketMessage (connected to the specific thread's WebSocket)
          // will take care of updating messages, thread details, and notifications.
          // So, the global handler should only process it if it's for a non-selected thread.
          if (selectedThread && selectedThread.id === data.thread.id) {
            console.log('[useChat] Global handler ignoring buyer_message for selected thread, as it will be handled by specific thread WS.');
            // We still need to update the message cache for the selected thread if the global handler gets it first.
            // handleWebSocketMessage also updates messagesRef.current upon updating setMessages.
            // To ensure robustness, let's update cache here too, guarded by a duplicate check.
            const currentMessagesForSelectedThread = messagesRef.current.get(data.thread.id) || [];
            if (!currentMessagesForSelectedThread.some(msg => msg.id === buyerMsg.id)) {
                messagesRef.current.set(data.thread.id, [...currentMessagesForSelectedThread, buyerMsg].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
            }
          } else {
            // Message is for a non-selected thread
            setThreads(prev => prev.map(t =>
              t.id === data.thread.id
                ? {
                    ...t,
                    last_message: data.message,
                    updated_at: data.timestamp || new Date().toISOString(),
                    unread_count: (t.unread_count || 0) + 1
                  }
                : t
            ));

            // Update messages cache for this non-selected thread
            const cachedForOtherThread = messagesRef.current.get(data.thread.id) || [];
            if (!cachedForOtherThread.some(msg => msg.id === buyerMsg.id)) {
              messagesRef.current.set(data.thread.id, [...cachedForOtherThread, buyerMsg].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
            }

            if (data.sender_type === 'buyer') {
              notifyNewMessage('Покупатель', data.message, data.thread.id);
            }
          }
        }
      });
      websocketManager.connect(`global_${sellerId}`, sellerId, 'seller', (connected) => {
        console.log(`[useChat] Global WebSocket connection status:`, connected);
      });
    }
    return () => {
      if (sellerId) {
        websocketManager.removeMessageHandler(`global_${sellerId}`);
        websocketManager.disconnect(`global_${sellerId}`);
      }
    };
  }, [sellerId, selectedThread, notifyNewMessage]); // Added selectedThread, notifyNewMessage

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (selectedThread) {
        websocketManager.removeMessageHandler(selectedThread.id, handleWebSocketMessage);
        websocketManager.disconnect(selectedThread.id);
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [selectedThread, handleWebSocketMessage]);

  return {
    // State
    threads,
    selectedThread,
    messages,
    loading,
    messagesLoading,
    error,
    isConnected,
    isTyping,
    sellerId,

    // Actions
    loadThreads,
    selectThread,
    sendMessage,
    sendTypingIndicator,
    
    // Utils
    refreshThreads: loadThreads,
    clearError: () => setError(null)
  };
};
