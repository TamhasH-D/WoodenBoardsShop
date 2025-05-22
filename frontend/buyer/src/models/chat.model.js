/**
 * Chat models based on the API documentation
 */

/**
 * Transforms raw chat thread data from the API to a format usable by the frontend
 * @param {Object} data - Raw chat thread data from the API
 * @returns {Object} - Transformed chat thread data
 */
export const transformChatThreadData = (data) => {
  if (!data) return null;
  
  return {
    id: data.id,
    buyerId: data.buyer_id,
    sellerId: data.seller_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

/**
 * Transforms frontend chat thread data to the format expected by the API
 * @param {Object} thread - Frontend chat thread data
 * @returns {Object} - Chat thread data formatted for the API
 */
export const transformChatThreadForApi = (thread) => {
  return {
    id: thread.id,
    buyer_id: thread.buyerId,
    seller_id: thread.sellerId,
  };
};

/**
 * Transforms raw chat message data from the API to a format usable by the frontend
 * @param {Object} data - Raw chat message data from the API
 * @returns {Object} - Transformed chat message data
 */
export const transformChatMessageData = (data) => {
  if (!data) return null;
  
  return {
    id: data.id,
    threadId: data.thread_id,
    senderId: data.sender_id,
    content: data.content,
    isRead: data.is_read,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

/**
 * Transforms frontend chat message data to the format expected by the API
 * @param {Object} message - Frontend chat message data
 * @returns {Object} - Chat message data formatted for the API
 */
export const transformChatMessageForApi = (message) => {
  return {
    id: message.id,
    thread_id: message.threadId,
    sender_id: message.senderId,
    content: message.content,
    is_read: message.isRead,
  };
};

/**
 * Transforms a list of chat threads from the API
 * @param {Array} threads - List of chat threads from the API
 * @returns {Array} - Transformed chat thread list
 */
export const transformChatThreadList = (threads) => {
  if (!threads || !Array.isArray(threads)) return [];
  
  return threads.map(thread => transformChatThreadData(thread));
};

/**
 * Transforms a list of chat messages from the API
 * @param {Array} messages - List of chat messages from the API
 * @returns {Array} - Transformed chat message list
 */
export const transformChatMessageList = (messages) => {
  if (!messages || !Array.isArray(messages)) return [];
  
  return messages.map(message => transformChatMessageData(message));
};

/**
 * Default empty chat thread object
 */
export const emptyChatThread = {
  id: '',
  buyerId: '',
  sellerId: '',
};

/**
 * Default empty chat message object
 */
export const emptyChatMessage = {
  id: '',
  threadId: '',
  senderId: '',
  content: '',
  isRead: false,
};
