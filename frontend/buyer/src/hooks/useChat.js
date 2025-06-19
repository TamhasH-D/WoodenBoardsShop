import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import websocketManager, { WS_MESSAGE_TYPES } from '../utils/websocketManager';
import { generateEntityUUID, ENTITY_TYPES } from '../utils/uuid';

export const useChat = (options = {}) => {
  const { initialTargetSellerId = null, productContext = null } = options;

  const { user, buyerProfile } = useAuth();
  const [buyerId, setBuyerId] = useState(null); // This will strictly be the Database ID
  const [isChatServiceReady, setIsChatServiceReady] = useState(false);

  const [threads, setThreads] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [currentThreadSellerId, setCurrentThreadSellerId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isCreatingThread, setIsCreatingThread] = useState(false);

  const selectedThreadRef = useRef(null);
  selectedThreadRef.current = selectedThreadId;

  useEffect(() => {
    if (buyerProfile?.id) {
      setBuyerId(buyerProfile.id);
      // setIsChatServiceReady will be set after initial threads load attempt
    } else {
      setBuyerId(null);
      setIsChatServiceReady(false); // Not ready if no DB ID
    }
  }, [buyerProfile]);

  // Forward declaration for selectThread to be used in useEffect
  const selectThreadRef = useRef();

  const loadThreadsInternal = useCallback(async (currentBuyerId) => {
    if (!currentBuyerId) {
      console.log("loadThreadsInternal: No currentBuyerId provided");
      return { loadedThreads: [], error: "Buyer ID not available." };
    }
    setLoadingThreads(true);
    setError(null);
    try {
      const response = await apiService.getBuyerChats(currentBuyerId, 0, 50);
      const loadedThreads = response.data || [];
      setThreads(loadedThreads);
      return { loadedThreads, error: null };
    } catch (err) {
      console.error("Error loading threads:", err);
      const errMsg = err.message || 'Failed to load chat threads.';
      setError(errMsg); // Set error state for the hook
      return { loadedThreads: [], error: errMsg };
    } finally {
      setLoadingThreads(false);
    }
  }, []);

  // Effect to load threads and handle initialTargetSellerId, and set chat service readiness
  useEffect(() => {
    console.log('[useChat Main Effect] buyerId:', buyerId, 'initialTargetSellerId:', initialTargetSellerId);
    if (buyerId) { // buyerId is DB ID
      if (initialTargetSellerId) {
        // ProductChat context: Ready once buyerId is known.
        // Load all threads in background, not critical for ProductChat's initial send readiness.
        console.log('[useChat Main Effect] ProductChat context: buyerId available, setting isChatServiceReady to true.');
        setIsChatServiceReady(true);
        loadThreadsInternal(buyerId).then(({ loadedThreads, error: loadError }) => {
          console.log('[useChat Main Effect] ProductChat context: loadThreadsInternal completed. Error:', loadError, 'Loaded Threads:', loadedThreads?.length);
          if (!loadError && loadedThreads) {
            const existingThread = loadedThreads.find(t => t.seller_id === initialTargetSellerId);
            if (existingThread && selectThreadRef.current) {
              console.log('[useChat Main Effect] ProductChat context: Existing thread found, selecting threadId:', existingThread.id);
              selectThreadRef.current(existingThread.id);
            } else if (!existingThread) {
              console.log('[useChat Main Effect] ProductChat context: No existing thread for seller. Setting currentThreadSellerId.');
              // This case is for when ProductChat loads, there's a sellerId, but no existing chat.
              // We've already set isChatServiceReady=true.
              // We set currentThreadSellerId so sendMessage knows who to create chat with.
              setCurrentThreadSellerId(initialTargetSellerId);
              setSelectedThreadId(null);
              setMessages([]); // Ensure no messages from a previous context linger
              setIsConnected(false); // Ensure not marked as connected to a previous thread
            }
          } else if (loadError) {
            // Error is set by loadThreadsInternal. isChatServiceReady is already true.
            // ProductChat can still attempt to send; sendMessage will handle thread creation or re-throw.
            console.warn(`[useChat Main Effect] ProductChat context: Error loading threads, but service is marked ready for seller ${initialTargetSellerId}: ${loadError}`);
          }
        });
      } else {
        // General chat context (e.g., ChatsPage): Wait for all threads to load before service is fully ready.
        console.log('[useChat Main Effect] General context: buyerId available. Loading threads then setting ready.');
        loadThreadsInternal(buyerId).then(({ error: loadError }) => {
          console.log('[useChat Main Effect] General context: loadThreadsInternal completed. Error:', loadError);
          setIsChatServiceReady(true); // Ready after attempt, error (if any) will be in hook's error state.
          if (loadError) {
            console.warn(`[useChat Main Effect] General context: Error loading threads, but service is marked ready: ${loadError}`);
          }
          // No specific thread to select here unless further logic is added for default selection.
        });
      }
    } else {
      console.log('[useChat Main Effect] No buyerId. Resetting states and setting service not ready.');
      // Not yet ready if buyerId (DB ID) is not available.
      // Reset threads and other states if buyerId is lost (e.g., profile unloaded or error in profile fetch)
      setThreads([]);
      setSelectedThreadId(null);
      setCurrentThreadSellerId(null);
      setMessages([]);
      setIsConnected(false);
      setIsChatServiceReady(false);
    }
  }, [buyerId, initialTargetSellerId, loadThreadsInternal]);


  const handleWebSocketMessageInternal = useCallback((data, wsThreadId) => {
    console.log(`[useChat] WebSocket message received for thread ${wsThreadId}:`, data);

    if (wsThreadId === selectedThreadRef.current) { // Check against the ref for current selected thread
      switch (data.type) {
        case WS_MESSAGE_TYPES.MESSAGE:
          setMessages(prev => {
            const messageExists = prev.some(msg => msg.id === data.message.id || (msg._optimisticId && msg._optimisticId === data.message._optimisticId));
            if (messageExists) {
              return prev.map(msg => (msg.id === data.message.id || (msg._optimisticId && msg._optimisticId === data.message._optimisticId)) ? { ...data.message, _optimistic: false } : msg);
            }
            return [...prev, data.message];
          });
          if (data.message.sender_id !== buyerId) { // If message from other user in selected thread
            setThreads(prevThreads =>
              prevThreads.map(t =>
                t.id === wsThreadId ? { ...t, unread_messages_count: (t.unread_messages_count || 0) + 1 } : t
              )
            );
            // Potentially call markMessagesAsRead here if window is focused
            if (document.hasFocus() && selectedThreadRef.current === wsThreadId) {
                apiService.markMessagesAsRead(wsThreadId, buyerId, 'buyer').catch(err => console.error("Failed to mark messages as read on incoming WS message:", err));
                 setThreads(prev => prev.map(t => t.id === wsThreadId ? {...t, unread_messages_count: 0} : t));
            }
          }
          break;
        case WS_MESSAGE_TYPES.TYPING:
          setTypingUsers(prev => {
            const isUserTyping = data.user_id && data.user_id !== buyerId;
            if (isUserTyping) {
              return data.is_typing ? [...new Set([...prev, data.user_id])] : prev.filter(id => id !== data.user_id);
            }
            return prev;
          });
          break;
        default:
          console.log(`[useChat] Unhandled WS message type for selected thread: ${data.type}`);
      }
    } else if (data.type === WS_MESSAGE_TYPES.MESSAGE && data.message.sender_id !== buyerId) {
        // New message for a non-selected thread
        setThreads(prevThreads => {
            const threadExistsInList = prevThreads.some(t => t.id === wsThreadId);
            if (threadExistsInList) {
                return prevThreads.map(t =>
                    t.id === wsThreadId
                    ? { ...t, last_message: data.message.content, last_message_at: data.message.created_at, unread_messages_count: (t.unread_messages_count || 0) + 1 }
                    : t
                );
            } else {
                // If thread is not in the list, it might be a new chat initiated by the other party.
                // Consider fetching the new thread details or refreshing the threads list.
                // For now, just log it. A full refresh might be better.
                console.log(`[useChat] Received message for unlisted or new thread ${wsThreadId}. Consider refreshing threads.`);
                // Or, optimistically add a shell of the thread if enough info is in the message.
                // This part depends on how robust you want the real-time update of the thread list to be.
                // For simplicity, we might just rely on a periodic refresh or user action to update the thread list for brand new external threads.
                return prevThreads;
            }
        });
    }

    // Generic update for last message on any relevant thread, selected or not
    if (data.type === WS_MESSAGE_TYPES.MESSAGE) {
        setThreads(prevThreads =>
            prevThreads.map(t =>
            t.id === wsThreadId
                ? { ...t, last_message: data.message.content, last_message_at: data.message.created_at }
                : t
            )
        );
    }
  }, [buyerId]);

  const selectThreadActual = useCallback(async (threadIdToSelect) => {
    if (!isChatServiceReady || !buyerId) { // Guard with isChatServiceReady
      const errMsg = "Chat service not ready or Buyer DB ID not available for selecting thread.";
      setError(errMsg);
      return { success: false, error: errMsg };
    }

    if (selectedThreadId === threadIdToSelect && isConnected) {
        try { // Still try to mark as read, in case of background updates
            await apiService.markMessagesAsRead(threadIdToSelect, buyerId, 'buyer');
            setThreads(prev => prev.map(t => t.id === threadIdToSelect ? {...t, unread_messages_count: 0} : t));
        } catch (readErr) { console.error("Error marking messages as read on re-select:", readErr); }
        return { success: true, threadId: threadIdToSelect };
    }

    console.log(`[useChat] Selecting thread: ${threadIdToSelect}`);

    if (selectedThreadId && selectedThreadId !== threadIdToSelect) {
      websocketManager.disconnect(selectedThreadId);
      websocketManager.removeMessageHandler(selectedThreadId, handleWebSocketMessageInternal);
    }

    setSelectedThreadId(threadIdToSelect);
    const currentThread = threads.find(t => t.id === threadIdToSelect);
    setCurrentThreadSellerId(currentThread ? currentThread.seller_id : null);

    setMessages([]);
    setTypingUsers([]);
    setLoadingMessages(true);
    setError(null);

    try {
      const messagesResponse = await apiService.getChatMessages(threadIdToSelect, 0, 50);
      setMessages(messagesResponse.data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) || []);
      
      await apiService.markMessagesAsRead(threadIdToSelect, buyerId, 'buyer');
      setThreads(prev => prev.map(t => t.id === threadIdToSelect ? {...t, unread_messages_count: 0} : t));

      websocketManager.addMessageHandler(threadIdToSelect, handleWebSocketMessageInternal);
      const connectedStatus = websocketManager.connect(threadIdToSelect, buyerId, 'buyer', (status) => {
        setIsConnected(status);
        if (!status && selectedThreadRef.current === threadIdToSelect) { // Check ref here
          console.warn(`[useChat] WebSocket disconnected for currently selected thread ${threadIdToSelect}`);
        }
      });
      setIsConnected(connectedStatus);
      return { success: true, threadId: threadIdToSelect };
    } catch (err) {
      console.error(`Error selecting thread ${threadIdToSelect}:`, err);
      setError(err.message || `Failed to load chat for thread ${threadIdToSelect}.`);
      setIsConnected(false);
      if(selectedThreadRef.current === threadIdToSelect) setSelectedThreadId(null); // Clear selected thread on error only if it's the one that failed
      setCurrentThreadSellerId(null);
      return { success: false, error: err.message || `Failed to load chat for thread ${threadIdToSelect}.` };
    } finally {
      setLoadingMessages(false);
    }
  }, [buyerId, selectedThreadId, threads, isConnected, handleWebSocketMessageInternal]);

  useEffect(() => {
    selectThreadRef.current = selectThreadActual;
  }, [selectThreadActual]);


  const sendMessage = useCallback(async (messageText, targetSellerId = null) => {
    if (!isChatServiceReady || !buyerId) { // Guard with isChatServiceReady
      const errMsg = "Chat service not ready or Buyer DB ID not available for sending message.";
      setError(errMsg);
      throw new Error(errMsg);
    }
    if (!messageText.trim()) {
      // Optionally, you could throw an error or just return if the message is empty.
      // For now, just returning as the button should ideally be disabled for empty messages.
      return;
    }

    let threadToUse = selectedThreadId;
    let sellerForThreadContext = currentThreadSellerId || targetSellerId;

    if (!threadToUse && sellerForThreadContext) {
      const existingThread = threads.find(t => t.seller_id === sellerForThreadContext && t.buyer_id === buyerId);
      if (existingThread) {
        threadToUse = existingThread.id;
        const selectionResult = await selectThreadActual(threadToUse);
        if (!selectionResult.success) {
          throw new Error(selectionResult.error || "Failed to select existing thread before sending.");
        }
      } else {
        if (!sellerForThreadContext) {
          const errMsg = "Cannot start new chat: Target Seller ID not provided.";
          setError(errMsg);
          throw new Error(errMsg);
        }
        setIsCreatingThread(true);
        try {
          console.log(`[useChat] Creating new thread with seller ${sellerForThreadContext}`);
          const newThreadData = await apiService.startChatWithSeller(buyerId, sellerForThreadContext);
          if (newThreadData && newThreadData.id) {
            threadToUse = newThreadData.id;
            // Add to threads list *before* selecting, so selectThreadActual can find it
            setThreads(prev => [newThreadData, ...prev.filter(t => t.id !== newThreadData.id)]);
            const selectionResult = await selectThreadActual(threadToUse); // This will connect WS, load messages etc.
            if (!selectionResult.success) {
              throw new Error(selectionResult.error || "Failed to select newly created thread.");
            }
          } else {
            throw new Error("Failed to create or retrieve new thread from API.");
          }
        } catch (err) {
          console.error("Error creating new thread:", err);
          setError(err.message || "Failed to start new chat.");
          setIsCreatingThread(false);
          throw err; // Re-throw for the component to handle
        } finally {
          setIsCreatingThread(false);
        }
      }
    } else if (!threadToUse && !sellerForThreadContext) {
       const errMsg = "Cannot send message: No active thread and no target seller specified.";
       setError(errMsg);
       throw new Error(errMsg);
    }

    if (!threadToUse) {
      const errMsg = "Cannot send message: Thread ID could not be established.";
      setError(errMsg);
      throw new Error(errMsg);
    }

    const optimisticMessageId = generateEntityUUID(null, ENTITY_TYPES.CHAT_MESSAGE);
    const optimisticMessage = {
      id: optimisticMessageId,
      _optimisticId: optimisticMessageId,
      thread_id: threadToUse,
      sender_id: buyerId,
      sender_type: 'buyer',
      content: messageText,
      created_at: new Date().toISOString(),
      is_read_by_buyer: true,
      is_read_by_seller: false,
      // _optimistic: true, // UI can use this to show pending state
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const response = await apiService.sendMessage({
        id: optimisticMessageId,
        thread_id: threadToUse,
        sender_id: buyerId,
        sender_type: 'buyer',
        content: messageText,
      });

      if (response.success && response.data) {
        setMessages(prev => prev.map(msg => msg.id === optimisticMessageId ? { ...response.data, _optimistic: false } : msg));
        setThreads(prevThreads =>
          prevThreads.map(t =>
            t.id === threadToUse
              ? { ...t, last_message: response.data.content, last_message_at: response.data.created_at, unread_messages_count: 0 }
              : t
          )
        );
      } else {
        throw new Error(response.error || 'Failed to send message via API');
      }
    } catch (err) {
      console.error("Error sending message via API:", err);
      setError(err.message || 'Failed to send message.');
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessageId));
      throw err; // Re-throw for the component to handle
    }
  }, [buyerId, selectedThreadId, currentThreadSellerId, threads, selectThreadActual, handleWebSocketMessageInternal]);


  const sendTypingIndicatorActual = useCallback((isTyping) => {
    if (!selectedThreadId || !isConnected || !buyerId) return;
    websocketManager.sendTypingIndicator(selectedThreadId, isTyping, buyerId, 'buyer');
  }, [selectedThreadId, isConnected, buyerId]);


  useEffect(() => {
    const threadToClean = selectedThreadRef.current;
    return () => {
      if (threadToClean) {
        console.log(`[useChat] Cleaning up WebSocket for thread ${threadToClean} on unmount or thread change.`);
        websocketManager.disconnect(threadToClean);
        websocketManager.removeMessageHandler(threadToClean, handleWebSocketMessageInternal);
      }
    };
  }, [selectedThreadId, handleWebSocketMessageInternal]);

  return {
    threads,
    selectedThreadId,
    selectedThread: threads.find(t => t.id === selectedThreadId),
    messages,
    loadingThreads,
    loadingMessages,
    isCreatingThread,
    error,
    isConnected,
    typingUsers,
    buyerId, // This is now guaranteed to be the DB ID if set
    isChatServiceReady, // Expose readiness state
    loadThreads: () => { // Guard this public method as well
      if (!isChatServiceReady || !buyerId) {
        console.warn("loadThreads called before chat service is ready or buyerId is available.");
        return Promise.resolve({ loadedThreads: [], error: "Chat service not ready." });
      }
      return loadThreadsInternal(buyerId);
    },
    selectThread: selectThreadActual,
    sendMessage,
    sendTypingIndicator: sendTypingIndicatorActual,
    hasExistingChatWithSeller: useCallback((sellerIdToCheck) => {
      if (!isChatServiceReady || !threads || !sellerIdToCheck || !buyerId) return false;
      return threads.some(t => t.seller_id === sellerIdToCheck && t.buyer_id === buyerId);
    }, [threads, buyerId, isChatServiceReady]),
    productContext,
  };
};
