import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

// This is a placeholder component. In a real implementation, you would:
// 1. Fetch data from your API
// 2. Implement proper error handling
// 3. Add pagination, filtering, and sorting
// 4. Add proper form validation

const SellersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data - replace with actual API call
  const { data: sellers, isLoading, error } = useQuery('sellers', async () => {
    // Simulate API call
    return [
      { id: '1', name: 'Wood Crafters Inc.', email: 'contact@woodcrafters.com', phone: '+1234567890', isOnline: true, createdAt: '2023-01-10' },
      { id: '2', name: 'Forest Products LLC', email: 'sales@forestproducts.com', phone: '+0987654321', isOnline: false, createdAt: '2023-02-15' },
      { id: '3', name: 'Timber Solutions', email: 'info@timbersolutions.com', phone: '+1122334455', isOnline: true, createdAt: '2023-03-05' },
    ];
  });

  // Filter sellers based on search term
  const filteredSellers = sellers?.filter(seller => 
    seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="text-center p-6">Loading sellers...</div>;
  if (error) return <div className="text-center p-6 text-red-500">Error loading sellers: {error.message}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sellers</h1>
        <Link 
          to="/sellers/new" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FiPlus className="mr-2" /> Add Seller
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search sellers..."
          className="w-full p-2 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Sellers Table */}
      <div className="bg-white shadow-md rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSellers?.length > 0 ? (
              filteredSellers.map((seller) => (
                <tr key={seller.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{seller.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{seller.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{seller.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      seller.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {seller.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(seller.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Link to={`/sellers/${seller.id}`} className="text-blue-500 hover:text-blue-700">
                        <FiEye />
                      </Link>
                      <Link to={`/sellers/edit/${seller.id}`} className="text-yellow-500 hover:text-yellow-700">
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
                <td colSpan="6" className="px-6 py-4 text-center">
                  {searchTerm ? 'No sellers found matching your search.' : 'No sellers found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellersList;
