import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiArrowLeft, FiSave, FiUpload, FiImage } from 'react-icons/fi';

// This is a placeholder component. In a real implementation, you would:
// 1. Fetch data from your API for editing
// 2. Implement form submission to create/update
// 3. Add proper form validation
// 4. Add error handling
// 5. Implement image upload functionality

const ImageForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!id;
  
  // Get related item info from query params if available
  const queryParams = new URLSearchParams(location.search);
  const relatedType = queryParams.get('type');
  const relatedId = queryParams.get('id');
  const relatedName = queryParams.get('name');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    alt_text: '',
    type: relatedType || '',
    related_id: relatedId || '',
    related_name: relatedName || '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Fetch wood types for dropdown
  const { data: woodTypes } = useQuery('woodTypes', async () => {
    // Simulate API call
    return [
      { id: '1', neme: 'Pine' },
      { id: '2', neme: 'Oak' },
      { id: '3', neme: 'Birch' },
      { id: '4', neme: 'Maple' },
    ];
  });
  
  // Fetch products for dropdown
  const { data: products } = useQuery('products', async () => {
    // Simulate API call
    return [
      { id: '1', title: 'Standard Pallet (1200x800)' },
      { id: '2', title: 'Euro Pallet (1200x1000)' },
      { id: '3', title: 'Heavy Duty Pallet (1200x800)' },
    ];
  });
  
  // For edit mode, fetch the image data
  const { data: imageData, isLoading } = useQuery(
    ['image', id],
    async () => {
      // Simulate API call for edit mode
      return {
        id,
        title: 'Pine Wood Texture',
        description: 'High-quality texture image of pine wood grain, suitable for product displays and marketing materials.',
        url: 'https://via.placeholder.com/800x600?text=Pine+Wood',
        type: 'wood_type',
        related_id: '1',
        related_name: 'Pine',
        alt_text: 'Close-up texture of pine wood grain showing natural patterns',
      };
    },
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
            related_name: data.related_name || '',
          });
          
          if (data.url) {
            setImagePreview(data.url);
          }
        }
      },
    }
  );
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    
    // Handle related item selection
    if (name === 'type') {
      setFormData((prev) => ({
        ...prev,
        related_id: '',
        related_name: '',
      }));
    } else if (name === 'related_id') {
      let relatedName = '';
      
      if (value) {
        if (formData.type === 'wood_type' && woodTypes) {
          const selectedType = woodTypes.find(type => type.id === value);
          relatedName = selectedType ? selectedType.neme : '';
        } else if (formData.type === 'product' && products) {
          const selectedProduct = products.find(product => product.id === value);
          relatedName = selectedProduct ? selectedProduct.title : '';
        }
      }
      
      setFormData((prev) => ({
        ...prev,
        related_name: relatedName,
      }));
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
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.type) {
      newErrors.type = 'Type is required';
    }
    
    if (!formData.related_id) {
      newErrors.related_id = 'Related item is required';
    }
    
    if (!isEditMode && !imageFile) {
      newErrors.image = 'Image file is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      console.log('Form submitted:', formData);
      console.log('Image file:', imageFile);
      
      // Redirect after successful submission
      navigate('/images');
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors((prev) => ({
        ...prev,
        form: 'Failed to submit form. Please try again.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isEditMode && isLoading) {
    return <div className="text-center p-6">Loading image data...</div>;
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
                disabled={!!relatedType}
              >
                <option value="">Select Type</option>
                <option value="wood_type">Wood Type</option>
                <option value="product">Product</option>
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
                disabled={!formData.type || !!relatedId}
              >
                <option value="">Select {formData.type === 'wood_type' ? 'Wood Type' : 'Product'}</option>
                {formData.type === 'wood_type' && woodTypes?.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.neme}
                  </option>
                ))}
                {formData.type === 'product' && products?.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title}
                  </option>
                ))}
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
                              alt="Preview" 
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
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => document.querySelector('input[type="file"]').click()}
                        className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
                      >
                        <FiUpload className="mr-2" />
                        {isEditMode ? 'Change Image' : 'Upload Image'}
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
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FiSave className="mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Image'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImageForm;
