import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query'; // MODIFIED
import { FiArrowLeft, FiSave, FiUpload, FiImage } from 'react-icons/fi';
import apiService from '../../../apiService';
import toast from 'react-hot-toast'; // ADDED

// MODIFIED: Comments are now less relevant as features are being implemented.

const ImageForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient(); // ADDED
  const isEditMode = !!id;
  
  const queryParams = new URLSearchParams(location.search);
  const relatedTypeFromQuery = queryParams.get('type'); // RENAMED for clarity
  const relatedIdFromQuery = queryParams.get('id'); // RENAMED for clarity
  const relatedNameFromQuery = queryParams.get('name'); // RENAMED for clarity
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    alt_text: '',
    type: relatedTypeFromQuery || '',
    related_id: relatedIdFromQuery || '',
    // related_name is derived, not directly set by user initially unless from query
  });
  
  const [errors, setErrors] = useState({});
  // const [isSubmitting, setIsSubmitting] = useState(false); // REMOVED: Handled by useMutation
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Fetch wood types for dropdown
  const { data: woodTypes, isLoading: isLoadingWoodTypes } = useQuery(
    'woodTypes',
    apiService.getWoodTypes,
    {
      onError: (error) => toast.error(error.message || 'Failed to fetch wood types.'),
    }
  );
  
  // Fetch products for dropdown (assuming an endpoint like getProducts exists and is suitable for a dropdown)
  // If not, this might need to be a searchable select or removed if too many products.
  const { data: products, isLoading: isLoadingProducts } = useQuery(
    'productsForImageForm', // Using a more specific key to avoid conflicts if 'products' is used elsewhere with different params
    () => apiService.getProducts({ limit: 1000 }), // Fetching all, might need pagination/search if too many
    {
      onError: (error) => toast.error(error.message || 'Failed to fetch products.'),
    }
  );
  
  // For edit mode, fetch the image data
  const { data: imageData, isLoading: isLoadingImage } = useQuery(
    ['image', id],
    () => apiService.getImage(id),
    {
      enabled: isEditMode,
      onSuccess: (data) => {
        if (data) {
          setFormData({
            title: data.title || '',
            description: data.description || '',
            alt_text: data.alt_text || '',
            type: data.type || '',
            related_id: data.related_id || '',
            // related_name will be set by useEffect based on type and related_id
          });
          if (data.url) {
            setImagePreview(data.url);
          }
        }
      },
      onError: (error) => {
        toast.error(error.message || `Failed to fetch image data (ID: ${id}).`);
      }
    }
  );

  // ADDED: Effect to update related_name when type or related_id changes, or when data loads
  useEffect(() => {
    if (formData.type && formData.related_id) {
      let name = '';
      if (formData.type === 'wood_type' && woodTypes) {
        const selected = woodTypes.find(wt => wt.id.toString() === formData.related_id.toString());
        name = selected ? selected.name : '';
      } else if (formData.type === 'product' && products) {
        const selected = products.find(p => p.id.toString() === formData.related_id.toString());
        name = selected ? selected.title : '';
      }
      // This state is not directly part of formData sent to API, but useful for display or if API expects it
      // If API expects related_name, it should be added to formData state and submission payload.
      // For now, assuming API derives it or doesn't need it explicitly if type & related_id are sent.
    } else if (relatedNameFromQuery && !formData.type && !formData.related_id) {
      // If coming from query params and form fields are not yet set
      // This part might be redundant if relatedTypeFromQuery and relatedIdFromQuery correctly initialize formData
    }
  }, [formData.type, formData.related_id, woodTypes, products, relatedNameFromQuery]);

  // ADDED Mutations
  const createImageMutation = useMutation(
    (imagePayload) => apiService.createImage(imagePayload),
    {
      onSuccess: () => {
        toast.success('Image created successfully!');
        queryClient.invalidateQueries('images');
        navigate('/images');
      },
      onError: (error) => {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to create image.';
        toast.error(errorMsg);
        setErrors(prev => ({ ...prev, form: errorMsg, ...(error.response?.data?.errors || {}) }));
      },
    }
  );

  const updateImageMutation = useMutation(
    (imagePayload) => apiService.updateImage(id, imagePayload),
    {
      onSuccess: () => {
        toast.success('Image updated successfully!');
        queryClient.invalidateQueries('images');
        queryClient.invalidateQueries(['image', id]);
        navigate('/images');
      },
      onError: (error) => {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to update image.';
        toast.error(errorMsg);
        setErrors(prev => ({ ...prev, form: errorMsg, ...(error.response?.data?.errors || {}) }));
      },
    }
  );
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    // Reset related_id when type changes
    if (name === 'type') {
      setFormData((prev) => ({ ...prev, related_id: '' }));
    }
  };
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      //setImagePreview(null); // Keep existing preview if in edit mode and user cancels new selection
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.type) newErrors.type = 'Type is required';
    if (!formData.related_id) newErrors.related_id = 'Related item is required';
    if (!isEditMode && !imageFile) newErrors.image = 'Image file is required for new images';
    // Add more validation as needed, e.g., for alt_text if it becomes mandatory
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submissionPayload = new FormData();
    submissionPayload.append('title', formData.title);
    submissionPayload.append('description', formData.description);
    submissionPayload.append('alt_text', formData.alt_text);
    submissionPayload.append('type', formData.type);
    submissionPayload.append('related_id', formData.related_id);

    if (imageFile) {
      submissionPayload.append('image_file', imageFile); // API expects 'image_file'
    }
    // Note: If API expects related_name, ensure it's correctly derived and appended.

    if (isEditMode) {
      updateImageMutation.mutate(submissionPayload);
    } else {
      createImageMutation.mutate(submissionPayload);
    }
  };
  
  if ((isEditMode && isLoadingImage) || isLoadingWoodTypes || isLoadingProducts) {
    return <div className="text-center p-6">Loading data...</div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/images')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <FiArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Image' : 'Add Image'}</h1>
      </div>
      
      <div className="bg-white shadow-md rounded-md p-6">
        {errors.form && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {errors.form}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="title">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter image title"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="alt_text">
                Alt Text
              </label>
              <input
                type="text"
                id="alt_text"
                name="alt_text"
                value={formData.alt_text}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter alt text for accessibility"
              />
              <p className="text-xs text-gray-500 mt-1">
                Describe the image for screen readers and SEO
              </p>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="type">
                Related Item Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
                disabled={!!relatedTypeFromQuery || isLoadingWoodTypes || isLoadingProducts}
              >
                <option value="">Select Type</option>
                <option value="wood_type">Wood Type</option>
                <option value="product">Product</option>
                {/* Add other types if API supports them, e.g., 'wooden_board' */}
              </select>
              {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="related_id">
                Related Item *
              </label>
              <select
                id="related_id"
                name="related_id"
                value={formData.related_id}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.related_id ? 'border-red-500' : 'border-gray-300'}`}
                disabled={!formData.type || !!relatedIdFromQuery || (formData.type === 'wood_type' && isLoadingWoodTypes) || (formData.type === 'product' && isLoadingProducts)}
              >
                <option value="">Select {formData.type ? (formData.type === 'wood_type' ? 'Wood Type' : 'Product') : 'Item'}</option>
                {formData.type === 'wood_type' && woodTypes?.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} {/* Corrected neme to name */}
                  </option>
                ))}
                {formData.type === 'product' && products?.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title}
                  </option>
                ))}
                {/* Add options for other types if applicable */}
              </select>
              {errors.related_id && <p className="text-red-500 text-sm mt-1">{errors.related_id}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter image description"
              ></textarea>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2">
                Image {!isEditMode && '*'}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className={`border-2 ${errors.image ? 'border-red-500' : 'border-dashed border-gray-300'} rounded-lg p-4`}>
                    <div className="flex flex-col items-center">
                      <label className="w-full flex flex-col items-center cursor-pointer">
                        <div className="w-full h-48 flex flex-col items-center justify-center">
                          {imagePreview ? (
                            <img 
                              src={imagePreview} 
                              alt={formData.alt_text || "Preview"} // Use alt_text for preview too
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <>
                              <FiImage className="text-gray-400 mb-2" size={48} />
                              <p className="text-gray-500">Click to select an image</p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="imageUploadInput" // Added ID for easier targeting
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => document.getElementById('imageUploadInput')?.click()} // Target by ID
                        className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
                      >
                        <FiUpload className="mr-2" />
                        {imageFile || (isEditMode && imagePreview) ? 'Change Image' : 'Upload Image'} {/* Improved button text */}
                      </button>
                    </div>
                  </div>
                  {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                </div>
                <div>
                  <div className="bg-gray-50 p-4 rounded-lg h-full">
                    <h3 className="font-medium mb-2">Image Guidelines</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Maximum file size: 5MB</li>
                      <li>• Recommended dimensions: 800x600 pixels or larger</li>
                      <li>• Supported formats: JPG, PNG, GIF</li>
                      <li>• Use high-quality images with good lighting</li>
                      <li>• Avoid text in images when possible</li>
                      <li>• Ensure images are relevant to the related item</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/images')}
              className="mr-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createImageMutation.isLoading || updateImageMutation.isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FiSave className="mr-2" />
              {createImageMutation.isLoading || updateImageMutation.isLoading ? 'Saving...' : 'Save Image'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImageForm;
