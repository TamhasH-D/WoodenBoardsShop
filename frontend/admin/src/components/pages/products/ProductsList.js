import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

// This is a placeholder component. In a real implementation, you would:
// 1. Fetch data from your API
// 2. Implement proper error handling
// 3. Add pagination, filtering, and sorting
// 4. Add proper form validation

const ProductsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data - replace with actual API call
  const { data: products, isLoading, error } = useQuery('products', async () => {
    // Simulate API call
    return [
      { 
        id: '1', 
        title: 'Standard Pallet (1200x800)', 
        price: 15.00, 
        volume: 0.5, 
        wood_type: 'Pine', 
        seller: 'Wood Crafters Inc.',
        seller_id: '1'
      },
      { 
        id: '2', 
        title: 'Euro Pallet (1200x1000)', 
        price: 18.50, 
        volume: 0.6, 
        wood_type: 'Oak', 
        seller: 'Forest Products LLC',
        seller_id: '2'
      },
      { 
        id: '3', 
        title: 'Heavy Duty Pallet (1200x800)', 
        price: 25.00, 
        volume: 0.5, 
        wood_type: 'Birch', 
        seller: 'Timber Solutions',
        seller_id: '3'
      },
    ];
  });

  // Filter products based on search term
  const filteredProducts = products?.filter(product => 
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.wood_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.seller.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="text-center p-6">Loading products...</div>;
  if (error) return <div className="text-center p-6 text-red-500">Error loading products: {error.message}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link 
          to="/products/new" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FiPlus className="mr-2" /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search products by title, wood type, or seller..."
          className="w-full p-2 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Products Table */}
      <div className="bg-white shadow-md rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume (m³)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wood Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts?.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{product.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.volume}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.wood_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/sellers/${product.seller_id}`} className="text-blue-500 hover:underline">
                      {product.seller}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Link to={`/products/${product.id}`} className="text-blue-500 hover:text-blue-700">
                        <FiEye />
                      </Link>
                      <Link to={`/products/edit/${product.id}`} className="text-yellow-500 hover:text-yellow-700">
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
                  {searchTerm ? 'No products found matching your search.' : 'No products found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsList;
