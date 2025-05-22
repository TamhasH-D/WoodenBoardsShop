import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

// This is a placeholder component. In a real implementation, you would:
// 1. Fetch data from your API
// 2. Implement proper error handling
// 3. Add pagination, filtering, and sorting
// 4. Add proper form validation

const BuyersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data - replace with actual API call
  const { data: buyers, isLoading, error } = useQuery('buyers', async () => {
    // Simulate API call
    return [
      { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+1234567890', createdAt: '2023-01-15' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+0987654321', createdAt: '2023-02-20' },
      { id: '3', name: 'Bob Johnson', email: 'bob@example.com', phone: '+1122334455', createdAt: '2023-03-10' },
    ];
  });

  // Filter buyers based on search term
  const filteredBuyers = buyers?.filter(buyer => 
    buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buyer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="text-center p-6">Loading buyers...</div>;
  if (error) return <div className="text-center p-6 text-red-500">Error loading buyers: {error.message}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Buyers</h1>
        <Link 
          to="/buyers/new" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FiPlus className="mr-2" /> Add Buyer
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search buyers..."
          className="w-full p-2 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Buyers Table */}
      <div className="bg-white shadow-md rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBuyers?.length > 0 ? (
              filteredBuyers.map((buyer) => (
                <tr key={buyer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{buyer.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{buyer.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{buyer.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(buyer.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Link to={`/buyers/${buyer.id}`} className="text-blue-500 hover:text-blue-700">
                        <FiEye />
                      </Link>
                      <Link to={`/buyers/edit/${buyer.id}`} className="text-yellow-500 hover:text-yellow-700">
                        <FiEdit />
                      </Link>
                      <button className="text-red-500 hover:text-red-700">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  {searchTerm ? 'No buyers found matching your search.' : 'No buyers found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BuyersList;
