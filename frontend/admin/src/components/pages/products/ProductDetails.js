import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiArrowLeft, FiEdit, FiTrash2 } from 'react-icons/fi';

// This is a placeholder component. In a real implementation, you would:
// 1. Fetch data from your API
// 2. Implement proper error handling
// 3. Add loading states
// 4. Implement delete functionality

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Mock data - replace with actual API call
  const { data: product, isLoading, error } = useQuery(['product', id], async () => {
    // Simulate API call
    return {
      id,
      title: 'Standard Pallet (1200x800)',
      descrioption: 'High-quality standard wooden pallet suitable for various industrial applications. Made from durable pine wood.',
      price: 15.00,
      volume: 0.5,
      wood_type: 'Pine',
      wood_type_id: '1',
      seller: 'Wood Crafters Inc.',
      seller_id: '1',
      delivery_possible: true,
      pickup_location: '456 Forest Ave, Woodland, USA',
      created_at: '2023-01-15',
      images: [
        'https://via.placeholder.com/400x300?text=Pallet+Image+1',
        'https://via.placeholder.com/400x300?text=Pallet+Image+2'
      ]
    };
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      // Implement delete API call
      console.log('Deleting product:', id);
      navigate('/products');
    }
  };

  if (isLoading) return <div className="text-center p-6">Loading product details...</div>;
  if (error) return <div className="text-center p-6 text-red-500">Error loading product: {error.message}</div>;
  if (!product) return <div className="text-center p-6">Product not found</div>;

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/products')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <FiArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">Product Details</h1>
      </div>

      <div className="bg-white shadow-md rounded-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold">{product.title}</h2>
              <p className="text-gray-500">ID: {product.id}</p>
            </div>
            <div className="flex space-x-2">
              <Link 
                to={`/products/edit/${product.id}`}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Product Images */}
            <div className="md:col-span-1">
              {product.images && product.images.length > 0 ? (
                <div className="space-y-4">
                  {product.images.map((image, index) => (
                    <img 
                      key={index}
                      src={image}
                      alt={`${product.title} - Image ${index + 1}`}
                      className="w-full h-auto rounded-md shadow-sm"
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-100 h-64 flex items-center justify-center rounded-md">
                  <p className="text-gray-500">No images available</p>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Product Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Price:</span> ${product.price.toFixed(2)}</p>
                    <p><span className="font-medium">Volume:</span> {product.volume} m³</p>
                    <p>
                      <span className="font-medium">Wood Type:</span>{' '}
                      <Link to={`/wood-types/${product.wood_type_id}`} className="text-blue-500 hover:underline">
                        {product.wood_type}
                      </Link>
                    </p>
                    <p>
                      <span className="font-medium">Seller:</span>{' '}
                      <Link to={`/sellers/${product.seller_id}`} className="text-blue-500 hover:underline">
                        {product.seller}
                      </Link>
                    </p>
                    <p><span className="font-medium">Created:</span> {new Date(product.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Delivery Information</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Delivery:</span>{' '}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.delivery_possible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.delivery_possible ? 'Available' : 'Not Available'}
                      </span>
                    </p>
                    {product.pickup_location && (
                      <p><span className="font-medium">Pickup Location:</span> {product.pickup_location}</p>
                    )}
                  </div>
                </div>
              </div>

              {product.descrioption && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{product.descrioption}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
