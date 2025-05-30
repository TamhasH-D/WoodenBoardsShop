import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FiSave, FiArrowLeft, FiUpload } from 'react-icons/fi';
import apiService from '../apiService';

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;
  const sellerId = localStorage.getItem('sellerId') || 'demo-seller-id'; // Replace with actual auth logic

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
    defaultValues: {
      title: '',
      descrioption: '',
      volume: '',
      price: '',
      delivery_possible: false,
      pickup_location: '',
      wood_type_id: '',
    }
  });

  // Fetch wood types
  const { data: woodTypesData, isLoading: isLoadingWoodTypes } = useQuery({
    queryKey: ['woodTypes'],
    queryFn: () => apiService.getWoodTypes({ limit: 100 }),
  });

  // Fetch product data if in edit mode
  const { data: productData, isLoading: isLoadingProduct, error: productError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => apiService.getProduct(id),
    enabled: isEditMode,
  });

  // Set form values when product data is loaded
  useEffect(() => {
    if (productData?.data && isEditMode) {
      const product = productData.data;
      reset({
        title: product.title || '',
        descrioption: product.descrioption || '',
        volume: product.volume || '',
        price: product.price || '',
        delivery_possible: product.delivery_possible || false,
        pickup_location: product.pickup_location || '',
        wood_type_id: product.wood_type_id || '',
      });
    }
  }, [productData, isEditMode, reset]);
  
  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: (data) => apiService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerProducts'] });
      toast.success('Товар успешно создан');
      navigate('/products');
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast.error(`Ошибка при создании товара: ${error.message}`);
      setIsSubmitting(false);
    }
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: (data) => apiService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerProducts'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      toast.success('Товар успешно обновлен');
      navigate('/products');
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast.error(`Ошибка при обновлении товара: ${error.message}`);
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data) => {
    setIsSubmitting(true);

    // Convert string values to appropriate types
    const formattedData = {
      ...data,
      volume: parseFloat(data.volume),
      price: parseFloat(data.price),
      seller_id: sellerId,
    };

    if (isEditMode) {
      updateProductMutation.mutate(formattedData);
    } else {
      createProductMutation.mutate(formattedData);
    }
  };
  
  // Handle image upload (placeholder for future implementation)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      // Here you would typically upload the image to your server/storage
      toast.info('Загрузка изображений будет доступна в будущих обновлениях');
    }
  };
  
  const isLoading = isLoadingWoodTypes || (isEditMode && isLoadingProduct);

  // Handle errors
  if (productError && isEditMode) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ошибка загрузки товара</h3>
          <p className="text-gray-600 mb-4">{productError.message}</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-80"
          >
            Вернуться к списку товаров
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/products')}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-brand-primary font-heading">
            {isEditMode ? 'Редактирование товара' : 'Создание нового товара'}
          </h1>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка данных...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">Название товара *</label>
              <input
                type="text"
                {...register('title', { required: 'Название товара обязательно' })}
                className={`w-full p-2 border rounded-lg ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Введите название товара"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">Описание</label>
              <textarea
                {...register('descrioption')}
                rows="4"
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Введите описание товара"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Объем (м³) *</label>
              <input
                type="number"
                step="0.01"
                {...register('volume', { 
                  required: 'Объем обязателен',
                  min: { value: 0.01, message: 'Объем должен быть больше 0' }
                })}
                className={`w-full p-2 border rounded-lg ${errors.volume ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Например: 1.5"
              />
              {errors.volume && <p className="text-red-500 text-sm mt-1">{errors.volume.message}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Цена (₽) *</label>
              <input
                type="number"
                step="0.01"
                {...register('price', { 
                  required: 'Цена обязательна',
                  min: { value: 0.01, message: 'Цена должна быть больше 0' }
                })}
                className={`w-full p-2 border rounded-lg ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Например: 1000"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Тип древесины *</label>
              <select
                {...register('wood_type_id', { required: 'Выберите тип древесины' })}
                className={`w-full p-2 border rounded-lg ${errors.wood_type_id ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Выберите тип древесины</option>
                {woodTypesData?.data?.map(type => (
                  <option key={type.id} value={type.id}>{type.neme}</option>
                ))}
              </select>
              {errors.wood_type_id && <p className="text-red-500 text-sm mt-1">{errors.wood_type_id.message}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Возможность доставки</label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="delivery_possible"
                  {...register('delivery_possible')}
                  className="w-5 h-5 text-brand-accent"
                />
                <label htmlFor="delivery_possible" className="ml-2">Доставка доступна</label>
              </div>
            </div>
            
            {watch('delivery_possible') && (
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">Место самовывоза</label>
                <input
                  type="text"
                  {...register('pickup_location')}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Укажите адрес самовывоза"
                />
              </div>
            )}
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">Изображение товара</label>
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
                      <p className="text-xs text-gray-500 mt-1">Загрузить</p>
                    </div>
                  )}
                </label>
                <div className="text-sm text-gray-500">
                  <p>Рекомендуемый размер: 800x600 пикселей</p>
                  <p>Максимальный размер файла: 5MB</p>
                  <p>Поддерживаемые форматы: JPG, PNG</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="px-4 py-2 border border-gray-300 rounded-lg mr-4 hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-accent hover:bg-opacity-80 text-white font-bold py-2 px-6 rounded-lg transition duration-300 flex items-center"
            >
              <FiSave className="mr-2" />
              {isSubmitting ? 'Сохранение...' : (isEditMode ? 'Обновить товар' : 'Создать товар')}
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
}

export default ProductForm;
