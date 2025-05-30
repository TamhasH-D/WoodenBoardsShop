import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import apiService from '../../../apiService';
import FormField from '../../common/FormField';
import CheckboxField from '../../common/CheckboxField';

const SellerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '', // This will be part of the user object
    phone: '',
    address: '',
    description: '',
    is_online: false, // API uses is_online
    // user_id: '', // If you need to associate with an existing user
  });

  const [errors, setErrors] = useState({});

  // Fetch seller data if in edit mode
  const { data: sellerData, isLoading: isLoadingSeller } = useQuery(
    ['seller', id],
    () => apiService.getSeller(id),
    {
      enabled: isEditMode,
      onSuccess: (data) => {
        if (data && data.data) {
          const seller = data.data;
          setFormData({
            name: seller.name || '',
            email: seller.user?.email || '', // Assuming email is part of the nested user object
            phone: seller.phone || '',
            address: seller.address || '',
            description: seller.description || '',
            is_online: seller.is_online || false,
            // user_id: seller.user_id || '',
          });
        }
      },
      onError: (error) => {
        toast.error(`Error fetching seller: ${error.message}`);
        navigate('/sellers');
      },
    }
  );

  const createSellerMutation = useMutation(
    (sellerData) => apiService.createSeller(sellerData),
    {
      onSuccess: () => {
        toast.success('Seller created successfully!');
        queryClient.invalidateQueries('sellers');
        navigate('/sellers');
      },
      onError: (error) => {
        toast.error(`Error creating seller: ${error.message}`);
        setErrors(error.response?.data?.errors || {});
      },
    }
  );

  const updateSellerMutation = useMutation(
    ({ id, sellerData }) => apiService.updateSeller(id, sellerData),
    {
      onSuccess: () => {
        toast.success('Seller updated successfully!');
        queryClient.invalidateQueries('sellers');
        queryClient.invalidateQueries(['seller', id]);
        navigate('/sellers');
      },
      onError: (error) => {
        toast.error(`Error updating seller: ${error.message}`);
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
    if (!formData.name.trim()) newErrors.name = 'Company Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    // Add other validations as needed
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the form errors.');
      return;
    }

    const sellerPayload = {
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      description: formData.description,
      is_online: formData.is_online,
      email: formData.email, // API expects email for user creation/linking
      // user_id: formData.user_id, // If linking to an existing user by ID
    };

    if (isEditMode) {
      updateSellerMutation.mutate({ id, sellerData: sellerPayload });
    } else {
      createSellerMutation.mutate(sellerPayload);
    }
  };

  const isLoading = isLoadingSeller || createSellerMutation.isLoading || updateSellerMutation.isLoading;

  if (isEditMode && isLoadingSeller) {
    return <div className="text-center p-6">Loading seller data...</div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/sellers')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <FiArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Seller' : 'Add Seller'}</h1>
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
              label="Company Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Enter company name"
              required
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Enter email address for the user account"
              required
            />
            <FormField
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="Enter phone number"
            />
            <FormField
              label="Address"
              name="address"
              type="textarea"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              placeholder="Enter address"
              className="md:col-span-2"
            />
            <FormField
              label="Description"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
              placeholder="Enter a description for the seller"
              className="md:col-span-2"
              rows={4}
            />
            <CheckboxField
              label="Seller is Online"
              name="is_online" // Changed from isOnline to is_online
              checked={formData.is_online}
              onChange={handleChange}
              className="md:col-span-2"
            />
            {/* If you need to link to an existing user by ID */}
            {/* <FormField
              label="User ID (Optional)"
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              error={errors.user_id}
              placeholder="Enter existing User ID if applicable"
            /> */}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/sellers')}
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
              {isLoading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Seller')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerForm;
