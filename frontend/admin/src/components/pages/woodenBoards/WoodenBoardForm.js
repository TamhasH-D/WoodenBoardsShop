import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query'; // MODIFIED
import { FiArrowLeft, FiSave, FiUpload } from 'react-icons/fi';
import apiService from '../../../apiService';
import toast from 'react-hot-toast'; // ADDED

// MODIFIED: Comments below are now less relevant as we are implementing these features.
// 1. Fetch data from your API for editing - Implemented
// 2. Implement form submission to create/update - Implemented
// 3. Add proper form validation - Existing, retained
// 4. Add error handling - Enhanced with API errors
// 5. Implement image upload functionality - Basic implementation added

const WoodenBoardForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient(); // ADDED
  const isEditMode = !!id;
  
  const queryParams = new URLSearchParams(location.search);
  const woodTypeIdFromQuery = queryParams.get('woodType');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    wood_type_id: woodTypeIdFromQuery || '',
    length: '',
    width: '',
    thickness: '',
    price: '',
    in_stock: '',
  });
  
  const [errors, setErrors] = useState({});
  // const [isSubmitting, setIsSubmitting] = useState(false); // REMOVED: Handled by useMutation's isLoading state
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null); // ADDED: For storing the actual image file object
  
  // Fetch wood types for dropdown
  const { data: woodTypes, isLoading: isLoadingWoodTypes } = useQuery( // MODIFIED
    'woodTypes', 
    apiService.getWoodTypes, // MODIFIED to use apiService
    {
      onError: (error) => { // ADDED error handling
        toast.error(error.message || 'Failed to fetch wood types.');
      }
    }
  );
  
  // For edit mode, fetch the board data
  const { data: boardData, isLoading: isLoadingBoard } = useQuery( // MODIFIED isLoading variable name for clarity
    ['woodenBoard', id],
    () => apiService.getWoodenBoard(id), // MODIFIED to use apiService
    {
      enabled: isEditMode,
      onSuccess: (data) => {
        if (data) {
          setFormData({
            title: data.title || '',
            description: data.description || '',
            wood_type_id: data.wood_type?.id || data.wood_type_id || '', // MODIFIED: Handle nested wood_type object or direct ID
            length: data.length || '',
            width: data.width || '',
            thickness: data.thickness || '',
            price: data.price || '',
            in_stock: data.in_stock || '',
          });
          
          // MODIFIED: Assuming API returns images array with URLs or a single image_url field
          if (data.images && data.images.length > 0 && data.images[0].url) {
            setImagePreview(data.images[0].url);
          } else if (data.image_url) { // Fallback for a single image_url
             setImagePreview(data.image_url);
          }
        }
      },
      onError: (error) => { // ADDED error handling
        toast.error(error.message || `Failed to fetch wooden board data (ID: ${id}).`);
        // Optionally navigate away if board data fails to load in edit mode
        // navigate('/wooden-boards'); 
      }
    }
  );

  // ADDED Mutations for create and update operations
  const createBoardMutation = useMutation(
    (boardPayload) => apiService.createWoodenBoard(boardPayload),
    {
      onSuccess: () => {
        toast.success('Wooden board created successfully!');
        queryClient.invalidateQueries('woodenBoards'); // Invalidate list to refetch
        navigate('/wooden-boards');
      },
      onError: (error) => {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to create wooden board.';
        toast.error(errorMsg);
        // Set form-level and field-specific errors if provided by API
        setErrors(prevErrors => ({ ...prevErrors, form: errorMsg, ...(error.response?.data?.errors || {}) }));
      },
    }
  );

  const updateBoardMutation = useMutation(
    (boardPayload) => apiService.updateWoodenBoard(id, boardPayload),
    {
      onSuccess: () => {
        toast.success('Wooden board updated successfully!');
        queryClient.invalidateQueries('woodenBoards'); // Invalidate list
        queryClient.invalidateQueries(['woodenBoard', id]); // Invalidate specific board data
        navigate('/wooden-boards');
      },
      onError: (error) => {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to update wooden board.';
        toast.error(errorMsg);
        setErrors(prevErrors => ({ ...prevErrors, form: errorMsg, ...(error.response?.data?.errors || {}) }));
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
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  const handleImageUpload = (e) => { // MODIFIED to store File object
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // Store the actual File object
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Set preview (data URL)
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null); // Clear file if selection is cancelled
      setImagePreview(null);
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.wood_type_id) {
      newErrors.wood_type_id = 'Wood type is required';
    }
    
    if (!formData.length) {
      newErrors.length = 'Length is required';
    } else if (isNaN(formData.length) || parseFloat(formData.length) <= 0) {
      newErrors.length = 'Length must be a positive number';
    }
    
    if (!formData.width) {
      newErrors.width = 'Width is required';
    } else if (isNaN(formData.width) || parseFloat(formData.width) <= 0) {
      newErrors.width = 'Width must be a positive number';
    }
    
    if (!formData.thickness) {
      newErrors.thickness = 'Thickness is required';
    } else if (isNaN(formData.thickness) || parseFloat(formData.thickness) <= 0) {
      newErrors.thickness = 'Thickness must be a positive number';
    }
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (!formData.in_stock) {
      newErrors.in_stock = 'Stock quantity is required';
    } else if (isNaN(formData.in_stock) || parseInt(formData.in_stock) < 0) {
      newErrors.in_stock = 'Stock quantity must be a non-negative number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => { // MODIFIED to use mutations and handle image file
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    let submissionPayload = { ...formData };

    // Ensure numeric types are correctly formatted before submission
    submissionPayload.length = parseFloat(submissionPayload.length);
    submissionPayload.width = parseFloat(submissionPayload.width);
    submissionPayload.thickness = parseFloat(submissionPayload.thickness);
    submissionPayload.price = parseFloat(submissionPayload.price);
    submissionPayload.in_stock = parseInt(submissionPayload.in_stock, 10);

    // If an image file is selected, prepare FormData for submission
    if (imageFile) {
      const dataForApi = new FormData();
      // Append all form data fields to FormData
      Object.keys(submissionPayload).forEach(key => {
        dataForApi.append(key, submissionPayload[key]);
      });
      dataForApi.append('image', imageFile); // 'image' is a common field name for the file
      submissionPayload = dataForApi;
    } else if (isEditMode && !imagePreview && boardData?.image_url) {
      // If in edit mode, image was present, and now cleared (imagePreview is null)
      // API might require explicit nullification or sending an empty string for the image field.
      // This depends on API design. For example:
      // if (submissionPayload instanceof FormData) submissionPayload.append('image', '');
      // else submissionPayload.image = null; 
    }
    // If not FormData (no new image), submissionPayload remains a plain object.
    // API service methods (createWoodenBoard, updateWoodenBoard) should be designed
    // to handle both plain objects and FormData.

    if (isEditMode) {
      updateBoardMutation.mutate(submissionPayload);
    } else {
      createBoardMutation.mutate(submissionPayload);
    }
  };
  
  if ((isEditMode && isLoadingBoard) || isLoadingWoodTypes) { // MODIFIED: Check both loading states
    return <div className="text-center p-6">Loading data...</div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/wooden-boards')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <FiArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Wooden Board' : 'Add Wooden Board'}</h1>
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
                placeholder="Enter board title"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
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
                disabled={!!woodTypeIdFromQuery || isLoadingWoodTypes}
              >
                <option value="">Select Wood Type</option>
                {/* MODIFIED: Assuming woodTypes is an array from apiService.getWoodTypes, corrected 'neme' to 'name' */}
                {woodTypes?.map((type) => ( 
                  <option key={type.id} value={type.id}>
                    {type.name} 
                  </option>
                ))}
              </select>
              {errors.wood_type_id && <p className="text-red-500 text-sm mt-1">{errors.wood_type_id}</p>}
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-2">Dimensions (mm)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="thickness">
                    Thickness *
                  </label>
                  <input
                    type="number"
                    id="thickness"
                    name="thickness"
                    value={formData.thickness}
                    onChange={handleChange}
                    min="1"
                    className={`w-full p-2 border rounded-md ${errors.thickness ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter thickness"
                  />
                  {errors.thickness && <p className="text-red-500 text-sm mt-1">{errors.thickness}</p>}
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="width">
                    Width *
                  </label>
                  <input
                    type="number"
                    id="width"
                    name="width"
                    value={formData.width}
                    onChange={handleChange}
                    min="1"
                    className={`w-full p-2 border rounded-md ${errors.width ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter width"
                  />
                  {errors.width && <p className="text-red-500 text-sm mt-1">{errors.width}</p>}
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="length">
                    Length *
                  </label>
                  <input
                    type="number"
                    id="length"
                    name="length"
                    value={formData.length}
                    onChange={handleChange}
                    min="1"
                    className={`w-full p-2 border rounded-md ${errors.length ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter length"
                  />
                  {errors.length && <p className="text-red-500 text-sm mt-1">{errors.length}</p>}
                </div>
              </div>
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
              <label className="block text-gray-700 font-medium mb-2" htmlFor="in_stock">
                In Stock *
              </label>
              <input
                type="number"
                id="in_stock"
                name="in_stock"
                value={formData.in_stock}
                onChange={handleChange}
                min="0"
                className={`w-full p-2 border rounded-md ${errors.in_stock ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter stock quantity"
              />
              {errors.in_stock && <p className="text-red-500 text-sm mt-1">{errors.in_stock}</p>}
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
                placeholder="Enter board description"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Board Image
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
              onClick={() => navigate('/wooden-boards')}
              className="mr-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createBoardMutation.isLoading || updateBoardMutation.isLoading} // MODIFIED to use mutation isLoading state
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FiSave className="mr-2" />
              {createBoardMutation.isLoading || updateBoardMutation.isLoading ? 'Saving...' : 'Save Board'} {/* MODIFIED to use mutation isLoading state */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WoodenBoardForm;
