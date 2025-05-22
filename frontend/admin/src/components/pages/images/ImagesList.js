import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiImage } from 'react-icons/fi';

// This is a placeholder component. In a real implementation, you would:
// 1. Fetch data from your API
// 2. Implement proper error handling
// 3. Add pagination, filtering, and sorting
// 4. Add proper form validation

const ImagesList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data - replace with actual API call
  const { data: images, isLoading, error } = useQuery('images', async () => {
    // Simulate API call
    return [
      { 
        id: '1', 
        title: 'Pine Wood Texture', 
        url: 'https://via.placeholder.com/300x200?text=Pine+Wood',
        type: 'wood_type',
        related_id: '1',
        related_name: 'Pine',
        created_at: '2023-01-15',
        file_size: 245000
      },
      { 
        id: '2', 
        title: 'Oak Wood Texture', 
        url: 'https://via.placeholder.com/300x200?text=Oak+Wood',
        type: 'wood_type',
        related_id: '2',
        related_name: 'Oak',
        created_at: '2023-01-16',
        file_size: 312000
      },
      { 
        id: '3', 
        title: 'Standard Pallet Image', 
        url: 'https://via.placeholder.com/300x200?text=Standard+Pallet',
        type: 'product',
        related_id: '1',
        related_name: 'Standard Pallet (1200x800)',
        created_at: '2023-01-17',
        file_size: 420000
      },
    ];
  });

  // Filter images based on search term
  const filteredImages = images?.filter(image => 
    image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.related_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="text-center p-6">Loading images...</div>;
  if (error) return <div className="text-center p-6 text-red-500">Error loading images: {error.message}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Images</h1>
        <Link 
          to="/images/new" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FiPlus className="mr-2" /> Add Image
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by title or related item..."
          className="w-full p-2 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImages?.length > 0 ? (
          filteredImages.map((image) => (
            <div key={image.id} className="bg-white shadow-md rounded-md overflow-hidden">
              <div className="relative h-48 bg-gray-100">
                {image.url ? (
                  <img 
                    src={image.url} 
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FiImage className="text-gray-400" size={48} />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 truncate">{image.title}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  {image.type === 'wood_type' ? 'Wood Type' : 'Product'}: {image.related_name}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{new Date(image.created_at).toLocaleDateString()}</span>
                  <span>{(image.file_size / 1024).toFixed(0)} KB</span>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <Link to={`/images/${image.id}`} className="text-blue-500 hover:text-blue-700">
                    <FiEye />
                  </Link>
                  <Link to={`/images/edit/${image.id}`} className="text-yellow-500 hover:text-yellow-700">
                    <FiEdit />
                  </Link>
                  <button className="text-red-500 hover:text-red-700">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center p-6 bg-white rounded-md shadow-md">
            {searchTerm ? 'No images found matching your search.' : 'No images found.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagesList;
