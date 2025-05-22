import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiArrowLeft, FiSave, FiUpload } from 'react-icons/fi';

// This is a placeholder component. In a real implementation, you would:
// 1. Fetch data from your API for editing
// 2. Implement form submission to create/update
// 3. Add proper form validation
// 4. Add error handling
// 5. Implement image upload functionality

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!id;
  
  // Get seller ID from query params if available (for creating a product for a specific seller)
  const queryParams = new URLSearchParams(location.search);
  const sellerIdFromQuery = queryParams.get('seller');
  
  const [formData, setFormData] = useState({
    title: '',
    descrioption: '',
    price: '',
    volume: '',
    wood_type_id: '',
    seller_id: sellerIdFromQuery || '',
    delivery_possible: false,
    pickup_location: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  
  // Fetch sellers for dropdown
  const { data: sellers } = useQuery('sellers', async () => {
    // Simulate API call
    return [
      { id: '1', name: 'Wood Crafters Inc.' },
      { id: '2', name: 'Forest Products LLC' },
      { id: '3', name: 'Timber Solutions' },
    ];
  });
  
  // For edit mode, fetch the product data
  const { data: productData, isLoading } = useQuery(
    ['product', id],
    async () => {
      // Simulate API call for edit mode
      return {
        id,
        title: 'Standard Pallet (1200x800)',
        descrioption: 'High-quality standard wooden pallet suitable for various industrial applications. Made from durable pine wood.',
        price: 15.00,
        volume: 0.5,
        wood_type_id: '1',
        seller_id: '1',
        delivery_possible: true,
        pickup_location: '456 Forest Ave, Woodland, USA',
        images: [
          'https://via.placeholder.com/400x300?text=Pallet+Image+1'
        ]
      };
    },
    {
      enabled: isEditMode,
      onSuccess: (data) => {
        if (data) {
          setFormData({
            title: data.title || '',
            descrioption: data.descrioption || '',
            price: data.price || '',
            volume: data.volume || '',
            wood_type_id: data.wood_type_id || '',
            seller_id: data.seller_id || '',
            delivery_possible: data.delivery_possible || false,
            pickup_location: data.pickup_location || '',
          });
          
          if (data.images && data.images.length > 0) {
            setImagePreview(data.images[0]);
          }
        }
      },
    }
  );
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
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
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (!formData.volume) {
      newErrors.volume = 'Volume is required';
    } else if (isNaN(formData.volume) || parseFloat(formData.volume) <= 0) {
      newErrors.volume = 'Volume must be a positive number';
    }
    
    if (!formData.wood_type_id) {
      newErrors.wood_type_id = 'Wood type is required';
    }
    
    if (!formData.seller_id) {
      newErrors.seller_id = 'Seller is required';
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
      
      // Redirect after successful submission
      navigate('/products');
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
    return <div className="text-center p-6">Loading product data...</div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/products')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <FiArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Product' : 'Add Product'}</h1>
      </div>
      
      <div className="bg-white shadow-md rounded-md p-6">
        {errors.form && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {errors.form}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
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
                placeholder="Enter product title"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="price">
                Price ($) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full p-2 border rounded-md ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter price"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="volume">
                Volume (m³) *
              </label>
              <input
                type="number"
                id="volume"
                name="volume"
                value={formData.volume}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full p-2 border rounded-md ${errors.volume ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter volume"
              />
              {errors.volume && <p className="text-red-500 text-sm mt-1">{errors.volume}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="wood_type_id">
                Wood Type *
              </label>
              <select
                id="wood_type_id"
                name="wood_type_id"
                value={formData.wood_type_id}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.wood_type_id ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select Wood Type</option>
                {woodTypes?.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.neme}
                  </option>
                ))}
              </select>
              {errors.wood_type_id && <p className="text-red-500 text-sm mt-1">{errors.wood_type_id}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="seller_id">
                Seller *
              </label>
              <select
                id="seller_id"
                name="seller_id"
                value={formData.seller_id}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.seller_id ? 'border-red-500' : 'border-gray-300'}`}
                disabled={!!sellerIdFromQuery}
              >
                <option value="">Select Seller</option>
                {sellers?.map((seller) => (
                  <option key={seller.id} value={seller.id}>
                    {seller.name}
                  </option>
                ))}
              </select>
              {errors.seller_id && <p className="text-red-500 text-sm mt-1">{errors.seller_id}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="descrioption">
                Description
              </label>
              <textarea
                id="descrioption"
                name="descrioption"
                value={formData.descrioption}
                onChange={handleChange}
                rows="4"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter product description"
              ></textarea>
            </div>
            
            <div>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="delivery_possible"
                  name="delivery_possible"
                  checked={formData.delivery_possible}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="ml-2 block text-gray-700" htmlFor="delivery_possible">
                  Delivery Available
                </label>
              </div>
              
              {formData.delivery_possible && (
                <div className="mt-2">
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="pickup_location">
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    id="pickup_location"
                    name="pickup_location"
                    value={formData.pickup_location}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter pickup location"
                  />
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Product Image
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="text-center">
                      <FiUpload className="mx-auto text-gray-400" size={24} />
                      <p className="text-xs text-gray-500 mt-1">Upload Image</p>
                    </div>
                  )}
                </label>
                <div className="text-sm text-gray-500">
                  <p>Recommended size: 800x600 pixels</p>
                  <p>Max file size: 5MB</p>
                  <p>Formats: JPG, PNG</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/products')}
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
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
