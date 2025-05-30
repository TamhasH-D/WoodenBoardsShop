import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiSave, FiUpload } from 'react-icons/fi';
import apiService from '../../../apiService';
import FormField from '../../common/FormField';
import config from '../../../config';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const queryParams = new URLSearchParams(location.search);
  const sellerIdFromQuery = queryParams.get('seller_id');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    volume: '',
    wood_type_id: '',
    seller_id: sellerIdFromQuery || '',
    delivery_possible: false,
    pickup_location: '',
  });

  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Fetch product data if in edit mode
  const { data: productData, isLoading: isLoadingProduct } = useQuery(
    ['product', id],
    () => apiService.getProduct(id),
    {
      enabled: isEditMode,
      onSuccess: (data) => {
        if (data && data.data) {
          const product = data.data;
          setFormData({
            title: product.title || '',
            description: product.description || '',
            price: product.price || '',
            volume: product.volume || '',
            wood_type_id: product.wood_type?.id || '',
            seller_id: product.seller?.id || '',
            delivery_possible: product.delivery_possible || false,
            pickup_location: product.pickup_location || '',
          });
          if (product.images && product.images.length > 0) {
            setImagePreview(`${config.api.baseURL.replace('/api/v1', '')}${product.images[0].url}`);
          }
        }
      },
      onError: (error) => {
        toast.error(`Error fetching product: ${error.message}`);
        navigate('/products');
      },
    }
  );

  // Fetch wood types for dropdown
  const { data: woodTypesData, isLoading: isLoadingWoodTypes } = useQuery('woodTypesAll', 
    () => apiService.getWoodTypes({ per_page: -1 }) // Fetch all
  );
  const woodTypes = woodTypesData?.data?.items || [];

  // Fetch sellers for dropdown
  const { data: sellersData, isLoading: isLoadingSellers } = useQuery('sellersAll', 
    () => apiService.getSellers({ per_page: -1 }) // Fetch all
  );
  const sellers = sellersData?.data?.items || [];

  const createProductMutation = useMutation(
    (productData) => apiService.createProduct(productData),
    {
      onSuccess: async (data) => {
        toast.success('Product created successfully!');
        if (selectedImageFile && data && data.data && data.data.id) {
          await uploadImageMutation.mutateAsync({ productId: data.data.id, imageFile: selectedImageFile });
        }
        queryClient.invalidateQueries('products');
        navigate('/products');
      },
      onError: (error) => {
        toast.error(`Error creating product: ${error.message}`);
        setErrors(error.response?.data?.errors || {});
      },
    }
  );

  const updateProductMutation = useMutation(
    ({ id, productData }) => apiService.updateProduct(id, productData),
    {
      onSuccess: async (data) => {
        toast.success('Product updated successfully!');
        if (selectedImageFile && data && data.data && data.data.id) {
          // Optionally delete old image first if API supports it, then upload new one
          // For simplicity, just uploading new one. Consider image management strategy.
          await uploadImageMutation.mutateAsync({ productId: data.data.id, imageFile: selectedImageFile });
        }
        queryClient.invalidateQueries('products');
        queryClient.invalidateQueries(['product', id]);
        navigate('/products');
      },
      onError: (error) => {
        toast.error(`Error updating product: ${error.message}`);
        setErrors(error.response?.data?.errors || {});
      },
    }
  );

  const uploadImageMutation = useMutation(
    ({ productId, imageFile }) => {
      const imageFormData = new FormData();
      imageFormData.append('image', imageFile);
      imageFormData.append('title', imageFile.name);
      imageFormData.append('type', 'product');
      imageFormData.append('related_id', productId);
      return apiService.createImage(imageFormData);
    },
    {
      onSuccess: () => {
        toast.success('Image uploaded successfully!');
        queryClient.invalidateQueries(['product', id]); // Re-fetch product to show new image
      },
      onError: (error) => {
        toast.error(`Error uploading image: ${error.message}`);
      },
    }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    if (!formData.volume || isNaN(formData.volume) || parseFloat(formData.volume) <= 0) {
      newErrors.volume = 'Volume must be a positive number';
    }
    if (!formData.wood_type_id) newErrors.wood_type_id = 'Wood type is required';
    if (!formData.seller_id) newErrors.seller_id = 'Seller is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the form errors.');
      return;
    }

    const productPayload = {
      ...formData,
      price: parseFloat(formData.price),
      volume: parseFloat(formData.volume),
    };

    if (isEditMode) {
      updateProductMutation.mutate({ id, productData: productPayload });
    } else {
      createProductMutation.mutate(productPayload);
    }
  };

  const isLoading = isLoadingProduct || isLoadingWoodTypes || isLoadingSellers || 
                    createProductMutation.isLoading || updateProductMutation.isLoading || uploadImageMutation.isLoading;

  if (isEditMode && isLoadingProduct) {
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
                    {type.name}
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
                    onChange={handleImageChange}
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
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FiSave className="mr-2" />
              {isLoading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
