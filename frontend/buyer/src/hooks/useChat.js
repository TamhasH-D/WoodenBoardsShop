import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api';
import websocketManager from '../utils/websocketManager';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

/**
 * Хук для работы с чатом
 * Обеспечивает стабильную работу WebSocket и управление состоянием чата
 */
export const useChat = (sellerId, productTitle, initialThreadId = null) => {
  const { buyerProfile, isAuthenticated: profileAndKeycloakAuthenticated, profileLoading, keycloakAuthenticated } = useAuth(); // Consume AuthContext

  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true); // Represents chat loading, not profile loading
  const [error, setError] = useState(null);

  // buyerId is now derived from buyerProfile
  const buyerId = buyerProfile?.id;

  const messagesRef = useRef(new Map());
  const initializingRef = useRef(false); // To prevent multiple initializations

  // Обработчик WebSocket сообщений
  const handleWebSocketMessage = useCallback((data) => {
    console.log('[useChat] WebSocket message received:', data);

    if (data.type === 'message') {
      if (!buyerId || data.sender_id === buyerId) { // Check buyerId before ignoring
        console.log('[useChat] Ignoring own message from WebSocket or buyerId not set');
        return;
      }

      const messageId = data.message_id || `ws-${Date.now()}`;
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
        const exists = prev.some(msg => msg.id === messageId);
        if (exists) return prev;
        return [...prev, newMessage];
      });
    } else if (data.type === 'typing') {
      console.log('[useChat] User typing:', data.sender_id);
    }
  }, [buyerId]); // Added buyerId dependency

  // Загрузка существующего чата или инициализация
  const initializeOrLoadChat = useCallback(async () => {
    if (initializingRef.current || !profileAndKeycloakAuthenticated || !buyerId || profileLoading) {
      if (!profileAndKeycloakAuthenticated || !buyerId) {
        setLoading(false);
        if (!profileAndKeycloakAuthenticated && !profileLoading) setError("Пользователь не аутентифицирован для чата.");
        else if (!profileLoading) setError("Необходимые данные для чата отсутствуют (buyerId).");
      }
      return;
    }
    // Additional check: if not using initialThreadId, sellerId must be present.
    if (!initialThreadId && !sellerId) {
        setLoading(false);
        if (!profileLoading) setError("Необходимые данные для чата отсутствуют (sellerId).");
        return;
    }

    initializingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      if (initialThreadId) {
        console.log('[useChat] Initializing with provided threadId:', initialThreadId, 'for buyer:', buyerId);
        // SellerId might be null here if useChat was called with only initialThreadId.
        // The thread object structure should ideally be consistent or handle potential missing seller_id if it's used elsewhere.
        setThread({ id: initialThreadId, buyer_id: buyerId, seller_id: sellerId });

        const messagesResult = await apiService.getChatMessages(initialThreadId, 0, 50);
        const loadedMessages = messagesResult.data || [];
        messagesRef.current.clear();
        loadedMessages.forEach(msg => messagesRef.current.set(msg.id, msg));
        setMessages(loadedMessages);

        websocketManager.addMessageHandler(initialThreadId, handleWebSocketMessage);
        websocketManager.connect(initialThreadId, buyerId, 'buyer', setIsConnected);

      } else if (sellerId) { // This block handles the original logic when initialThreadId is not provided
        console.log('[useChat] Initializing/Loading chat for buyer:', buyerId, 'seller:', sellerId);
        const result = await apiService.getBuyerChats(buyerId, 0, 100);
        const existingThread = result.data?.find(t => t.seller_id === sellerId && t.buyer_id === buyerId);

        if (existingThread) {
          console.log('[useChat] Found existing thread:', existingThread.id);
          setThread(existingThread);
          const messagesResult = await apiService.getChatMessages(existingThread.id, 0, 50);
          const loadedMessages = messagesResult.data || [];
          messagesRef.current.clear();
          loadedMessages.forEach(msg => messagesRef.current.set(msg.id, msg));
          setMessages(loadedMessages);

          websocketManager.addMessageHandler(existingThread.id, handleWebSocketMessage);
          websocketManager.connect(existingThread.id, buyerId, 'buyer', setIsConnected);
        } else {
          console.log('[useChat] No existing thread found with seller:', sellerId);
          setThread(null);
          setMessages([]);
          messagesRef.current.clear();
        }
      }
    } catch (err) {
      console.error('[useChat] Error loading chat:', err);
      setError('Ошибка загрузки чата');
    } finally {
      setLoading(false);
      initializingRef.current = false;
    }
  }, [buyerId, sellerId, initialThreadId, handleWebSocketMessage, profileAndKeycloakAuthenticated, profileLoading]);

  // Создание нового чата (called by sendMessage if no thread)
  const createChat = useCallback(async () => {
    if (!profileAndKeycloakAuthenticated || !buyerId || !sellerId) {
      throw new Error('User not authenticated or missing IDs for chat creation.');
    }
    if (profileLoading) {
      throw new Error('Profile is still loading, cannot create chat.');
    }

    try {
      console.log('[useChat] Creating new chat thread with seller:', sellerId);
      // TODO: Refactor apiService.startChatWithSeller to not require buyerId if derivable from token
      const result = await apiService.startChatWithSeller(buyerId, sellerId);
      const newThread = result.data; // Assuming result.data is the thread object
      
      setThread(newThread);
      setMessages([]); // Start with empty messages for new thread
      messagesRef.current.clear();

      websocketManager.addMessageHandler(newThread.id, handleWebSocketMessage);
      websocketManager.connect(newThread.id, buyerId, 'buyer', setIsConnected);
      console.log('[useChat] New chat thread created and connected:', newThread.id);
      return newThread;
    } catch (err) {
      console.error('[useChat] Error creating chat:', err);
      setError('Не удалось создать чат.');
      throw err;
    }
  }, [buyerId, sellerId, handleWebSocketMessage, profileAndKeycloakAuthenticated, profileLoading]);

  // Отправка сообщения
  const sendMessage = useCallback(async (messageText) => {
    if (!messageText.trim()) return false;
    if (!profileAndKeycloakAuthenticated || !buyerId) {
      setError("Невозможно отправить сообщение: пользователь не аутентифицирован или профиль не загружен.");
      throw new Error('User not authenticated or buyer ID not available from profile.');
    }
    if (profileLoading) {
        setError("Профиль загружается, подождите перед отправкой.");
        throw new Error('Profile is loading, cannot send message yet.');
    }

    let currentThread = thread;
    if (!currentThread) {
      try {
        console.log('[useChat] No active thread, attempting to create one before sending message.');
        currentThread = await createChat();
      } catch (creationError) {
        console.error('[useChat] Failed to create chat before sending message:', creationError);
        setError('Не удалось создать чат для отправки сообщения.');
        throw creationError;
      }
    }

    if (!currentThread) {
      throw new Error('Failed to get or create chat thread.');
    }

    const messageId = crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}`;
    const tempMessage = {
      id: messageId,
      message: messageText.trim(),
      buyer_id: buyerId, // Populated from buyerProfile.id
      seller_id: null, // Backend will populate based on thread context if needed
      thread_id: currentThread.id,
      created_at: new Date().toISOString(),
      is_read_by_buyer: true,
      is_read_by_seller: false,
      sending: true
    };

    messagesRef.current.set(messageId, tempMessage);
    setMessages(prev => [...prev, tempMessage]);

    try {
      const messagePayload = {
        id: messageId, // Send client-generated ID
        message: messageText.trim(),
        thread_id: currentThread.id,
        // buyer_id and seller_id might be inferred by backend based on authenticated user and thread_id
        // For now, explicitly sending buyer_id based on current logic.
        // TODO: Confirm if apiService.sendMessage needs buyer_id or if backend infers it.
        // If backend infers, this explicit buyer_id can be removed from payload.
        buyer_id: buyerId,
      };
      console.log('[useChat] Sending message via API with payload:', messagePayload);
      // TODO: Refactor apiService.sendMessage to not require buyer_id if derivable from token
      const result = await apiService.sendMessage(messagePayload);

      setMessages(prev => prev.map(msg =>
        msg.id === messageId
        ? { ...msg, sending: false, created_at: result.data?.created_at || msg.created_at, id: result.data?.id || msg.id } // Use server ID if available
        : msg
      ));
      if (result.data?.id && result.data.id !== messageId) { // Update ref with server ID
          messagesRef.current.delete(messageId);
          messagesRef.current.set(result.data.id, {...tempMessage, sending: false, id: result.data.id });
      } else {
          messagesRef.current.set(messageId, {...tempMessage, sending: false });
      }
      console.log('[useChat] Message sent successfully, server response:', result.data);
      return true;
    } catch (err) {
      console.error('[useChat] Error sending message:', err);
      messagesRef.current.delete(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      setError('Не удалось отправить сообщение.');
      throw err;
    }
  }, [thread, buyerId, createChat, profileAndKeycloakAuthenticated, profileLoading]);

  const sendTypingIndicator = useCallback(() => {
    if (!thread || !buyerId || !profileAndKeycloakAuthenticated) return;
    const typingMessage = { type: 'typing', sender_id: buyerId, thread_id: thread.id };
    websocketManager.sendMessage(thread.id, typingMessage);
  }, [thread, buyerId, profileAndKeycloakAuthenticated]);

  // Effect for initializing or loading chat
  useEffect(() => {
    const canInitializeForExistingThread = initialThreadId && profileAndKeycloakAuthenticated && buyerId && !profileLoading;
    const canInitializeForSeller = !initialThreadId && sellerId && profileAndKeycloakAuthenticated && buyerId && !profileLoading;

    if (canInitializeForExistingThread) {
      console.log('[useChat] Auth and profile ready, initialThreadId provided. Calling initializeOrLoadChat for existing thread.');
      initializeOrLoadChat();
    } else if (canInitializeForSeller) {
      console.log('[useChat] Auth and profile ready, sellerId provided (no initialThreadId). Calling initializeOrLoadChat for seller.');
      initializeOrLoadChat();
    } else if (!profileLoading) {
      console.log('[useChat] Conditions not fully met for chat initialization after profile attempt.');
      setLoading(false);
      setMessages([]);
      setThread(null);
      // Specific error if keycloak is auth'd but buyerId is missing (profile issue)
      if (keycloakAuthenticated && !buyerId) {
        console.warn('[useChat] Profile loaded (or an attempt was made) but buyerId is missing.');
        setError("Профиль пользователя обработан, но идентификатор покупателя отсутствует. Чат не может быть инициализирован.");
      }
      // Specific error if not fully authenticated (either keycloak or profile part failed)
      else if (!profileAndKeycloakAuthenticated) {
        console.warn('[useChat] User not fully authenticated for chat (Keycloak or Profile).');
        if (!keycloakAuthenticated) {
             setError("Пользователь не аутентифицирован в системе. Войдите, чтобы использовать чат.");
        } else { // Keycloak is authenticated, so profile must be the issue (missing or error)
             setError("Профиль пользователя не загружен или содержит ошибки. Чат недоступен.");
        }
      }
      // Error if essential IDs (threadId or sellerId) are missing, given other conditions might be met
      else if (!initialThreadId && !sellerId) {
        console.warn('[useChat] Chat cannot be initialized without either initialThreadId or sellerId.');
        setError("Необходим идентификатор чата или продавца для инициализации.");
      }
    }
  }, [initialThreadId, sellerId, profileAndKeycloakAuthenticated, buyerId, initializeOrLoadChat, profileLoading, keycloakAuthenticated]);

  // Cleanup WebSocket connection
  useEffect(() => {
    return () => {
      if (thread) {
        console.log('[useChat] Cleaning up WebSocket for thread:', thread.id);
        websocketManager.removeMessageHandler(thread.id, handleWebSocketMessage);
        // Consider if disconnect is needed or if manager handles it.
        // websocketManager.disconnect(thread.id);
      }
    };
  }, [thread, handleWebSocketMessage]);

  return {
    thread,
    messages,
    isConnected,
    loading: loading || profileLoading, // Combine chat loading with profile loading status
    error,
    buyerId, // Derived from buyerProfile.id
    sendMessage,
    sendTypingIndicator,
    hasExistingChat: !!thread,
    defaultMessage: productTitle ? `Здравствуйте! Заинтересовал ваш товар "${productTitle}".` : ''
  };
};
