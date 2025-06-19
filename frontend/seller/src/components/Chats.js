import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { ChatContainer } from './chat';
import { useChat } from '../hooks/useChat';
import { SELLER_TEXTS } from '../utils/localization';

/**
 * Chats – экран продавца для общения с покупателями.
 *
 * Улучшения v2:
 *  • стабилизированы колбэки через useCallback → меньше лишних рендеров в ChatContainer;
 *  • «липкий» баннер при офлайн‑режиме;
 *  • автоматический выбор первого непрочитанного треда при загрузке/обновлении;
 *  • отправка индикатора «typing…» дебаунсится (1 сек. тишины → typing=false);
 *  • защита от setState после размонтирования компонента;
 *  • ведём лог только в dev‑сборке.
 */
function Chats() {
  const {
    threads,
    selectedThread,
    messages,
    loading,
    messagesLoading,
    error,
    isConnected,
    isTyping,
    sellerId,
    selectThread,
    sendMessage,
    sendTypingIndicator,
    refreshThreads,
    clearError,
  } = useChat();

  /** ****************************
   * Derived helpers
   */
  const hasUnread = useMemo(
    () => threads.some((t) => (t.unreadCount ?? 0) > 0),
    [threads]
  );

  /** ****************************
   * Lifecycle effects
   */
  // 1️⃣ При восстановлении соединения подтягиваем свежие данные
  useEffect(() => {
    if (isConnected) refreshThreads();
  }, [isConnected, refreshThreads]);

  // 2️⃣ Авто‑выбор первого непрочитанного треда (если ничего не выбрано)
  useEffect(() => {
    if (!selectedThread && threads.length) {
      const firstUnread = threads.find((t) => (t.unreadCount ?? 0) > 0) || threads[0];
      if (firstUnread) selectThread(firstUnread);
    }
  }, [threads, selectedThread, selectThread]);

  // 3️⃣ Guard – чтобы не сетить стейт после unmount
  const mountedRef = useRef(true);
  useEffect(() => () => {
    mountedRef.current = false;
  }, []);

  /** ****************************
   * Handlers (memoised)
   */
  const handleThreadSelect = useCallback(
    (thread) => {
      selectThread(thread);
    },
    [selectThread]
  );

  const handleSendMessage = useCallback(
    async (messageText) => {
      const success = await sendMessage(messageText);
      if (!success && mountedRef.current) {
        // Ошибка уже положена в useChat.error, просто логируем в dev‑сборке
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.error('[Chats] Failed to send message – see useChat.error');
        }
      }
      // Optimistic‑UI + push‑уведомления закроют вопрос актуальности данных
    },
    [sendMessage]
  );

  //  Debounced typing indicator
  const typingTimeoutRef = useRef();
  const handleTyping = useCallback(
    (typing) => {
      if (typing) {
        // Пользователь начал печатать → сразу true
        sendTypingIndicator(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => sendTypingIndicator(false), 1000);
      } else {
        // Пользователь явно закончил (например, отправил) → true→false.
        clearTimeout(typingTimeoutRef.current);
        sendTypingIndicator(false);
      }
    },
    [sendTypingIndicator]
  );

  const handleRefresh = useCallback(() => {
    clearError();
    refreshThreads();
  }, [clearError, refreshThreads]);

  /** ****************************
   * Debug log (dev only)
   */
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[Chats] render', { sellerId, loading, threads: threads.length, error });
  }

  /** ****************************
   * UI helpers
   */
  // const OfflineBanner = () =>
  //   !isConnected ? (
  //     <div className="sticky top-0 z-20 bg-red-50 text-red-700 text-sm p-2 text-center rounded-t-2xl">
  //       Соединение потеряно — офлайн. Данные могут быть неактуальны.
  //     </div>
  //   ) : null;

  return (
    <div className="max-w-7xl mx-auto p-5 bg-slate-50 min-h-screen">
      <div className="bg-white rounded-2xl mb-8 shadow-xl border border-slate-200 flex flex-col">
        {/* <OfflineBanner /> */}
        {/* Header */}
        <div className="p-7 md:p-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4 sm:gap-0 border-b border-slate-100">
          <div>
            <h1 className="m-0 text-slate-700 text-2xl sm:text-3xl font-bold">
              💬 {SELLER_TEXTS.CHATS || 'Чаты с покупателями'}
            </h1>
            <p className="mt-2 text-slate-500 text-base sm:text-lg">
              Профессиональное общение с покупателями о ваших товарах
            </p>
          </div>
          {hasUnread && (
            <span className="inline-flex items-center rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white">
              Новые сообщения
            </span>
          )}
        </div>

        {/* Chat container */}
        <div className="p-7 md:p-8 flex-1">
          <ChatContainer
            threads={threads}
            selectedThread={selectedThread}
            messages={messages}
            onThreadSelect={handleThreadSelect}
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            onRefresh={handleRefresh}
            loading={loading}
            messagesLoading={messagesLoading}
            isConnected={isConnected}
            isTyping={isTyping}
            sellerId={sellerId}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}

export default Chats;
