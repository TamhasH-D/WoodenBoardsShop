import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiSearch, FiFilter, FiEye, FiTrash2, FiMessageCircle } from 'react-icons/fi';

// This is a placeholder component. In a real implementation, you would:
// 1. Fetch data from your API
// 2. Implement proper error handling
// 3. Add pagination, filtering, and sorting
// 4. Add proper form validation

const ChatMessagesList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Mock data - replace with actual API call
  const { data: chatMessages, isLoading, error } = useQuery('chatMessages', async () => {
    // Simulate API call
    return [
      { 
        id: '1001',
        thread_id: '1',
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
        thread_id: '1',
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
        thread_id: '1',
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
        thread_id: '1',
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
        thread_id: '1',
        sender_id: '101',
        sender_type: 'buyer',
        sender_name: 'John Doe',
        message: 'That sounds good. Is this product still available?',
        created_at: '2023-05-15T14:30:00Z',
        is_read_by_buyer: true,
        is_read_by_seller: false
      },
      { 
        id: '2001',
        thread_id: '2',
        sender_id: '102',
        sender_type: 'buyer',
        sender_name: 'Jane Smith',
        message: 'Do you have oak wood boards available?',
        created_at: '2023-05-14T09:30:00Z',
        is_read_by_buyer: true,
        is_read_by_seller: true
      },
      { 
        id: '2002',
        thread_id: '2',
        sender_id: '202',
        sender_type: 'seller',
        sender_name: 'Forest Products LLC',
        message: 'Yes, we have oak boards in various dimensions. What size are you looking for?',
        created_at: '2023-05-14T10:15:00Z',
        is_read_by_buyer: true,
        is_read_by_seller: true
      },
      { 
        id: '2003',
        thread_id: '2',
        sender_id: '102',
        sender_type: 'buyer',
        sender_name: 'Jane Smith',
        message: 'Thank you for your quick response!',
        created_at: '2023-05-14T16:45:00Z',
        is_read_by_buyer: true,
        is_read_by_seller: true
      },
    ];
  });

  // Filter chat messages based on search term and status
  const filteredChatMessages = chatMessages?.filter(message => {
    const matchesSearch = 
      message.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'unread_by_buyer' && !message.is_read_by_buyer) || 
      (statusFilter === 'unread_by_seller' && !message.is_read_by_seller) ||
      (statusFilter === 'buyer' && message.sender_type === 'buyer') ||
      (statusFilter === 'seller' && message.sender_type === 'seller');
    
    return matchesSearch && matchesStatus;
  });

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (isLoading) return <div className="text-center p-6">Loading chat messages...</div>;
  if (error) return <div className="text-center p-6 text-red-500">Error loading chat messages: {error.message}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Chat Messages</h1>
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
              placeholder="Search by sender or message content..."
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
                <option value="all">All Messages</option>
                <option value="unread_by_buyer">Unread by Buyer</option>
                <option value="unread_by_seller">Unread by Seller</option>
                <option value="buyer">From Buyers</option>
                <option value="seller">From Sellers</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {filteredChatMessages?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredChatMessages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full mr-2 ${
                          message.sender_type === 'buyer' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          <FiMessageCircle size={16} />
                        </div>
                        <div>
                          <div className="font-medium">
                            {message.sender_type === 'buyer' ? (
                              <Link to={`/buyers/${message.sender_id}`} className="hover:underline">
                                {message.sender_name}
                              </Link>
                            ) : (
                              <Link to={`/sellers/${message.sender_id}`} className="hover:underline">
                                {message.sender_name}
                              </Link>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {message.sender_type === 'buyer' ? 'Buyer' : 'Seller'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 line-clamp-2">{message.message}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(message.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          message.is_read_by_buyer ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {message.is_read_by_buyer ? 'Read by buyer' : 'Unread by buyer'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          message.is_read_by_seller ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {message.is_read_by_seller ? 'Read by seller' : 'Unread by seller'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <Link 
                          to={`/chat/threads/${message.thread_id}`}
                          className="text-blue-500 hover:text-blue-700 p-1"
                        >
                          <FiEye size={18} />
                        </Link>
                        <button className="text-red-500 hover:text-red-700 p-1">
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <FiMessageCircle className="mx-auto text-gray-400 mb-2" size={48} />
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' ? 
                'No chat messages found matching your search criteria.' : 
                'No chat messages found.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessagesList;
