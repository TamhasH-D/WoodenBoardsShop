import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiArrowLeft, FiUser, FiSend, FiTrash2, FiArchive, FiMessageCircle } from 'react-icons/fi';

// This is a placeholder component. In a real implementation, you would:
// 1. Fetch data from your API
// 2. Implement proper error handling
// 3. Add loading states
// 4. Implement message sending functionality
// 5. Implement thread archiving/deletion

const ChatThreadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // Mock data - replace with actual API call
  const { data: thread, isLoading: isLoadingThread, error: threadError } = useQuery(['chatThread', id], async () => {
    // Simulate API call
    return {
      id,
      buyer_id: '101',
      buyer_name: 'John Doe',
      buyer_email: 'john@example.com',
      seller_id: '201',
      seller_name: 'Wood Crafters Inc.',
      seller_email: 'contact@woodcrafters.com',
      is_active: true,
      created_at: '2023-05-15T10:15:00Z',
      updated_at: '2023-05-15T14:30:00Z'
    };
  });
  
  // Mock data - replace with actual API call
  const { data: messages, isLoading: isLoadingMessages, error: messagesError } = useQuery(['chatMessages', id], async () => {
    // Simulate API call
    return [
      {
        id: '1001',
        thread_id: id,
        sender_id: '101',
        sender_type: 'buyer',
        sender_name: 'John Doe',
        message: 'Hello, I\'m interested in your wooden pallets. Do you have the standard size (1200x800) in stock?',
        created_at: '2023-05-15T10:15:00Z',
        is_read_by_buyer: true,
        is_read_by_seller: true
      },
      {
        id: '1002',
        thread_id: id,
        sender_id: '201',
        sender_type: 'seller',
        sender_name: 'Wood Crafters Inc.',
        message: 'Hi John, yes we do have the standard size pallets in stock. How many do you need?',
        created_at: '2023-05-15T10:30:00Z',
        is_read_by_buyer: true,
        is_read_by_seller: true
      },
      {
        id: '1003',
        thread_id: id,
        sender_id: '101',
        sender_type: 'buyer',
        sender_name: 'John Doe',
        message: 'I need about 50 pallets. What\'s the price per unit and do you offer delivery?',
        created_at: '2023-05-15T11:00:00Z',
        is_read_by_buyer: true,
        is_read_by_seller: true
      },
      {
        id: '1004',
        thread_id: id,
        sender_id: '201',
        sender_type: 'seller',
        sender_name: 'Wood Crafters Inc.',
        message: 'For an order of 50 pallets, we can offer a price of $12 per unit. Yes, we do offer delivery within 50 miles of our location for a flat fee of $100.',
        created_at: '2023-05-15T11:45:00Z',
        is_read_by_buyer: true,
        is_read_by_seller: true
      },
      {
        id: '1005',
        thread_id: id,
        sender_id: '101',
        sender_type: 'buyer',
        sender_name: 'John Doe',
        message: 'That sounds good. Is this product still available?',
        created_at: '2023-05-15T14:30:00Z',
        is_read_by_buyer: true,
        is_read_by_seller: false
      }
    ];
  });
  
  // Scroll to bottom of messages when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // In a real app, you would call an API to send the message
    console.log('Sending message:', message);
    
    // Clear the input
    setMessage('');
  };
  
  const handleArchiveThread = () => {
    if (window.confirm('Are you sure you want to archive this chat thread?')) {
      // In a real app, you would call an API to archive the thread
      console.log('Archiving thread:', id);
      navigate('/chat');
    }
  };
  
  const handleDeleteThread = () => {
    if (window.confirm('Are you sure you want to delete this chat thread? This action cannot be undone.')) {
      // In a real app, you would call an API to delete the thread
      console.log('Deleting thread:', id);
      navigate('/chat');
    }
  };
  
  // Format date for display
  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Group messages by date
  const groupMessagesByDate = (messages) => {
    if (!messages) return [];
    
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.created_at).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages
    }));
  };
  
  const messageGroups = groupMessagesByDate(messages);
  
  const isLoading = isLoadingThread || isLoadingMessages;
  const error = threadError || messagesError;
  
  if (isLoading) return <div className="text-center p-6">Loading chat thread...</div>;
  if (error) return <div className="text-center p-6 text-red-500">Error loading chat thread: {error.message}</div>;
  if (!thread || !messages) return <div className="text-center p-6">Chat thread not found</div>;

  return (
    <div className="p-6 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center mb-4">
        <button 
          onClick={() => navigate('/chat')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <FiArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">Chat Thread</h1>
      </div>

      <div className="flex flex-col flex-grow bg-white shadow-md rounded-lg overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-blue-100 text-blue-700 p-2 rounded-full mr-3">
              <FiMessageCircle size={24} />
            </div>
            <div>
              <div className="flex items-center">
                <Link to={`/buyers/${thread.buyer_id}`} className="font-semibold hover:underline">
                  {thread.buyer_name}
                </Link>
                <span className="text-gray-500 mx-1">→</span>
                <Link to={`/sellers/${thread.seller_id}`} className="font-semibold hover:underline">
                  {thread.seller_name}
                </Link>
              </div>
              <div className="text-xs text-gray-500">
                Started {new Date(thread.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleArchiveThread}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              title="Archive Thread"
            >
              <FiArchive size={18} />
            </button>
            <button
              onClick={handleDeleteThread}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-gray-100 rounded-full"
              title="Delete Thread"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
          {messageGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              <div className="flex justify-center mb-4">
                <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {group.date}
                </div>
              </div>
              
              {group.messages.map((msg) => {
                const isBuyer = msg.sender_type === 'buyer';
                return (
                  <div 
                    key={msg.id} 
                    className={`flex mb-4 ${isBuyer ? 'justify-start' : 'justify-end'}`}
                  >
                    {isBuyer && (
                      <div className="mr-2 flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FiUser className="text-blue-500" />
                        </div>
                      </div>
                    )}
                    
                    <div className={`max-w-[70%] rounded-lg p-3 ${
                      isBuyer 
                        ? 'bg-white border border-gray-200' 
                        : 'bg-blue-500 text-white'
                    }`}>
                      <div className="text-xs mb-1">
                        {isBuyer ? thread.buyer_name : thread.seller_name}
                      </div>
                      <p>{msg.message}</p>
                      <div className={`text-xs mt-1 text-right ${
                        isBuyer ? 'text-gray-500' : 'text-blue-100'
                      }`}>
                        {formatMessageTime(msg.created_at)}
                        {!msg.is_read_by_buyer && isBuyer && ' • Not read by buyer'}
                        {!msg.is_read_by_seller && !isBuyer && ' • Not read by seller'}
                      </div>
                    </div>
                    
                    {!isBuyer && (
                      <div className="ml-2 flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FiUser className="text-blue-500" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message as admin..."
            className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className={`bg-blue-500 text-white p-2 rounded-r-lg ${
              !message.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
          >
            <FiSend size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatThreadDetails;
