import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

// This is a placeholder component. In a real implementation, you would:
// 1. Fetch data from your API
// 2. Implement proper error handling
// 3. Add pagination, filtering, and sorting
// 4. Add proper form validation

const WoodTypePricesList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data - replace with actual API call
  const { data: woodTypePrices, isLoading, error } = useQuery('woodTypePrices', async () => {
    // Simulate API call
    return [
      { 
        id: '1', 
        wood_type: 'Pine', 
        wood_type_id: '1',
        price_per_cubic_meter: 300.00, 
        min_order_volume: 0.5,
        effective_date: '2023-01-01',
        is_active: true
      },
      { 
        id: '2', 
        wood_type: 'Oak', 
        wood_type_id: '2',
        price_per_cubic_meter: 500.00, 
        min_order_volume: 0.3,
        effective_date: '2023-01-01',
        is_active: true
      },
      { 
        id: '3', 
        wood_type: 'Birch', 
        wood_type_id: '3',
        price_per_cubic_meter: 350.00, 
        min_order_volume: 0.4,
        effective_date: '2023-01-01',
        is_active: true
      },
      { 
        id: '4', 
        wood_type: 'Pine', 
        wood_type_id: '1',
        price_per_cubic_meter: 280.00, 
        min_order_volume: 0.5,
        effective_date: '2022-07-01',
        is_active: false
      },
    ];
  });

  // Filter wood type prices based on search term
  const filteredWoodTypePrices = woodTypePrices?.filter(price => 
    price.wood_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="text-center p-6">Loading wood type prices...</div>;
  if (error) return <div className="text-center p-6 text-red-500">Error loading wood type prices: {error.message}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Wood Type Prices</h1>
        <Link 
          to="/wood-type-prices/new" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FiPlus className="mr-2" /> Add Price
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by wood type..."
          className="w-full p-2 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Wood Type Prices Table */}
      <div className="bg-white shadow-md rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wood Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price ($/m³)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Order (m³)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effective Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredWoodTypePrices?.length > 0 ? (
              filteredWoodTypePrices.map((price) => (
                <tr key={price.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/wood-types/${price.wood_type_id}`} className="text-blue-500 hover:underline">
                      {price.wood_type}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">${price.price_per_cubic_meter.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{price.min_order_volume}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(price.effective_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      price.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {price.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Link to={`/wood-type-prices/${price.id}`} className="text-blue-500 hover:text-blue-700">
                        <FiEye />
                      </Link>
                      <Link to={`/wood-type-prices/edit/${price.id}`} className="text-yellow-500 hover:text-yellow-700">
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
                  {searchTerm ? 'No wood type prices found matching your search.' : 'No wood type prices found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WoodTypePricesList;
