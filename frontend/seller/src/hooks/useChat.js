import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api';
import websocketManager, { WS_STATES, WS_MESSAGE_TYPES } from '../services/websocketManager';
import { getCurrentSellerKeycloakId } from '../utils/auth';
import { useNotifications } from './useNotifications';

export const useChat = () => {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]); // Messages for the selectedThread
  const [loading, setLoading] = useState(false); // For loading threads
  const [messagesLoading, setMessagesLoading] = useState(false); // For loading messages of selectedThread
  const [error, setError] = useState(null);

  const [chatChannelStatus, setChatChannelStatus] = useState(WS_STATES.CLOSED); // For selected chat thread
  const [globalChannelStatus, setGlobalChannelStatus] = useState(WS_STATES.CLOSED); // For seller's global notifications

  const [isTyping, setIsTyping] = useState(false); // Typing indicator for selectedThread
  const [sellerId, setSellerId] = useState(null);

  const messagesCacheRef = useRef(new Map()); // Cache messages per threadId: threadId -> [messages]
  const typingTimeoutRef = useRef(null);

  const { notifyNewMessage: showUINotification, notifyError, notifyInfo } = useNotifications();

  useEffect(() => {
    const initializeSeller = async () => {
      const keycloakId = getCurrentSellerKeycloakId();
      if (!keycloakId) {
        setError('Не удалось получить ID продавца.');
        return;
      }
      try {
        setLoading(true);
        const profile = await apiService.getSellerProfileByKeycloakId(keycloakId);
        setSellerId(profile.id);
      } catch (err) {
        console.error('Failed to get seller profile:', err);
        setError('Ошибка загрузки профиля продавца.');
        notifyError('Ошибка загрузки профиля продавца.');
      } finally {
        setLoading(false);
      }
    };
    initializeSeller();
  }, [notifyError]);

  // --- WebSocket Message Handlers ---

  const handleChatChannelMessage = useCallback((data, connectionKey) => {
    // This handler is for messages from the currently selected chat thread's WebSocket
    console.log(`[useChat] CHAT (${connectionKey}) message:`, data);
    if (connectionKey !== selectedThread?.id) return; // Ensure it's for the selected thread

    switch (data.type) {
      case WS_MESSAGE_TYPES.MESSAGE:
        // Ignore own messages if backend echoes them; API call already adds local message
        if (data.sender_id === sellerId && data.message_id) { // message_id indicates it's a confirmed message
             // Potentially update local message if server provides new info (e.g. confirmed timestamp)
             setMessages(prev => prev.map(m => m.id === data.message_id ? {...m, ...data, sending: false} : m));
             return;
        }
        if (data.sender_id === sellerId) return;


        const newMessage = {
          id: data.message_id || `ws_${Date.now()}`,
          thread_id: data.thread_id,
          message: data.message,
          sender_id: data.sender_id,
          sender_type: data.sender_type,
          created_at: data.timestamp || new Date().toISOString(),
          is_read_by_seller: true, // Seller is viewing this thread
        };

        setMessages(prev => {
          const exists = prev.some(msg => msg.id === newMessage.id);
          return exists ? prev : [...prev, newMessage].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        });
        messagesCacheRef.current.set(data.thread_id, messages); // Update cache

        // Update thread's last message in the list, but don't increment unread_count as we are "in" the thread
        setThreads(prevThreads =>
          prevThreads.map(t =>
            t.id === data.thread_id
              ? { ...t, last_message: newMessage.message, updated_at: newMessage.created_at }
              : t
          )
        );
        // No UI notification as user is actively in this chat
        break;
      case WS_MESSAGE_TYPES.TYPING:
        if (data.sender_type === 'buyer') {
          setIsTyping(data.is_typing);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          if (data.is_typing) {
            typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
          }
        }
        break;
      default:
        console.log(`[useChat] CHAT (${connectionKey}) unhandled message type:`, data.type);
    }
  }, [selectedThread, sellerId, messages]);

  const handleGlobalSellerMessage = useCallback((data, connectionKey) => {
    // This handler is for messages from the seller's global notification channel
    console.log(`[useChat] GLOBAL (${connectionKey}) message:`, data);

    switch (data.type) {
      case WS_MESSAGE_TYPES.NEW_CHAT_THREAD:
        // A buyer started a new chat with this seller
        const newThreadData = {
          id: data.thread_id,
          buyer_id: data.buyer_id,
          seller_id: sellerId, // Should be this seller
          // Assuming backend sends some initial thread info like buyer details, last_message placeholder
          buyer_name: data.buyer_name || `Покупатель ${data.buyer_id.substring(0, 4)}`,
          last_message: data.initial_message || "Новый чат создан",
          updated_at: data.timestamp || new Date().toISOString(),
          unread_count: data.initial_message ? 1 : 0, // If there's an initial message
        };
        setThreads(prev => {
          if (prev.some(t => t.id === newThreadData.id)) return prev;
          return [newThreadData, ...prev]; // Add to top
        });
        showUINotification(
          'Новый чат!',
          `${newThreadData.buyer_name} начал(а) новый чат.`,
          newThreadData.id
        );
        break;

      case WS_MESSAGE_TYPES.NEW_CHAT_MESSAGE:
        // A new message arrived in one of the seller's threads
        // This is crucial for updating threads list (unread count, last message)
        // And for showing notifications if the thread is not currently selected
        setThreads(prevThreads =>
          prevThreads.map(t =>
            t.id === data.thread_id
              ? {
                  ...t,
                  last_message: data.message_preview || data.message || t.last_message,
                  updated_at: data.timestamp || new Date().toISOString(),
                  unread_count: (selectedThread?.id === data.thread_id && chatChannelStatus === WS_STATES.OPEN)
                                ? t.unread_count // Don't increment if user is viewing and connected to this chat
                                : (t.unread_count || 0) + 1,
                }
              : t
          )
        );
        // Add to message cache if not selected thread
        if (selectedThread?.id !== data.thread_id) {
            const cachedMsgs = messagesCacheRef.current.get(data.thread_id) || [];
            const globalMsgExists = cachedMsgs.some(m => m.id === data.message_id);
            if (!globalMsgExists) {
                 const globalNewMsg = {
                    id: data.message_id,
                    thread_id: data.thread_id,
                    message: data.message || data.message_preview, // Full message might not be sent globally
                    sender_id: data.sender_id,
                    sender_type: 'buyer', // Assuming global new_chat_message is for buyer's messages
                    created_at: data.timestamp || new Date().toISOString(),
                 };
                 messagesCacheRef.current.set(data.thread_id, [...cachedMsgs, globalNewMsg].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
            }
        }


        if (selectedThread?.id !== data.thread_id) {
          const relevantThread = threads.find(t => t.id === data.thread_id);
          showUINotification(
            `Новое сообщение от ${relevantThread?.buyer_name || 'Покупатель'}`,
            data.message_preview || data.message,
            data.thread_id
          );
        }
        break;

      case WS_MESSAGE_TYPES.NEW_ORDER: // Example of another global notification
        notifyInfo("Новый заказ!", `Получен новый заказ: ${data.order_id}`);
        // Potentially fetch updated orders list or specific order
        break;

      default:
        console.log(`[useChat] GLOBAL (${connectionKey}) unhandled message type:`, data.type);
    }
  }, [sellerId, threads, selectedThread, chatChannelStatus, showUINotification, notifyInfo]);


  // --- WebSocket Connection Management ---

  // Connect to Global Seller Notification Channel
  useEffect(() => {
    if (!sellerId) return;

    const connectionKey = sellerId; // Global channel is keyed by sellerId
    console.log(`[useChat] Attempting to connect to Global Seller Channel for seller: ${sellerId}`);
    websocketManager.addMessageHandler(connectionKey, handleGlobalSellerMessage);
    websocketManager.connectGlobalSellerChannel(sellerId, (status, key) => {
      if (key === connectionKey) { // Ensure status is for this connection
        setGlobalChannelStatus(status);
        console.log(`[useChat] Global Seller Channel (${key}) status: ${status === WS_STATES.OPEN ? 'OPEN' : 'CLOSED/OTHER'}`);
         if (status === WS_STATES.OPEN) notifyInfo("Подключено к каналу уведомлений.");
         // else if (status === WS_STATES.CLOSED) notifyError("Отключено от канала уведомлений.");
      }
    });

    return () => {
      console.log(`[useChat] Disconnecting from Global Seller Channel: ${connectionKey}`);
      websocketManager.removeMessageHandler(connectionKey, handleGlobalSellerMessage);
      websocketManager.disconnect(connectionKey);
    };
  }, [sellerId, handleGlobalSellerMessage, notifyInfo, notifyError]);


  // --- Actions ---

  const loadThreads = useCallback(async () => {
    if (!sellerId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getSellerChats(sellerId);
      setThreads(response.data || []);
    } catch (err) {
      console.error('Failed to load threads:', err);
      setError('Ошибка загрузки чатов.');
      notifyError('Ошибка загрузки чатов.');
    } finally {
      setLoading(false);
    }
  }, [sellerId, notifyError]);

  useEffect(() => {
    if (sellerId) {
      loadThreads();
    }
  }, [sellerId, loadThreads]);

  const loadMessagesForThread = useCallback(async (threadId) => {
    if (!threadId) return [];
    const cached = messagesCacheRef.current.get(threadId);
    if (cached) return cached;

    setMessagesLoading(true);
    try {
      const response = await apiService.getChatMessages(threadId);
      const messagesData = response.data || [];
      messagesCacheRef.current.set(threadId, messagesData);
      return messagesData;
    } catch (err) {
      console.error('Failed to load messages for thread:', threadId, err);
      setError(`Ошибка загрузки сообщений для треда ${threadId}.`);
      notifyError(`Ошибка загрузки сообщений.`);
      return [];
    } finally {
      setMessagesLoading(false);
    }
  }, [notifyError]);

  const selectThread = useCallback(async (thread) => {
    if (!sellerId) return;

    // Disconnect from previously selected thread's chat channel
    if (selectedThread?.id && selectedThread.id !== thread?.id) {
      console.log(`[useChat] Disconnecting from chat channel: ${selectedThread.id}`);
      websocketManager.removeMessageHandler(selectedThread.id, handleChatChannelMessage);
      websocketManager.disconnect(selectedThread.id);
      setChatChannelStatus(WS_STATES.CLOSED);
    }

    setIsTyping(false); // Reset typing indicator

    if (!thread) {
      setSelectedThread(null);
      setMessages([]);
      return;
    }

    setSelectedThread(thread);
    const currentMessages = await loadMessagesForThread(thread.id);
    setMessages(currentMessages);

    // Connect to the new thread's specific chat channel
    const chatConnectionKey = thread.id;
    console.log(`[useChat] Attempting to connect to Chat Channel: ${chatConnectionKey}`);
    websocketManager.addMessageHandler(chatConnectionKey, handleChatChannelMessage);
    websocketManager.connectChatChannel(thread.id, sellerId, 'seller', (status, key) => {
       if (key === chatConnectionKey) { // Ensure status is for THIS connection
            setChatChannelStatus(status);
            console.log(`[useChat] Chat Channel (${key}) status: ${status === WS_STATES.OPEN ? 'OPEN' : 'CLOSED/OTHER'}`);
            if (status === WS_STATES.OPEN && thread.unread_count > 0) {
                 // Mark messages as read if connection is successful and there are unread messages
                apiService.markMessagesAsRead(thread.id, sellerId, 'seller')
                .then(() => {
                    setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unread_count: 0 } : t));
                })
                .catch(err => console.error('Failed to mark messages as read:', err));
            }
       }
    });

    // If there were unread messages and we are not connected yet, mark them optimistically or wait for connection
     if (thread.unread_count > 0 && chatChannelStatus !== WS_STATES.OPEN) {
        try {
            await apiService.markMessagesAsRead(thread.id, sellerId, 'seller');
            setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unread_count: 0 } : t));
        } catch (err) {
            console.error('Failed to mark messages as read on select (pre-connect):', err);
        }
    }

  }, [sellerId, selectedThread, handleChatChannelMessage, loadMessagesForThread, chatChannelStatus]);

  const sendMessage = useCallback(async (messageText) => {
    if (!sellerId || !selectedThread?.id || !messageText.trim()) return false;

    const tempId = `temp_${Date.now()}`;
    const messagePayload = {
      id: tempId, // Temporary ID for local display
      thread_id: selectedThread.id,
      message: messageText.trim(),
      seller_id: sellerId, // API expects seller_id for messages from seller
      buyer_id: null,      // And null for buyer_id
      created_at: new Date().toISOString(),
      is_read_by_seller: true,
      is_read_by_buyer: false, // Will be updated by backend/buyer
      sending: true,
    };

    setMessages(prev => [...prev, messagePayload]);
    messagesCacheRef.current.set(selectedThread.id, messages); // Update cache

    try {
      // API call sends the message, backend handles WebSocket broadcast to chat participants
      const response = await apiService.sendMessage({
        id: tempId, // Send tempId to backend for it to use or replace
        thread_id: messagePayload.thread_id,
        message: messagePayload.message,
        seller_id: messagePayload.seller_id,
      });

      const confirmedMessage = response.data; // Backend should return the confirmed message

      // Update local message with confirmed data from backend (e.g., actual ID, confirmed timestamp)
      setMessages(prev => prev.map(m => (m.id === tempId ? { ...confirmedMessage, sending: false } : m)));
      messagesCacheRef.current.set(selectedThread.id, messages); // Update cache again

      // Update thread list with last message
       setThreads(prevThreads =>
        prevThreads.map(t =>
          t.id === selectedThread.id
            ? { ...t, last_message: confirmedMessage.message, updated_at: confirmedMessage.created_at }
            : t
        )
      );
      return true;
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Ошибка отправки сообщения.');
      notifyError('Ошибка отправки сообщения.');
      setMessages(prev => prev.filter(m => m.id !== tempId)); // Remove temp message on failure
      messagesCacheRef.current.set(selectedThread.id, messages); // Update cache
      return false;
    }
  }, [selectedThread, sellerId, notifyError, messages]);

  const sendTypingIndicator = useCallback((isTypingStatus) => {
    if (!selectedThread?.id || chatChannelStatus !== WS_STATES.OPEN) return;
    websocketManager.sendTypingIndicator(selectedThread.id, isTypingStatus);
  }, [selectedThread, chatChannelStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Disconnect from selected chat channel if any
      if (selectedThread?.id) {
        websocketManager.removeMessageHandler(selectedThread.id, handleChatChannelMessage);
        websocketManager.disconnect(selectedThread.id);
      }
      // Global channel disconnection is handled by its own useEffect when sellerId changes/unmounts
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // websocketManager.cleanup(); // This would disconnect ALL channels, including global for other hooks/parts if any
    };
  }, [selectedThread, handleChatChannelMessage]); // Rerun if selectedThread changes to disconnect old

  return {
    threads,
    selectedThread,
    messages,
    loading,
    messagesLoading,
    error,
    isChatConnected: chatChannelStatus === WS_STATES.OPEN,
    isGlobalConnected: globalChannelStatus === WS_STATES.OPEN,
    isTyping,
    sellerId,
    selectThread,
    sendMessage,
    sendTypingIndicator,
    refreshThreads: loadThreads,
    clearError: () => setError(null),
  };
};
