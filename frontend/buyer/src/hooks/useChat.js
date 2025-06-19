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

  // Forward declaration for selectThread to be used in useEffect
  const selectThreadRef = useRef();

  const loadThreadsInternal = useCallback(async (dbBuyerId) => { // Renamed param for clarity
    if (!dbBuyerId) {
      console.log("[useChat] loadThreadsInternal: No dbBuyerId provided");
      return { loadedThreads: [], error: "Buyer DB ID not available for loading threads." };
    }
    setLoadingThreads(true);
    setError(null);
    try {
      const response = await apiService.getBuyerChats(dbBuyerId, 0, 50);
      const loadedThreads = response.data || [];
      setThreads(loadedThreads);
      return { loadedThreads, error: null };
    } catch (err) {
      console.error("Error loading threads:", err);
      const errMsg = err.message || 'Failed to load chat threads.';
      setError(errMsg);
      return { loadedThreads: [], error: errMsg };
    } finally {
      setLoadingThreads(false);
    }
  }, []);

  // Effect to load threads and handle initialTargetSellerId, and set chat service readiness
  // This is the MAIN effect that reacts to buyerProfile changes.
  useEffect(() => {
    const rawBuyerIdFromProfile = buyerProfile?.id; // Changed from buyerProfile?.data?.id

    let validDBBuyerId = null;
    if (rawBuyerIdFromProfile && typeof rawBuyerIdFromProfile === 'string' && rawBuyerIdFromProfile !== "undefined") {
      validDBBuyerId = rawBuyerIdFromProfile;
    } else if (rawBuyerIdFromProfile === "undefined") {
      // This condition might be less likely now if buyerProfile.id is directly from DB and not a string "undefined"
      console.warn('[useChat] buyerProfile.id is the literal string "undefined". Treating as invalid.');
    }

    setBuyerId(validDBBuyerId); // Set the internal buyerId state for other functions to use

    // Updated log to reflect source
    console.log(`[useChat Main Effect] Processed buyerProfile.id (raw): '${rawBuyerIdFromProfile}', Validated DB BuyerId: '${validDBBuyerId}', initialTargetSellerId: '${initialTargetSellerId}'`);

    if (validDBBuyerId) {
      if (initialTargetSellerId) {
        // ProductChat context
        console.log(`[useChat DEBUG] ProductChat context: Valid DB buyerId ('${validDBBuyerId}') available. Setting isChatServiceReady = true.`);
        setIsChatServiceReady(true);
        // Load all threads in background.
        // Its success/failure or timing doesn't block ProductChat's initial readiness.
        loadThreadsInternal(validDBBuyerId).then(({ loadedThreads, error: loadError }) => {
          console.log(`[useChat DEBUG] ProductChat context: loadThreadsInternal completed. Error: ${loadError}, Loaded Threads: ${loadedThreads?.length}`);
          if (loadError) {
            console.error(`[useChat] Error loading threads in background for ProductChat context: ${loadError}`);
            return;
          }
          if (loadedThreads) {
              const existingThread = loadedThreads.find(t => t.seller_id === initialTargetSellerId);
              if (existingThread && selectThreadRef.current) {
                  console.log(`[useChat DEBUG] ProductChat context: Existing thread found, selecting threadId: ${existingThread.id}`);
                  selectThreadRef.current(existingThread.id);
              } else if (!existingThread) {
                  console.log(`[useChat DEBUG] ProductChat context: No existing thread for seller. Setting currentThreadSellerId: ${initialTargetSellerId}`);
                  setCurrentThreadSellerId(initialTargetSellerId);
                  setSelectedThreadId(null);
                  setMessages([]);
                  setIsConnected(false);
              }
          }
        });
      } else {
        // General chat context: Wait for all threads to load.
        console.log(`[useChat DEBUG] General Chat context: Valid DB buyerId ('${validDBBuyerId}') available. Waiting for loadThreadsInternal.`);
        loadThreadsInternal(validDBBuyerId).then(({ error: loadError }) => {
          console.log(`[useChat DEBUG] General context: loadThreadsInternal completed. Error: ${loadError}. Setting isChatServiceReady = true.`);
          setIsChatServiceReady(true);
          if (loadError) {
            console.warn(`[useChat DEBUG] General context: Error loading threads, but service is marked ready: ${loadError}`);
          }
        });
      }
    } else {
      console.log(`[useChat DEBUG] No valid DB buyerId from buyerProfile. Resetting states. Setting isChatServiceReady = false.`);
      setThreads([]);
      setSelectedThreadId(null);
      setCurrentThreadSellerId(null);
      setMessages([]);
      setIsConnected(false);
      setIsChatServiceReady(false);
    }
  // Add buyerProfile directly to dependencies.
  // initialTargetSellerId is from options, stable. loadThreadsInternal is useCallback.
  }, [buyerProfile, initialTargetSellerId, loadThreadsInternal]);


  const handleWebSocketMessageInternal = useCallback((data, wsThreadId) => {
    const currentDBBuyerId = buyerId; // Use state variable which is set from buyerProfile.id
    console.log(`[useChat] WebSocket message received for thread ${wsThreadId}:`, data);

    if (wsThreadId === selectedThreadRef.current) {
      switch (data.type) {
        case WS_MESSAGE_TYPES.MESSAGE:
          setMessages(prev => {
            const messageExists = prev.some(msg => msg.id === data.message.id || (msg._optimisticId && msg._optimisticId === data.message._optimisticId));
            if (messageExists) {
              return prev.map(msg => (msg.id === data.message.id || (msg._optimisticId && msg._optimisticId === data.message._optimisticId)) ? { ...data.message, _optimistic: false } : msg);
            }
            return [...prev, data.message];
          });
          if (data.message.sender_id !== currentDBBuyerId) {
            setThreads(prevThreads =>
              prevThreads.map(t =>
                t.id === wsThreadId ? { ...t, unread_messages_count: (t.unread_messages_count || 0) + 1 } : t
              )
            );
            if (document.hasFocus() && selectedThreadRef.current === wsThreadId) {
                apiService.markMessagesAsRead(wsThreadId, currentDBBuyerId, 'buyer').catch(err => console.error("Failed to mark messages as read on incoming WS message:", err));
                 setThreads(prev => prev.map(t => t.id === wsThreadId ? {...t, unread_messages_count: 0} : t));
            }
          }
          break;
        case WS_MESSAGE_TYPES.TYPING:
          setTypingUsers(prev => {
            const isUserTyping = data.user_id && data.user_id !== currentDBBuyerId;
            if (isUserTyping) {
              return data.is_typing ? [...new Set([...prev, data.user_id])] : prev.filter(id => id !== data.user_id);
            }
            return prev;
          });
          break;
        default:
          console.log(`[useChat] Unhandled WS message type for selected thread: ${data.type}`);
      }
    } else if (data.type === WS_MESSAGE_TYPES.MESSAGE && data.message.sender_id !== currentDBBuyerId) {
        setThreads(prevThreads => {
            const threadExistsInList = prevThreads.some(t => t.id === wsThreadId);
            if (threadExistsInList) {
                return prevThreads.map(t =>
                    t.id === wsThreadId
                    ? { ...t, last_message: data.message.content, last_message_at: data.message.created_at, unread_messages_count: (t.unread_messages_count || 0) + 1 }
                    : t
                );
            } else {
                console.log(`[useChat] Received message for unlisted or new thread ${wsThreadId}. Consider refreshing threads.`);
                return prevThreads;
            }
        });
    }

    if (data.type === WS_MESSAGE_TYPES.MESSAGE) {
        setThreads(prevThreads =>
            prevThreads.map(t =>
            t.id === wsThreadId
                ? { ...t, last_message: data.message.content, last_message_at: data.message.created_at }
                : t
            )
        );
    }
  }, [buyerId]); // buyerId state is used here

  const selectThreadActual = useCallback(async (threadIdToSelect) => {
    const currentDBBuyerId = buyerId; // Use the state buyerId, which is set from buyerProfile.id
    if (!isChatServiceReady || !currentDBBuyerId) {
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
