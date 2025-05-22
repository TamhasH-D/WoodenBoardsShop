import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiMessageCircle, FiSearch, FiFilter, FiEye, FiTrash2 } from 'react-icons/fi';

// This is a placeholder component. In a real implementation, you would:
// 1. Fetch data from your API
// 2. Implement proper error handling
// 3. Add pagination, filtering, and sorting
// 4. Add proper form validation

const ChatThreadsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Mock data - replace with actual API call
  const { data: chatThreads, isLoading, error } = useQuery('chatThreads', async () => {
    // Simulate API call
    return [
      { 
        id: '1', 
        buyer_id: '101',
        buyer_name: 'John Doe',
        seller_id: '201',
        seller_name: 'Wood Crafters Inc.',
        last_message: 'Is this product still available?',
        last_message_time: '2023-05-15T14:30:00Z',
        unread_count: 2,
        is_active: true,
        created_at: '2023-05-15T10:15:00Z'
      },
      { 
        id: '2', 
        buyer_id: '102',
        buyer_name: 'Jane Smith',
        seller_id: '202',
        seller_name: 'Forest Products LLC',
        last_message: 'Thank you for your quick response!',
        last_message_time: '2023-05-14T16:45:00Z',
        unread_count: 0,
        is_active: true,
        created_at: '2023-05-14T09:30:00Z'
      },
      { 
        id: '3', 
        buyer_id: '103',
        buyer_name: 'Bob Johnson',
        seller_id: '201',
        seller_name: 'Wood Crafters Inc.',
        last_message: 'Can you provide more details about shipping?',
        last_message_time: '2023-05-13T11:20:00Z',
        unread_count: 0,
        is_active: false,
        created_at: '2023-05-12T14:00:00Z'
      },
    ];
  });

  // Filter chat threads based on search term and status
  const filteredChatThreads = chatThreads?.filter(thread => {
    const matchesSearch = 
      thread.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.seller_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.last_message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && thread.is_active) || 
      (statusFilter === 'inactive' && !thread.is_active) ||
      (statusFilter === 'unread' && thread.unread_count > 0);
    
    return matchesSearch && matchesStatus;
  });

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) return <div className="text-center p-6">Loading chat threads...</div>;
  if (error) return <div className="text-center p-6 text-red-500">Error loading chat threads: {error.message}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Chat Threads</h1>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by buyer, seller, or message content..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <FiFilter className="mr-2 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Threads</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="unread">Unread</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Threads List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {filteredChatThreads?.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredChatThreads.map((thread) => (
              <div key={thread.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                      <FiMessageCircle size={24} />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-semibold">
                          <Link to={`/buyers/${thread.buyer_id}`} className="hover:underline">
                            {thread.buyer_name}
                          </Link>
                          <span className="text-gray-500 mx-1">→</span>
                          <Link to={`/sellers/${thread.seller_id}`} className="hover:underline">
                            {thread.seller_name}
                          </Link>
                        </h3>
                        {thread.unread_count > 0 && (
                          <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {thread.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-1">{thread.last_message}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500">
                          {formatDate(thread.last_message_time)}
                        </span>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                          thread.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {thread.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link 
                      to={`/chat/threads/${thread.id}`}
                      className="text-blue-500 hover:text-blue-700 p-1"
                    >
                      <FiEye size={18} />
                    </Link>
                    <button className="text-red-500 hover:text-red-700 p-1">
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <FiMessageCircle className="mx-auto text-gray-400 mb-2" size={48} />
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' ? 
                'No chat threads found matching your search criteria.' : 
                'No chat threads found.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatThreadsList;
