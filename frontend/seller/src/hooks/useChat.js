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
  const selectedThreadRef = useRef(selectedThread);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false); // Represents connection status of the selectedThread's WebSocket
  const [isTyping, setIsTyping] = useState(false);
  const [sellerId, setSellerId] = useState(null);

  const messagesRef = useRef(new Map());
  const typingTimeoutRef = useRef(null);

  const {
    notifyNewMessage,
    notifyMessageSent,
    notifyConnection,
    notifyError
  } = useNotifications();

  const keycloakId = getCurrentSellerKeycloakId();

  useEffect(() => {
    selectedThreadRef.current = selectedThread;
  }, [selectedThread]);

  useEffect(() => {
    const initializeSeller = async () => {
      console.log('[useChat Init] keycloakId:', keycloakId);
      if (!keycloakId) {
        setError('Не удалось получить ID продавца');
        console.error('[useChat Init] keycloakId is missing.');
        return;
      }
      try {
        const profile = await apiService.getSellerProfileByKeycloakId(keycloakId);
        console.log('[useChat Init] Seller profile fetched:', profile);
        if (profile && profile.data && profile.data.id) {
          setSellerId(profile.data.id);
          console.log('[useChat Init] sellerId set to:', profile.data.id);
        } else {
          console.error('[useChat Init] Fetched profile is invalid or missing ID, or data property is missing. Profile object received:', profile);
          setError('Ошибка загрузки профиля продавца: неверные данные профиля');
        }
      } catch (err) {
        console.error('[useChat Init] Error fetching seller profile:', err);
        setError('Ошибка загрузки профиля продавца');
      }
    };
    initializeSeller();
  }, [keycloakId, setError]);

  const handleWebSocketMessage = useCallback((data, threadId) => {
    console.log('[useChat] WebSocket message received for selected thread:', data, 'threadId:', threadId);
    if (data.type === 'message') {
      if (data.sender_id === sellerId) {
        console.log('[useChat handleWebSocketMessage] Ignoring own message from WebSocket');
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
      setMessages(prevMessages => {
        const exists = prevMessages.some(msg => msg.id === newMessage.id);
        if (exists) return prevMessages;
        const updated = [...prevMessages, newMessage].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        messagesRef.current.set(threadId, updated);
        return updated;
      });
      setThreads(prevThreads =>
        prevThreads.map(thread =>
          thread.id === threadId
            ? {
                ...thread,
                last_message: newMessage.message,
                updated_at: newMessage.created_at,
                unread_count: newMessage.sender_type === 'buyer' ? (thread.unread_count || 0) + 1 : thread.unread_count
              }
            : thread
        )
      );
      if (newMessage.sender_type === 'buyer') {
        notifyNewMessage('Покупатель', newMessage.message, threadId);
      }
    } else if (data.type === 'typing') {
      if (data.sender_type === 'buyer') {
        setIsTyping(data.is_typing);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        if (data.is_typing) {
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 3000);
        }
      }
    }
  }, [sellerId, notifyNewMessage, setMessages, setThreads, setIsTyping, messagesRef, typingTimeoutRef]);

  const loadThreads = useCallback(async () => {
    if (!sellerId) {
      console.log('[useChat loadThreads] Aborted early: sellerId is null or undefined.');
      return;
    }
    console.log(`[useChat loadThreads] Starting for sellerId: ${sellerId}`);
    setLoading(true);
    setError(null);
    try {
      console.log(`[useChat loadThreads] Attempting to call apiService.getSellerChats for sellerId: ${sellerId}`);
      const response = await apiService.getSellerChats(sellerId);
      console.log('[useChat loadThreads] Raw response from apiService.getSellerChats:', response);
      const threadsData = response && response.data ? response.data : [];
      setThreads(threadsData);
      if (!response || !response.data) {
        console.warn('[useChat loadThreads] Response from getSellerChats is missing or has no .data property. Full response:', response);
      }
      if (threadsData.length === 0) {
        console.log('[useChat loadThreads] No chat threads were processed or returned for sellerId:', sellerId);
      } else {
        console.log(`[useChat loadThreads] Successfully processed ${threadsData.length} threads for sellerId:`, sellerId);
      }
    } catch (err) {
      console.error('[useChat loadThreads] CRITICAL: Error during apiService.getSellerChats call or processing:', err);
      setError(err.message || 'Ошибка загрузки чатов');
      setThreads([]);
    } finally {
      setLoading(false);
      console.log(`[useChat loadThreads] Finished for sellerId: ${sellerId}. Loading: false.`);
    }
  }, [sellerId, setLoading, setError, setThreads]);

  const loadMessages = useCallback(async (threadId) => {
    if (!threadId) return;
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
  }, [setMessages, setMessagesLoading, setError, messagesRef]);

  const selectThread = useCallback(async (thread) => {
    if (!sellerId) {
        console.log('[useChat selectThread] Aborted: sellerId is missing.');
        return;
    }

    const currentSelectedThread = selectedThreadRef.current;

    if (thread && currentSelectedThread && thread.id === currentSelectedThread.id) {
      console.log(`[useChat selectThread] Thread ${thread.id} is already selected. Marking messages as read.`);
      if (isConnected && sellerId) { // isConnected reflects the current selected thread's WS status
        try {
          await apiService.markMessagesAsRead(thread.id, sellerId, 'seller');
          setThreads(prevThreads =>
            prevThreads.map(t =>
              t.id === thread.id ? { ...t, unread_count: 0 } : t
            )
          );
        } catch (err) {
          console.error('[useChat selectThread] Failed to mark messages as read on re-select:', err);
        }
      }
      return; // Exit early
    }

    console.log(`[useChat selectThread] Selecting new thread. Old: ${currentSelectedThread?.id}, New: ${thread?.id}`);

    // Disconnect from the *previous* thread, if one was selected
    if (currentSelectedThread) {
      console.log(`[useChat selectThread] Disconnecting from previous thread ${currentSelectedThread.id}`);
      websocketManager.removeMessageHandler(currentSelectedThread.id, handleWebSocketMessage);
      websocketManager.disconnect(currentSelectedThread.id);
    }

    setSelectedThread(thread); // This updates selectedThread state, which updates selectedThreadRef.current via its own useEffect

    // If no new thread is selected (e.g., deselecting or initial state)
    if (!thread) {
      console.log('[useChat selectThread] No new thread selected. Clearing messages.');
      setMessages([]);
      setIsConnected(false); // No thread selected, so not connected to any specific thread WS
      setIsTyping(false);
      return;
    }

    // For a new thread selection
    setIsConnected(false); // Set to false initially for the new thread
    setIsTyping(false);
    setMessages([]); // Clear messages from previous thread before loading new ones

    console.log(`[useChat selectThread] Loading messages for new thread ${thread.id}`);
    await loadMessages(thread.id);

    console.log(`[useChat selectThread] Setting up WebSocket for new thread ${thread.id}`);
    websocketManager.addMessageHandler(thread.id, handleWebSocketMessage);
    websocketManager.connect(thread.id, sellerId, 'seller', (connectedStatus) => {
      // Ensure this callback only updates state for the *currently intended* selected thread
      if (selectedThreadRef.current && selectedThreadRef.current.id === thread.id) {
        setIsConnected(connectedStatus);
        console.log(`[useChat selectThread] WebSocket for thread ${thread.id} connection status: ${connectedStatus}`);
        notifyConnection(connectedStatus);
         // If connected, mark messages as read
        if (connectedStatus) {
          apiService.markMessagesAsRead(thread.id, sellerId, 'seller')
            .then(() => {
              console.log(`[useChat selectThread] Messages marked as read for thread ${thread.id} after connection.`);
              setThreads(prevThreads =>
                prevThreads.map(t =>
                  t.id === thread.id ? { ...t, unread_count: 0 } : t
                )
              );
            })
            .catch(err => console.error('[useChat selectThread] Failed to mark messages as read after connection:', err));
        }
      } else {
        console.log(`[useChat selectThread] WebSocket callback for thread ${thread.id}, but current selected thread is ${selectedThreadRef.current?.id}. Ignoring.`);
      }
    });
    // Initial call to mark as read, connection callback will also do it.
    try {
        await apiService.markMessagesAsRead(thread.id, sellerId, 'seller');
        setThreads(prevThreads =>
            prevThreads.map(t =>
            t.id === thread.id ? { ...t, unread_count: 0 } : t
            )
        );
    } catch (err) {
        console.error('[useChat selectThread] Initial mark messages as read failed:', err);
    }

  }, [
    sellerId,
    handleWebSocketMessage,
    loadMessages,
    isConnected, // To check current connection status for re-selection logic
    notifyConnection,
    setThreads,
    setSelectedThread,
    setIsConnected,
    setIsTyping,
    setMessages
  ]);

  const sendMessage = useCallback(async (messageText) => {
    if (!sellerId || !messageText.trim()) return false;
    let threadToUse = selectedThreadRef.current;
    if (!threadToUse) {
      try {
        const response = await apiService.createSellerChatThread(sellerId);
        threadToUse = response.data;
        if (!threadToUse || !threadToUse.id) {
            console.error('[useChat sendMessage] Failed to create or retrieve valid thread:', threadToUse);
            setError('Ошибка создания нового чата: неверные данные');
            notifyError('Ошибка создания нового чата: неверные данные');
            return false;
        }
        await selectThread(threadToUse);
      } catch (err) {
        console.error('Failed to create chat thread:', err);
        const errorMessage = 'Ошибка создания чата';
        setError(errorMessage);
        notifyError(errorMessage);
        return false;
      }
    }
    if (!threadToUse || !threadToUse.id) {
        console.error('[useChat sendMessage] No valid thread selected or created to send message.');
        setError('Нет активного чата для отправки сообщения.');
        notifyError('Нет активного чата для отправки сообщения.');
        return false;
    }
    const messageId = crypto.randomUUID ? crypto.randomUUID() : `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
      const tempMessage = {
        id: messageId,
        message: messageText.trim(),
        buyer_id: null,
        seller_id: sellerId,
        thread_id: threadToUse.id,
        created_at: new Date().toISOString(),
        is_read_by_buyer: false,
        is_read_by_seller: true,
        sending: true
      };
      setMessages(prev => [...prev, tempMessage]);
      const messageData = {
        id: messageId,
        thread_id: threadToUse.id,
        message: messageText.trim(),
        is_read_by_buyer: false,
        is_read_by_seller: true,
        buyer_id: null,
        seller_id: sellerId
      };
      const result = await apiService.sendMessage(messageData);
      if (result && result.data) {
        setMessages(prev => prev.map(msg =>
          msg.id === messageId
            ? { ...msg, ...result.data, id: result.data.id || messageId, sending: false }
            : msg
        ));
        notifyMessageSent();
        return true;
      } else {
         console.error('[useChat sendMessage] API call to send message failed or returned invalid data:', result);
        throw new Error('API call failed or returned no data');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      const errorMessage = err.message || 'Ошибка отправки сообщения';
      setError(errorMessage);
      notifyError(errorMessage);
      return false;
    }
  }, [sellerId, notifyError, notifyMessageSent, selectThread, setError, setMessages, notifyNewMessage]);

  const sendTypingIndicator = useCallback((isTypingStatus) => {
    const currentSelectedThread = selectedThreadRef.current;
    if (!currentSelectedThread || !sellerId) return;
    if (websocketManager.isConnected(currentSelectedThread.id)) {
      websocketManager.sendMessage(currentSelectedThread.id, {
        type: 'typing',
        is_typing: isTypingStatus,
        sender_id: sellerId,
        sender_type: 'seller',
        thread_id: currentSelectedThread.id
      });
    }
  }, [sellerId]);

  useEffect(() => {
    if (sellerId) {
      console.log('[useChat Effect] sellerId is now available, calling loadThreads. sellerId:', sellerId);
      loadThreads();
    } else {
      console.log('[useChat Effect] sellerId is not yet available or is null.');
    }
  }, [sellerId, loadThreads]);

  const handleGlobalMessage = useCallback((data) => {
    console.log('[useChat handleGlobalMessage] Received data:', data);
    const currentSelectedThread = selectedThreadRef.current;
    if (data.type === 'new_thread' && data.thread) {
      setThreads(prev => {
        if (prev.some(t => t.id === data.thread.id)) return prev;
        return [...prev, data.thread].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      });
    } else if (data.type === 'buyer_message' && data.thread) {
      const messageIsForSelectedThread = currentSelectedThread && currentSelectedThread.id === data.thread.id;
      setThreads(prev => prev.map(t =>
        t.id === data.thread.id
          ? {
              ...t,
              last_message: data.message,
              updated_at: data.timestamp || new Date().toISOString(),
              unread_count: messageIsForSelectedThread ? t.unread_count : (t.unread_count || 0) + 1,
            }
          : t
      ).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
      const buyerMsg = {
        id: data.message_id || Date.now(),
        message: data.message,
        sender_id: data.sender_id,
        sender_type: 'buyer',
        created_at: data.timestamp || new Date().toISOString(),
        thread_id: data.thread.id,
        buyer_id: data.sender_id,
        seller_id: null,
        is_read_by_buyer: false,
        is_read_by_seller: false
      };
      const cachedMessages = messagesRef.current.get(data.thread.id) || [];
      if (!cachedMessages.some(msg => msg.id === buyerMsg.id)) {
        messagesRef.current.set(data.thread.id, [...cachedMessages, buyerMsg].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
      }
      if (!messageIsForSelectedThread && data.sender_type === 'buyer') {
        notifyNewMessage('Покупатель', data.message, data.thread.id);
      }
    }
  }, [setThreads, messagesRef, notifyNewMessage]);

  useEffect(() => {
    if (sellerId) {
      const globalChannelId = `global_${sellerId}`;
      console.log(`[useChat] Setting up Global WebSocket channel: ${globalChannelId}`);
      websocketManager.addMessageHandler(globalChannelId, handleGlobalMessage);
      websocketManager.connect(globalChannelId, sellerId, 'seller', (connected) => {
        console.log(`[useChat] Global WebSocket (${globalChannelId}) connection status:`, connected);
      });
      return () => {
        console.log(`[useChat] Cleaning up Global WebSocket channel: ${globalChannelId}`);
        websocketManager.removeMessageHandler(globalChannelId, handleGlobalMessage);
        websocketManager.disconnect(globalChannelId);
      };
    }
  }, [sellerId, handleGlobalMessage]);

  useEffect(() => {
    const currentSelectedThreadForUnmount = selectedThreadRef.current;
    const currentHandlerForUnmount = handleWebSocketMessage;
    return () => {
      if (currentSelectedThreadForUnmount) {
        console.log(`[useChat Unmount] Cleaning up WebSocket for selected thread ${currentSelectedThreadForUnmount.id}`);
        websocketManager.removeMessageHandler(currentSelectedThreadForUnmount.id, currentHandlerForUnmount);
        websocketManager.disconnect(currentSelectedThreadForUnmount.id);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [handleWebSocketMessage]);

  return {
    threads,
    selectedThread,
    messages,
    loading,
    messagesLoading,
    error,
    isConnected,
    isTyping,
    sellerId,
    loadThreads,
    selectThread,
    sendMessage,
    sendTypingIndicator,
    refreshThreads: loadThreads,
    clearError: () => setError(null)
  };
};
