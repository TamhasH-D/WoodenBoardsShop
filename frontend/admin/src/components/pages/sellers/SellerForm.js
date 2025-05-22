import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

// This is a placeholder component. In a real implementation, you would:
// 1. Fetch data from your API for editing
// 2. Implement form submission to create/update
// 3. Add proper form validation
// 4. Add error handling

const SellerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    isOnline: false,
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // For edit mode, fetch the seller data
  const { data: sellerData, isLoading } = useQuery(
    ['seller', id],
    async () => {
      // Simulate API call for edit mode
      return {
        id,
        name: 'Wood Crafters Inc.',
        email: 'contact@woodcrafters.com',
        phone: '+1234567890',
        address: '456 Forest Ave, Woodland, USA',
        description: 'Specializing in high-quality wooden pallets and custom wood products.',
        isOnline: true,
      };
    },
    {
      enabled: isEditMode,
      onSuccess: (data) => {
        if (data) {
          setFormData({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            description: data.description || '',
            isOnline: data.isOnline || false,
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
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
      navigate('/sellers');
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
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                Company Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter company name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="phone">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter phone number"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="address">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter address"
              ></textarea>
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
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter company description"
              ></textarea>
            </div>
            
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isOnline"
                  name="isOnline"
                  checked={formData.isOnline}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="ml-2 block text-gray-700" htmlFor="isOnline">
                  Online Status
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Set the seller as online or offline
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/sellers')}
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
              {isSubmitting ? 'Saving...' : 'Save Seller'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerForm;
