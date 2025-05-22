import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiArrowLeft, FiEdit, FiTrash2, FiDownload, FiImage } from 'react-icons/fi';

// This is a placeholder component. In a real implementation, you would:
// 1. Fetch data from your API
// 2. Implement proper error handling
// 3. Add loading states
// 4. Implement delete functionality
// 5. Implement download functionality

const ImageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Mock data - replace with actual API call
  const { data: image, isLoading, error } = useQuery(['image', id], async () => {
    // Simulate API call
    return {
      id,
      title: 'Pine Wood Texture',
      description: 'High-quality texture image of pine wood grain, suitable for product displays and marketing materials.',
      url: 'https://via.placeholder.com/800x600?text=Pine+Wood',
      type: 'wood_type',
      related_id: '1',
      related_name: 'Pine',
      created_at: '2023-01-15',
      updated_at: '2023-01-15',
      file_size: 245000,
      file_type: 'image/jpeg',
      dimensions: {
        width: 800,
        height: 600
      },
      alt_text: 'Close-up texture of pine wood grain showing natural patterns',
      uploaded_by: 'Admin User'
    };
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      // Implement delete API call
      console.log('Deleting image:', id);
      navigate('/images');
    }
  };

  const handleDownload = () => {
    // Implement download functionality
    console.log('Downloading image:', image.url);
    // In a real app, you would trigger a download of the image
    window.open(image.url, '_blank');
  };

  if (isLoading) return <div className="text-center p-6">Loading image details...</div>;
  if (error) return <div className="text-center p-6 text-red-500">Error loading image: {error.message}</div>;
  if (!image) return <div className="text-center p-6">Image not found</div>;

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/images')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <FiArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">Image Details</h1>
      </div>

      <div className="bg-white shadow-md rounded-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold">{image.title}</h2>
              <p className="text-gray-500">ID: {image.id}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleDownload}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
              >
                <FiDownload className="mr-2" /> Download
              </button>
              <Link 
                to={`/images/edit/${image.id}`}
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
            {/* Image Preview */}
            <div className="md:col-span-2 bg-gray-100 rounded-md overflow-hidden">
              {image.url ? (
                <img 
                  src={image.url} 
                  alt={image.alt_text || image.title}
                  className="w-full h-auto"
                />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <FiImage className="text-gray-400" size={64} />
                </div>
              )}
            </div>

            {/* Image Details */}
            <div className="md:col-span-1">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Image Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">File Type:</span> {image.file_type}</p>
                    <p><span className="font-medium">File Size:</span> {(image.file_size / 1024).toFixed(0)} KB</p>
                    {image.dimensions && (
                      <p><span className="font-medium">Dimensions:</span> {image.dimensions.width} x {image.dimensions.height} px</p>
                    )}
                    <p><span className="font-medium">Created:</span> {new Date(image.created_at).toLocaleDateString()}</p>
                    <p><span className="font-medium">Last Updated:</span> {new Date(image.updated_at).toLocaleDateString()}</p>
                    <p><span className="font-medium">Uploaded By:</span> {image.uploaded_by}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Related Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Type:</span> {image.type === 'wood_type' ? 'Wood Type' : 'Product'}</p>
                    <p>
                      <span className="font-medium">Related Item:</span>{' '}
                      <Link 
                        to={image.type === 'wood_type' ? `/wood-types/${image.related_id}` : `/products/${image.related_id}`} 
                        className="text-blue-500 hover:underline"
                      >
                        {image.related_name}
                      </Link>
                    </p>
                  </div>
                </div>

                {image.alt_text && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Alt Text</h3>
                    <p className="text-gray-700">{image.alt_text}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {image.description && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{image.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageDetails;
