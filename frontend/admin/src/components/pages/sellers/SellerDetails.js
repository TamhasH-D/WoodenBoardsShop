import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiArrowLeft, FiEdit, FiTrash2, FiPackage } from 'react-icons/fi';

// This is a placeholder component. In a real implementation, you would:
// 1. Fetch data from your API
// 2. Implement proper error handling
// 3. Add loading states
// 4. Implement delete functionality

const SellerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Mock data - replace with actual API call
  const { data: seller, isLoading, error } = useQuery(['seller', id], async () => {
    // Simulate API call
    return {
      id,
      name: 'Wood Crafters Inc.',
      email: 'contact@woodcrafters.com',
      phone: '+1234567890',
      address: '456 Forest Ave, Woodland, USA',
      isOnline: true,
      createdAt: '2023-01-10',
      description: 'Specializing in high-quality wooden pallets and custom wood products.',
      products: [
        { id: 'PROD-001', name: 'Standard Pallet (1200x800)', price: '$15.00', stock: 120 },
        { id: 'PROD-002', name: 'Euro Pallet (1200x1000)', price: '$18.50', stock: 85 },
        { id: 'PROD-003', name: 'Heavy Duty Pallet (1200x800)', price: '$25.00', stock: 40 },
      ]
    };
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this seller?')) {
      // Implement delete API call
      console.log('Deleting seller:', id);
      navigate('/sellers');
    }
  };

  if (isLoading) return <div className="text-center p-6">Loading seller details...</div>;
  if (error) return <div className="text-center p-6 text-red-500">Error loading seller: {error.message}</div>;
  if (!seller) return <div className="text-center p-6">Seller not found</div>;

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/sellers')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <FiArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">Seller Details</h1>
      </div>

      <div className="bg-white shadow-md rounded-md p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold">{seller.name}</h2>
            <p className="text-gray-500">ID: {seller.id}</p>
            <div className="mt-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                seller.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {seller.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link 
              to={`/sellers/edit/${seller.id}`}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FiEdit className="mr-2" /> Edit
            </Link>
            <button 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FiTrash2 className="mr-2" /> Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Email:</span> {seller.email}</p>
              <p><span className="font-medium">Phone:</span> {seller.phone}</p>
              <p><span className="font-medium">Address:</span> {seller.address}</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Account Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Created:</span> {new Date(seller.createdAt).toLocaleDateString()}</p>
              <p><span className="font-medium">Total Products:</span> {seller.products.length}</p>
            </div>
          </div>
        </div>

        {seller.description && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700">{seller.description}</p>
          </div>
        )}
      </div>

      {/* Products Section */}
      <div className="bg-white shadow-md rounded-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Products</h3>
          <Link 
            to={`/products/new?seller=${seller.id}`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center text-sm"
          >
            <FiPackage className="mr-2" /> Add Product
          </Link>
        </div>
        
        {seller.products.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {seller.products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{product.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.stock > 50 ? 'bg-green-100 text-green-800' :
                      product.stock > 10 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/products/${product.id}`} className="text-blue-500 hover:text-blue-700">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No products found for this seller.</p>
        )}
      </div>
    </div>
  );
};

export default SellerDetails;
