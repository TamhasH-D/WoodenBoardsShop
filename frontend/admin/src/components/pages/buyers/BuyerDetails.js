import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiArrowLeft, FiEdit, FiTrash2 } from 'react-icons/fi';

// This is a placeholder component. In a real implementation, you would:
// 1. Fetch data from your API
// 2. Implement proper error handling
// 3. Add loading states
// 4. Implement delete functionality

const BuyerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Mock data - replace with actual API call
  const { data: buyer, isLoading, error } = useQuery(['buyer', id], async () => {
    // Simulate API call
    return {
      id,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      address: '123 Main St, Anytown, USA',
      createdAt: '2023-01-15',
      orders: [
        { id: 'ORD-001', date: '2023-03-10', total: '$120.00', status: 'Delivered' },
        { id: 'ORD-002', date: '2023-04-15', total: '$85.50', status: 'Processing' },
      ]
    };
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this buyer?')) {
      // Implement delete API call
      console.log('Deleting buyer:', id);
      navigate('/buyers');
    }
  };

  if (isLoading) return <div className="text-center p-6">Loading buyer details...</div>;
  if (error) return <div className="text-center p-6 text-red-500">Error loading buyer: {error.message}</div>;
  if (!buyer) return <div className="text-center p-6">Buyer not found</div>;

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/buyers')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <FiArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">Buyer Details</h1>
      </div>

      <div className="bg-white shadow-md rounded-md p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold">{buyer.name}</h2>
            <p className="text-gray-500">ID: {buyer.id}</p>
          </div>
          <div className="flex space-x-2">
            <Link 
              to={`/buyers/edit/${buyer.id}`}
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
              <p><span className="font-medium">Email:</span> {buyer.email}</p>
              <p><span className="font-medium">Phone:</span> {buyer.phone}</p>
              <p><span className="font-medium">Address:</span> {buyer.address}</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Account Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Created:</span> {new Date(buyer.createdAt).toLocaleDateString()}</p>
              <p><span className="font-medium">Total Orders:</span> {buyer.orders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="bg-white shadow-md rounded-md p-6">
        <h3 className="text-lg font-semibold mb-4">Orders</h3>
        
        {buyer.orders.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {buyer.orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(order.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/orders/${order.id}`} className="text-blue-500 hover:text-blue-700">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No orders found for this buyer.</p>
        )}
      </div>
    </div>
  );
};

export default BuyerDetails;
