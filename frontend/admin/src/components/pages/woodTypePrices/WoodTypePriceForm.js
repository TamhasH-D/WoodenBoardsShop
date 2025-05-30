import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import apiService from '../../../apiService';
import FormField from '../../common/FormField';
import CheckboxField from '../../common/CheckboxField';

const WoodTypePriceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const queryParams = new URLSearchParams(location.search);
  const woodTypeIdFromQuery = queryParams.get('woodType');

  const [formData, setFormData] = useState({
    wood_type_id: woodTypeIdFromQuery || '',
    price_per_cubic_meter: '',
    min_order_volume: '',
    effective_date: new Date().toISOString().split('T')[0],
    expiration_date: '',
    is_active: true,
    notes: '',
  });

  const [errors, setErrors] = useState({});

  // Fetch wood types for dropdown
  const { data: woodTypesData, isLoading: isLoadingWoodTypes } = useQuery(
    'woodTypes',
    apiService.getWoodTypes,
    {
      select: (data) => data?.data?.items || [], // Ensure we get the array of wood types
      onError: (error) => {
        toast.error(`Error fetching wood types: ${error.message}`);
      }
    }
  );

  // Fetch wood type price data if in edit mode
  const { data: priceData, isLoading: isLoadingPrice } = useQuery(
    ['woodTypePrice', id],
    () => apiService.getWoodTypePrice(id),
    {
      enabled: isEditMode,
      onSuccess: (data) => {
        if (data && data.data) {
          const price = data.data;
          setFormData({
            wood_type_id: price.wood_type_id || '',
            price_per_cubic_meter: price.price_per_cubic_meter || '',
            min_order_volume: price.min_order_volume || '',
            effective_date: price.effective_date ? new Date(price.effective_date).toISOString().split('T')[0] : '',
            expiration_date: price.expiration_date ? new Date(price.expiration_date).toISOString().split('T')[0] : '',
            is_active: price.is_active || false,
            notes: price.notes || '',
          });
        }
      },
      onError: (error) => {
        toast.error(`Error fetching wood type price: ${error.message}`);
        navigate('/wood-type-prices');
      },
    }
  );

  const createPriceMutation = useMutation(
    (priceData) => apiService.createWoodTypePrice(priceData),
    {
      onSuccess: () => {
        toast.success('Wood type price created successfully!');
        queryClient.invalidateQueries('woodTypePrices');
        navigate('/wood-type-prices');
      },
      onError: (error) => {
        toast.error(`Error creating price: ${error.message}`);
        setErrors(error.response?.data?.errors || {});
      },
    }
  );

  const updatePriceMutation = useMutation(
    ({ id, priceData }) => apiService.updateWoodTypePrice(id, priceData),
    {
      onSuccess: () => {
        toast.success('Wood type price updated successfully!');
        queryClient.invalidateQueries('woodTypePrices');
        queryClient.invalidateQueries(['woodTypePrice', id]);
        navigate('/wood-type-prices');
      },
      onError: (error) => {
        toast.error(`Error updating price: ${error.message}`);
        setErrors(error.response?.data?.errors || {});
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.wood_type_id) newErrors.wood_type_id = 'Wood type is required';
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
    if (!formData.effective_date) newErrors.effective_date = 'Effective date is required';
    if (formData.effective_date && formData.expiration_date && new Date(formData.effective_date) > new Date(formData.expiration_date)) {
      newErrors.expiration_date = 'Expiration date must be after effective date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the form errors.');
      return;
    }

    const payload = {
      ...formData,
      price_per_cubic_meter: parseFloat(formData.price_per_cubic_meter),
      min_order_volume: parseFloat(formData.min_order_volume),
      // Ensure dates are in YYYY-MM-DD or null if empty
      effective_date: formData.effective_date || null,
      expiration_date: formData.expiration_date || null,
    };

    if (isEditMode) {
      updatePriceMutation.mutate({ id, priceData: payload });
    } else {
      createPriceMutation.mutate(payload);
    }
  };

  const isLoading = isLoadingWoodTypes || isLoadingPrice || createPriceMutation.isLoading || updatePriceMutation.isLoading;

  if ((isEditMode && isLoadingPrice) || isLoadingWoodTypes) {
    return <div className="text-center p-6">Loading data...</div>;
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
            <FormField
              label="Wood Type"
              name="wood_type_id"
              type="select"
              value={formData.wood_type_id}
              onChange={handleChange}
              error={errors.wood_type_id}
              required
              disabled={!!woodTypeIdFromQuery || isLoadingWoodTypes}
              options={[
                { value: '', label: 'Select Wood Type' },
                ...(woodTypesData?.map((type) => ({ value: type.id, label: type.name })) || []) // Corrected 'neme' to 'name'
              ]}
            />
            <FormField
              label="Price per Cubic Meter"
              name="price_per_cubic_meter"
              type="number"
              value={formData.price_per_cubic_meter}
              onChange={handleChange}
              error={errors.price_per_cubic_meter}
              placeholder="e.g., 250.50"
              step="0.01"
              required
            />
            <FormField
              label="Minimum Order Volume (m³)"
              name="min_order_volume"
              type="number"
              value={formData.min_order_volume}
              onChange={handleChange}
              error={errors.min_order_volume}
              placeholder="e.g., 0.5"
              step="0.01"
              required
            />
            <FormField
              label="Effective Date"
              name="effective_date"
              type="date"
              value={formData.effective_date}
              onChange={handleChange}
              error={errors.effective_date}
              required
            />
            <FormField
              label="Expiration Date"
              name="expiration_date"
              type="date"
              value={formData.expiration_date}
              onChange={handleChange}
              error={errors.expiration_date}
            />
            <CheckboxField
              label="Price is Active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="md:col-span-2"
            />
            <FormField
              label="Notes"
              name="notes"
              type="textarea"
              value={formData.notes}
              onChange={handleChange}
              error={errors.notes}
              placeholder="Optional notes about this price entry"
              className="md:col-span-2"
              rows={3}
            />
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/wood-type-prices')}
              className="mr-4 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              disabled={isLoading}
            >
              <FiSave className="mr-2" />
              {isLoading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Price')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WoodTypePriceForm;
