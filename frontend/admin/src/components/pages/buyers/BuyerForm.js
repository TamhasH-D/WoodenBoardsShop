import React, { useState, useEffect } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import apiService from '../../../apiService';
import FormField from '../../common/FormField';

const BuyerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    // user_id: '', // If you need to associate with a user
  });

  const [errors, setErrors] = useState({});

  // Fetch buyer data if in edit mode
  const { data: buyerData, isLoading: isLoadingBuyer } = useQuery(
    ['buyer', id],
    () => apiService.getBuyer(id),
    {
      enabled: isEditMode,
      onSuccess: (data) => {
        if (data && data.data) {
          const buyer = data.data;
          setFormData({
            name: buyer.name || '',
            email: buyer.user?.email || '', // Assuming email is part of the nested user object
            phone: buyer.phone || '',
            address: buyer.address || '',
            // user_id: buyer.user_id || '',
          });
        }
      },
      onError: (error) => {
        toast.error(`Error fetching buyer: ${error.message}`);
        navigate('/buyers');
      },
    }
  );

  const createBuyerMutation = useMutation(
    (buyerData) => apiService.createBuyer(buyerData),
    {
      onSuccess: () => {
        toast.success('Buyer created successfully!');
        queryClient.invalidateQueries('buyers');
        navigate('/buyers');
      },
      onError: (error) => {
        toast.error(`Error creating buyer: ${error.message}`);
        setErrors(error.response?.data?.errors || {});
      },
    }
  );

  const updateBuyerMutation = useMutation(
    ({ id, buyerData }) => apiService.updateBuyer(id, buyerData),
    {
      onSuccess: () => {
        toast.success('Buyer updated successfully!');
        queryClient.invalidateQueries('buyers');
        queryClient.invalidateQueries(['buyer', id]);
        navigate('/buyers');
      },
      onError: (error) => {
        toast.error(`Error updating buyer: ${error.message}`);
        setErrors(error.response?.data?.errors || {});
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
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    // Add other validations as needed (e.g., phone format)
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the form errors.');
      return;
    }

    // For buyers, the API might expect user data separately or nested.
    // Adjust payload based on your API structure.
    // This example assumes 'email' might be part of a user object creation/update.
    // If your API creates/updates the user implicitly via the buyer endpoint, this is simpler.
    // If user_id is required and not handled by backend, you might need a user selection/creation step.

    const buyerPayload = {
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      // If your backend handles user creation/linking via email on buyer create/update:
      email: formData.email, 
      // Or, if you manage user_id separately:
      // user_id: formData.user_id 
    };

    if (isEditMode) {
      // For update, you might only send changed fields or the full payload
      // depending on your API (PATCH vs PUT)
      updateBuyerMutation.mutate({ id, buyerData: buyerPayload });
    } else {
      createBuyerMutation.mutate(buyerPayload);
    }
  };

  const isLoading = isLoadingBuyer || createBuyerMutation.isLoading || updateBuyerMutation.isLoading;

  if (isEditMode && isLoadingBuyer) {
    return <div className="text-center p-6">Loading buyer data...</div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/buyers')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <FiArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Buyer' : 'Add Buyer'}</h1>
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
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Enter buyer name"
              required
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Enter email address"
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
            {/* Example if user_id needs to be selected/entered manually */}
            {/* <FormField
              label="User ID (Optional)"
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              error={errors.user_id}
              placeholder="Enter existing User ID if applicable"
            /> */}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/buyers')}
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
              {isLoading ? 'Saving...' : 'Save Buyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyerForm;
