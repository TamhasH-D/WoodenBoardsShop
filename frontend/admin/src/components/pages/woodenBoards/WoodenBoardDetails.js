import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiArrowLeft, FiEdit, FiTrash2 } from 'react-icons/fi';

// This is a placeholder component. In a real implementation, you would:
// 1. Fetch data from your API
// 2. Implement proper error handling
// 3. Add loading states
// 4. Implement delete functionality

const WoodenBoardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Mock data - replace with actual API call
  const { data: board, isLoading, error } = useQuery(['woodenBoard', id], async () => {
    // Simulate API call
    return {
      id,
      title: 'Pine Board 20x100x1000mm',
      description: 'High-quality pine board suitable for various woodworking projects. Smooth finish, ready to use.',
      wood_type: 'Pine',
      wood_type_id: '1',
      length: 1000,
      width: 100,
      thickness: 20,
      price: 5.50,
      in_stock: 150,
      created_at: '2023-01-15',
      updated_at: '2023-01-15',
      images: [
        'https://via.placeholder.com/400x300?text=Board+Image+1',
        'https://via.placeholder.com/400x300?text=Board+Image+2'
      ]
    };
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this wooden board?')) {
      // Implement delete API call
      console.log('Deleting wooden board:', id);
      navigate('/wooden-boards');
    }
  };

  if (isLoading) return <div className="text-center p-6">Loading board details...</div>;
  if (error) return <div className="text-center p-6 text-red-500">Error loading board: {error.message}</div>;
  if (!board) return <div className="text-center p-6">Board not found</div>;

  // Calculate volume in cubic meters
  const volumeInCubicMeters = (board.length * board.width * board.thickness) / 1000000000;

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/wooden-boards')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <FiArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">Wooden Board Details</h1>
      </div>

      <div className="bg-white shadow-md rounded-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold">{board.title}</h2>
              <p className="text-gray-500">ID: {board.id}</p>
            </div>
            <div className="flex space-x-2">
              <Link 
                to={`/wooden-boards/edit/${board.id}`}
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
            {/* Board Images */}
            <div className="md:col-span-1">
              {board.images && board.images.length > 0 ? (
                <div className="space-y-4">
                  {board.images.map((image, index) => (
                    <img 
                      key={index}
                      src={image}
                      alt={`${board.title} - Image ${index + 1}`}
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

            {/* Board Details */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Board Information</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Wood Type:</span>{' '}
                      <Link to={`/wood-types/${board.wood_type_id}`} className="text-blue-500 hover:underline">
                        {board.wood_type}
                      </Link>
                    </p>
                    <p><span className="font-medium">Dimensions:</span> {board.thickness} x {board.width} x {board.length} mm</p>
                    <p><span className="font-medium">Volume:</span> {volumeInCubicMeters.toFixed(6)} m³</p>
                    <p><span className="font-medium">Price:</span> ${board.price.toFixed(2)}</p>
                    <p>
                      <span className="font-medium">In Stock:</span>{' '}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        board.in_stock > 100 ? 'bg-green-100 text-green-800' :
                        board.in_stock > 50 ? 'bg-yellow-100 text-yellow-800' :
                        board.in_stock > 0 ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {board.in_stock}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Created:</span> {new Date(board.created_at).toLocaleDateString()}</p>
                    <p><span className="font-medium">Last Updated:</span> {new Date(board.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {board.description && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{board.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WoodenBoardDetails;
