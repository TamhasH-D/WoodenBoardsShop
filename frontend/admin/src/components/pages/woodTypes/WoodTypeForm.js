import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import FormField from '../../common/FormField';
import apiService from '../../../apiService';

const WoodTypeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    id: '',
    neme: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch wood type data if in edit mode
  const { data: woodTypeData, isLoading } = useQuery(
    ['woodType', id],
    () => apiService.getWoodType(id),
    {
      enabled: isEditMode,
      onError: (error) => {
        toast.error(`Ошибка при загрузке типа древесины: ${error.message}`);
        navigate('/wood-types');
      },
    }
  );

  // Create mutation
  const createMutation = useMutation(
    (data) => apiService.createWoodType(data),
    {
      onSuccess: () => {
        toast.success('Тип древесины успешно создан');
        queryClient.invalidateQueries('woodTypes');
        navigate('/wood-types');
      },
      onError: (error) => {
        toast.error(`Ошибка при создании типа древесины: ${error.message}`);
        setIsSubmitting(false);
      },
    }
  );

  // Update mutation
  const updateMutation = useMutation(
    (data) => apiService.updateWoodType(id, data),
    {
      onSuccess: () => {
        toast.success('Тип древесины успешно обновлен');
        queryClient.invalidateQueries(['woodTypes']);
        queryClient.invalidateQueries(['woodType', id]);
        navigate('/wood-types');
      },
      onError: (error) => {
        toast.error(`Ошибка при обновлении типа древесины: ${error.message}`);
        setIsSubmitting(false);
      },
    }
  );

  // Set form data when wood type data is loaded
  useEffect(() => {
    if (woodTypeData && woodTypeData.data) {
      setFormData({
        id: woodTypeData.data.id,
        neme: woodTypeData.data.neme || '',
        description: woodTypeData.data.description || '',
      });
    }
  }, [woodTypeData]);

  // Handle form input changes
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
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.neme.trim()) {
      newErrors.neme = 'Название обязательно';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const submitData = { ...formData };

    // For create mode, generate a new UUID
    if (!isEditMode) {
      submitData.id = uuidv4();
    }

    // For update mode, only send changed fields
    if (isEditMode) {
      const updateData = {};

      if (formData.neme !== woodTypeData.data.neme) {
        updateData.neme = formData.neme;
      }

      if (formData.description !== woodTypeData.data.description) {
        updateData.description = formData.description;
      }

      // If nothing changed, just navigate back
      if (Object.keys(updateData).length === 0) {
        toast.info('Нет изменений для сохранения');
        navigate('/wood-types');
        return;
      }

      updateMutation.mutate(updateData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  if (isEditMode && isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-24 bg-gray-200 rounded mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditMode ? 'Редактировать тип древесины' : 'Добавить тип древесины'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6">
        <FormField
          label="Название"
          name="neme"
          value={formData.neme}
          onChange={handleChange}
          error={errors.neme}
          required
        />

        <FormField
          label="Описание"
          name="description"
          type="textarea"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
        />

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => navigate('/wood-types')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Сохранение...
              </span>
            ) : (
              'Сохранить'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WoodTypeForm;
