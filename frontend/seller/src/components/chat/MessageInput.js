import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';

const MessageInput = forwardRef(({
  onSendMessage,
  onTyping,
  disabled = false,
  placeholder = "Введите сообщение...",
  maxLength = 1000,
  showCharCount = true
}, ref) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Expose focus method to parent
  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
    blur: () => textareaRef.current?.blur(),
    clear: () => setMessage('')
  }), []);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max 120px height
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [message, adjustTextareaHeight]);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
      
      // Handle typing indicator
      if (onTyping && value.trim()) {
        if (!isTyping) {
          setIsTyping(true);
          onTyping(true);
        }
        
        // Clear previous timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        // Set new timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          onTyping(false);
        }, 1000);
      } else if (isTyping) {
        setIsTyping(false);
        onTyping && onTyping(false);
      }
    }
  }, [maxLength, onTyping, isTyping]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    
    if (trimmedMessage && !disabled && onSendMessage) {
      onSendMessage(trimmedMessage);
      setMessage('');
      
      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        onTyping && onTyping(false);
      }
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Focus back to textarea
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  }, [message, disabled, onSendMessage, isTyping, onTyping]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // const containerStyle = { // Removed
  //   padding: '20px',
  //   backgroundColor: '#ffffff',
  //   borderTop: '1px solid #e5e7eb',
  //   borderRadius: '0 0 16px 16px'
  // };

  // const formStyle = { // Removed
  //   display: 'flex',
  //   gap: '12px',
  //   alignItems: 'flex-end'
  // };

  // const inputContainerStyle = { // Removed
  //   flex: 1,
  //   position: 'relative'
  // };

  // const textareaStyle = { // Removed
  //   width: '100%',
  //   minHeight: '44px',
  //   maxHeight: '120px',
  //   padding: '12px 16px',
  //   border: '2px solid #e5e7eb',
  //   borderRadius: '22px',
  //   fontSize: '14px',
  //   lineHeight: '1.5',
  //   resize: 'none',
  //   outline: 'none',
  //   fontFamily: 'inherit',
  //   backgroundColor: '#f9fafb',
  //   transition: 'all 0.2s ease',
  //   scrollbarWidth: 'thin', // Non-standard, cannot be directly Tailwinded without plugin
  //   scrollbarColor: '#d1d5db transparent' // Non-standard
  // };

  // const textareaFocusStyle = { // Removed
  //   ...textareaStyle, // Base styles were part of the old object
  //   borderColor: '#2563eb',
  //   backgroundColor: '#ffffff',
  //   boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)'
  // };

  // const charCountStyle = { // Removed
  //   position: 'absolute',
  //   bottom: '8px',
  //   right: '16px',
  //   fontSize: '11px',
  //   color: message.length > maxLength * 0.9 ? '#ef4444' : '#9ca3af', // Handled by conditional class
  //   backgroundColor: 'rgba(255, 255, 255, 0.9)',
  //   padding: '2px 6px',
  //   borderRadius: '8px',
  //   pointerEvents: 'none'
  // };

  // const sendButtonStyle = { // Removed
  //   width: '44px',
  //   height: '44px',
  //   borderRadius: '50%',
  //   border: 'none',
  //   backgroundColor: message.trim() && !disabled ? '#2563eb' : '#d1d5db', // Handled by conditional class
  //   color: 'white',
  //   cursor: message.trim() && !disabled ? 'pointer' : 'not-allowed', // Handled by conditional class
  //   display: 'flex',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   fontSize: '16px',
  //   transition: 'all 0.2s ease',
  //   flexShrink: 0
  // };

  // const sendButtonHoverStyle = { // Removed
  //   ...sendButtonStyle,
  //   backgroundColor: message.trim() && !disabled ? '#1d4ed8' : '#d1d5db',
  //   transform: message.trim() && !disabled ? 'scale(1.05)' : 'scale(1)'
  // };

  return (
    <div className="p-5 bg-white border-t border-slate-200 rounded-b-2xl">
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full min-h-[44px] max-h-[120px] py-3 px-4 border-2 border-slate-200 rounded-[22px] text-sm leading-normal resize-none outline-none font-inherit bg-slate-50 transition-all duration-200 ease-in-out focus:border-blue-600 focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
            rows={1}
          />
          {showCharCount && (
            <div className={`absolute bottom-2 right-4 text-[11px] bg-white/90 px-1.5 py-0.5 rounded-md pointer-events-none ${message.length > maxLength * 0.9 ? 'text-red-500' : 'text-slate-400'}`}>
              {message.length}/{maxLength}
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className={`w-11 h-11 rounded-full border-none text-white transition-all duration-200 ease-in-out flex items-center justify-center text-base flex-shrink-0 ${message.trim() && !disabled ? 'bg-blue-600 cursor-pointer hover:bg-blue-700 hover:scale-105' : 'bg-slate-300 cursor-not-allowed'}`}
          // onMouseEnter and onMouseLeave removed
          title={disabled ? 'Подключение...' : 'Отправить сообщение (Enter)'}
        >
          {disabled ? '⏳' : '📤'}
        </button>
      </form>
    </div>
  );
});

MessageInput.displayName = 'MessageInput';

export default MessageInput;
