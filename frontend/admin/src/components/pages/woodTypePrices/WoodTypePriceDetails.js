import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiArrowLeft, FiEdit, FiTrash2 } from 'react-icons/fi';

// This is a placeholder component. In a real implementation, you would:
// 1. Fetch data from your API
// 2. Implement proper error handling
// 3. Add loading states
// 4. Implement delete functionality

const WoodTypePriceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Mock data - replace with actual API call
  const { data: priceData, isLoading, error } = useQuery(['woodTypePrice', id], async () => {
    // Simulate API call
    return {
      id,
      wood_type: 'Pine',
      wood_type_id: '1',
      price_per_cubic_meter: 300.00,
      min_order_volume: 0.5,
      effective_date: '2023-01-01',
      expiration_date: '2023-12-31',
      is_active: true,
      created_at: '2022-12-15',
      created_by: 'Admin User',
      notes: 'Standard pricing for pine wood in 2023.'
    };
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this price record?')) {
      // Implement delete API call
      console.log('Deleting wood type price:', id);
      navigate('/wood-type-prices');
    }
  };

  if (isLoading) return <div className="text-center p-6">Loading price details...</div>;
  if (error) return <div className="text-center p-6 text-red-500">Error loading price: {error.message}</div>;
  if (!priceData) return <div className="text-center p-6">Price record not found</div>;

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/wood-type-prices')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <FiArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">Wood Type Price Details</h1>
      </div>

      <div className="bg-white shadow-md rounded-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              <Link to={`/wood-types/${priceData.wood_type_id}`} className="text-blue-500 hover:underline">
                {priceData.wood_type}
              </Link>
            </h2>
            <p className="text-gray-500">ID: {priceData.id}</p>
            <div className="mt-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                priceData.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {priceData.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link 
              to={`/wood-type-prices/edit/${priceData.id}`}
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
            <h3 className="text-lg font-semibold mb-2">Price Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Price per Cubic Meter:</span> ${priceData.price_per_cubic_meter.toFixed(2)}</p>
              <p><span className="font-medium">Minimum Order Volume:</span> {priceData.min_order_volume} m³</p>
              <p><span className="font-medium">Effective Date:</span> {new Date(priceData.effective_date).toLocaleDateString()}</p>
              {priceData.expiration_date && (
                <p><span className="font-medium">Expiration Date:</span> {new Date(priceData.expiration_date).toLocaleDateString()}</p>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Created:</span> {new Date(priceData.created_at).toLocaleDateString()}</p>
              <p><span className="font-medium">Created By:</span> {priceData.created_by}</p>
              <p><span className="font-medium">Status:</span> {priceData.is_active ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        </div>

        {priceData.notes && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Notes</h3>
            <p className="text-gray-700">{priceData.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WoodTypePriceDetails;
