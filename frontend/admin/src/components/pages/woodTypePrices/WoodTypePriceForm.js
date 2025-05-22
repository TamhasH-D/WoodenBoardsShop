import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

// This is a placeholder component. In a real implementation, you would:
// 1. Fetch data from your API for editing
// 2. Implement form submission to create/update
// 3. Add proper form validation
// 4. Add error handling

const WoodTypePriceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!id;
  
  // Get wood type ID from query params if available
  const queryParams = new URLSearchParams(location.search);
  const woodTypeIdFromQuery = queryParams.get('woodType');
  
  const [formData, setFormData] = useState({
    wood_type_id: woodTypeIdFromQuery || '',
    price_per_cubic_meter: '',
    min_order_volume: '',
    effective_date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    expiration_date: '',
    is_active: true,
    notes: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  // For edit mode, fetch the price data
  const { data: priceData, isLoading } = useQuery(
    ['woodTypePrice', id],
    async () => {
      // Simulate API call for edit mode
      return {
        id,
        wood_type_id: '1',
        price_per_cubic_meter: 300.00,
        min_order_volume: 0.5,
        effective_date: '2023-01-01',
        expiration_date: '2023-12-31',
        is_active: true,
        notes: 'Standard pricing for pine wood in 2023.'
      };
    },
    {
      enabled: isEditMode,
      onSuccess: (data) => {
        if (data) {
          setFormData({
            wood_type_id: data.wood_type_id || '',
            price_per_cubic_meter: data.price_per_cubic_meter || '',
            min_order_volume: data.min_order_volume || '',
            effective_date: data.effective_date || '',
            expiration_date: data.expiration_date || '',
            is_active: data.is_active || false,
            notes: data.notes || '',
          });
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
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.wood_type_id) {
      newErrors.wood_type_id = 'Wood type is required';
    }
    
    if (!formData.price_per_cubic_meter) {
      newErrors.price_per_cubic_meter = 'Price is required';
    } else if (isNaN(formData.price_per_cubic_meter) || parseFloat(formData.price_per_cubic_meter) <= 0) {
      newErrors.price_per_cubic_meter = 'Price must be a positive number';
    }
    
    if (!formData.min_order_volume) {
      newErrors.min_order_volume = 'Minimum order volume is required';
    } else if (isNaN(formData.min_order_volume) || parseFloat(formData.min_order_volume) <= 0) {
      newErrors.min_order_volume = 'Minimum order volume must be a positive number';
    }
    
    if (!formData.effective_date) {
      newErrors.effective_date = 'Effective date is required';
    }
    
    if (formData.effective_date && formData.expiration_date && 
        new Date(formData.effective_date) > new Date(formData.expiration_date)) {
      newErrors.expiration_date = 'Expiration date must be after effective date';
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
      navigate('/wood-type-prices');
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
    return <div className="text-center p-6">Loading price data...</div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/wood-type-prices')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <FiArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Wood Type Price' : 'Add Wood Type Price'}</h1>
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
              <label className="block text-gray-700 font-medium mb-2" htmlFor="wood_type_id">
                Wood Type *
              </label>
              <select
                id="wood_type_id"
                name="wood_type_id"
                value={formData.wood_type_id}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.wood_type_id ? 'border-red-500' : 'border-gray-300'}`}
                disabled={!!woodTypeIdFromQuery}
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
              <label className="block text-gray-700 font-medium mb-2" htmlFor="price_per_cubic_meter">
                Price per Cubic Meter ($) *
              </label>
              <input
                type="number"
                id="price_per_cubic_meter"
                name="price_per_cubic_meter"
                value={formData.price_per_cubic_meter}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full p-2 border rounded-md ${errors.price_per_cubic_meter ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter price per cubic meter"
              />
              {errors.price_per_cubic_meter && <p className="text-red-500 text-sm mt-1">{errors.price_per_cubic_meter}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="min_order_volume">
                Minimum Order Volume (m³) *
              </label>
              <input
                type="number"
                id="min_order_volume"
                name="min_order_volume"
                value={formData.min_order_volume}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full p-2 border rounded-md ${errors.min_order_volume ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter minimum order volume"
              />
              {errors.min_order_volume && <p className="text-red-500 text-sm mt-1">{errors.min_order_volume}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="effective_date">
                Effective Date *
              </label>
              <input
                type="date"
                id="effective_date"
                name="effective_date"
                value={formData.effective_date}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.effective_date ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.effective_date && <p className="text-red-500 text-sm mt-1">{errors.effective_date}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="expiration_date">
                Expiration Date
              </label>
              <input
                type="date"
                id="expiration_date"
                name="expiration_date"
                value={formData.expiration_date}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.expiration_date ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.expiration_date && <p className="text-red-500 text-sm mt-1">{errors.expiration_date}</p>}
            </div>
            
            <div>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="ml-2 block text-gray-700" htmlFor="is_active">
                  Active
                </label>
              </div>
              <p className="text-sm text-gray-500">
                Only active prices will be used for calculations
              </p>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="notes">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter any additional notes"
              ></textarea>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/wood-type-prices')}
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
              {isSubmitting ? 'Saving...' : 'Save Price'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WoodTypePriceForm;
