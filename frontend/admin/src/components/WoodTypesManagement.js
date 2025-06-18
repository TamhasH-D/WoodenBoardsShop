import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useToastContext } from '../hooks/useToast';
import { apiService } from '../services/api';
import FormField from './ui/FormField';
import Button from './ui/Button';

// Price validation schema (can stay outside if it doesn't need component scope)
const priceSchema = yup.object({
  wood_type_id: yup
    .string()
    .required('Выберите тип древесины'),
  price_per_m3: yup
    .number()
    .required('Цена за м³ обязательна')
    .positive('Цена должна быть положительным числом')
    .min(0.01, 'Минимальная цена 0.01 ₽')
    .max(1000000, 'Максимальная цена 1,000,000 ₽'),
});

const WoodTypesManagement = React.memo(() => {
  const [activeTab, setActiveTab] = useState('types');
  const [page, setPage] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddPriceForm, setShowAddPriceForm] = useState(false);

  // Toast notifications
  const toast = useToastContext();

  // API hooks for all wood types (for dropdown and validation)
  const allWoodTypesApiFunction = useMemo(() => () => apiService.getAllWoodTypes(), []);
  const { data: allWoodTypes, loading: allWoodTypesLoading, error: allWoodTypesError } = useApi(
    allWoodTypesApiFunction,
    []
  );

  // Log error for allWoodTypes
  useEffect(() => {
    if (allWoodTypesError) {
      console.error("Error fetching all wood types:", allWoodTypesError);
    }
  }, [allWoodTypesError]);

  // Wood type validation schema
  const woodTypeSchema = useMemo(() => yup.object({
    name: yup
      .string()
      .required('Название типа древесины обязательно')
      .min(2, 'Название должно содержать минимум 2 символа')
      .max(100, 'Название не должно превышать 100 символов')
      .test(
        'is-unique',
        'Тип древесины с таким названием уже существует',
        function (value) {
          if (!value) { // If value is empty, required rule will handle it
            return true;
          }
          if (!allWoodTypes || !allWoodTypes.data) {
            // If data isn't loaded yet, pass validation
            return true;
          }
          const lowercasedValue = value.toLowerCase();
          return !allWoodTypes.data.some(
            (type) => (type.neme || type.name)?.toLowerCase() === lowercasedValue
          );
        }
      ),
    description: yup
      .string()
      .max(500, 'Описание не должно превышать 500 символов')
      .nullable(),
  }), [allWoodTypes]);

  // Wood type form
  const woodTypeForm = useForm({
    resolver: yupResolver(woodTypeSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // Price form
  const priceForm = useForm({
    resolver: yupResolver(priceSchema),
    defaultValues: {
      wood_type_id: '',
      price_per_m3: '',
    },
  });

  // API hooks for wood types (paginated for display)
  const woodTypesApiFunction = useMemo(() => () => apiService.getWoodTypes(page, 10), [page]);
  const { data: woodTypes, loading: typesLoading, error: typesError, refetch: refetchTypes } = useApi(
    woodTypesApiFunction,
    [page]
  );

  // API hooks for prices
  const pricesApiFunction = useMemo(() => () => apiService.getWoodTypePrices(page, 10), [page]);
  const { data: prices, loading: pricesLoading, error: pricesError, refetch: refetchPrices } = useApi(
    pricesApiFunction,
    [page]
  );

  const { mutate, loading: mutating } = useApiMutation();

  // Wood type form handlers
  const handleAddWoodType = async (data) => {
    try {
      await toast.promise(
        mutate(() => apiService.createWoodType(data)),
        {
          loading: 'Создание типа древесины...',
          success: 'Тип древесины успешно создан',
          error: 'Ошибка при создании типа древесины',
        }
      );

      woodTypeForm.reset();
      setShowAddForm(false);
      refetchTypes();
      // Refresh all wood types for dropdown
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      // Error handled by toast.promise
    }
  };

  // Price form handlers
  const handleAddPrice = async (data) => {
    try {
      await toast.promise(
        mutate(() => apiService.createWoodTypePrice(data)),
        {
          loading: 'Добавление цены...',
          success: 'Цена успешно добавлена',
          error: 'Ошибка при добавлении цены',
        }
      );

      priceForm.reset();
      setShowAddPriceForm(false);
      refetchPrices();
    } catch (error) {
      // Error handled by toast.promise
    }
  };

  const handleDeleteWoodType = async (id) => {
    if (window.confirm('Are you sure you want to delete this wood type?')) {
      try {
        await mutate(() => apiService.deleteWoodType(id));
        refetchTypes();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleDeletePrice = async (id) => {
    if (window.confirm('Are you sure you want to delete this price?')) {
      try {
        await mutate(() => apiService.deleteWoodTypePrice(id));
        refetchPrices();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  // Helper variables for current tab data
  // const currentData = activeTab === 'types' ? woodTypes : prices;
  // const currentLoading = activeTab === 'types' ? typesLoading : pricesLoading;
  // const currentError = activeTab === 'types' ? typesError : pricesError;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Wood Types & Prices</h1>
        <p className="page-description">Manage system-wide wood types and pricing</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('types')}
          className={`btn ${activeTab === 'types' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Wood Types
        </button>
        <button
          onClick={() => setActiveTab('prices')}
          className={`btn ${activeTab === 'prices' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Prices
        </button>
      </div>

      {/* Error and Success Messages */}
      {mutationError && (
        <div className="error mb-4">
          <strong>Operation failed:</strong> {mutationError}
          <br />
          <small>
            This may be due to validation errors. Please check that all required fields are filled correctly.
            {mutationError.includes('422') && (
              <span>
                <br />
                <strong>Validation Error (422):</strong> The server rejected the request due to invalid data format.
              </span>
            )}
          </small>
        </div>
      )}

      {success && (
        <div className="success mb-4">
          <strong>Success:</strong> Operation completed successfully!
        </div>
      )}

      {activeTab === 'types' && (
        <div className="card mb-6">
          <div className="card-header">
            <h2 className="card-title">Wood Types</h2>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div>
              <p>Total wood types: {woodTypes?.total || 0}</p>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                variant={showAddForm ? 'secondary' : 'primary'}
              >
                {showAddForm ? 'Отмена' : 'Добавить тип древесины'}
              </Button>
              <Button
                onClick={refetchTypes}
                variant="secondary"
                loading={typesLoading}
                disabled={typesLoading}
              >
                Обновить
              </Button>
            </div>
          </div>

          {/* Professional Add Form */}
          {showAddForm && (
            <div className="card mb-4">
              <div className="card-header">
                <h3 className="card-title">Добавить новый тип древесины</h3>
              </div>
              <form onSubmit={woodTypeForm.handleSubmit(handleAddWoodType)} className="space-y-4">
                <FormField
                  label="Название типа древесины"
                  placeholder="Например: Дуб, Сосна, Береза"
                  required
                  error={woodTypeForm.formState.errors.name?.message}
                  {...woodTypeForm.register('name')}
                />

                <FormField
                  label="Описание"
                  type="textarea"
                  placeholder="Дополнительная информация о типе древесины"
                  rows={3}
                  error={woodTypeForm.formState.errors.description?.message}
                  {...woodTypeForm.register('description')}
                />

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={mutating}
                    disabled={!woodTypeForm.formState.isValid}
                  >
                    {mutating ? 'Создание...' : 'Создать тип древесины'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowAddForm(false);
                      woodTypeForm.reset();
                    }}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </div>
          )}

          {typesLoading && <div className="loading">Loading wood types...</div>}
          
          {typesError && (
            <div className="error">
              <strong>Failed to load wood types:</strong> {typesError}
            </div>
          )}

          {woodTypes && woodTypes.data && woodTypes.data.length > 0 ? (
            <div>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {woodTypes.data.map((type) => (
                    <tr key={type.id}>
                      <td>
                        <strong>{type.id.substring(0, 8)}...</strong>
                      </td>
                      <td>{type.neme || type.name}</td>
                      <td>{type.description || 'N/A'}</td>
                      <td>
                        {new Date(type.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteWoodType(type.id)}
                          className="btn btn-secondary"
                          disabled={mutating}
                          style={{ fontSize: '0.8em', padding: '0.25rem 0.5rem' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0 || typesLoading}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                <span>Page {page + 1}</span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!woodTypes?.data || woodTypes.data.length < 10 || typesLoading}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p>No wood types found.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary mt-4"
              >
                Add Your First Wood Type
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'prices' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Wood Type Prices</h2>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div>
              <p>Total prices: {prices?.total || 0}</p>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => setShowAddPriceForm(!showAddPriceForm)}
                variant={showAddPriceForm ? 'secondary' : 'primary'}
              >
                {showAddPriceForm ? 'Отмена' : 'Добавить цену'}
              </Button>
              <Button
                onClick={refetchPrices}
                variant="secondary"
                loading={pricesLoading}
                disabled={pricesLoading}
              >
                Обновить
              </Button>
            </div>
          </div>

          {/* Professional Add Price Form */}
          {showAddPriceForm && (
            <div className="card mb-4">
              <div className="card-header">
                <h3 className="card-title">Добавить новую цену</h3>
              </div>
              <form onSubmit={priceForm.handleSubmit(handleAddPrice)} className="space-y-4">
                <FormField
                  label="Тип древесины"
                  type="select"
                  placeholder="Выберите тип древесины"
                  required
                  loading={allWoodTypesLoading}
                  error={priceForm.formState.errors.wood_type_id?.message}
                  options={[
                    ...(allWoodTypes?.data?.map((type) => ({
                      value: type.id,
                      label: type.neme || type.name,
                    })) || [])
                  ]}
                  {...priceForm.register('wood_type_id')}
                />

                {allWoodTypesError && (
                  <div className="text-sm text-red-600">
                    Ошибка загрузки типов древесины: {allWoodTypesError}
                  </div>
                )}

                {allWoodTypes?.data?.length > 0 && (
                  <div className="text-sm text-green-600">
                    ✅ Доступно {allWoodTypes.data.length} типов древесины
                  </div>
                )}

                <FormField
                  label="Цена за м³ (₽)"
                  type="number"
                  placeholder="Введите цену"
                  step="0.01"
                  min="0.01"
                  max="1000000"
                  required
                  error={priceForm.formState.errors.price_per_m3?.message}
                  {...priceForm.register('price_per_m3', { valueAsNumber: true })}
                />

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={mutating}
                    disabled={!priceForm.formState.isValid}
                  >
                    {mutating ? 'Добавление...' : 'Добавить цену'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowAddPriceForm(false);
                      priceForm.reset();
                    }}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </div>
          )}

          {pricesLoading && <div className="loading">Loading prices...</div>}
          
          {pricesError && (
            <div className="error">
              <strong>Failed to load prices:</strong> {pricesError}
            </div>
          )}

          {prices && prices.data && prices.data.length > 0 ? (
            <div>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Wood Type</th>
                    <th>Price per m³</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.data.map((price) => (
                    <tr key={price.id}>
                      <td>
                        <strong>{price.id.substring(0, 8)}...</strong>
                      </td>
                      <td>{price.wood_type_id?.substring(0, 8)}...</td>
                      <td>€{price.price_per_m3?.toFixed(2) || 0}</td>
                      <td>
                        {new Date(price.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeletePrice(price.id)}
                          className="btn btn-secondary"
                          disabled={mutating}
                          style={{ fontSize: '0.8em', padding: '0.25rem 0.5rem' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0 || pricesLoading}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                <span>Page {page + 1}</span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!prices?.data || prices.data.length < 10 || pricesLoading}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p>No prices found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default WoodTypesManagement;
