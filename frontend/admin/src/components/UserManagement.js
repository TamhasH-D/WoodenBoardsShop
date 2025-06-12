import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useToastContext } from '../hooks/useToast';
import { apiService } from '../services/api';
import FormField from './ui/FormField';
import Button from './ui/Button';

// Validation schemas
const buyerSchema = yup.object({
  keycloak_uuid: yup
    .string()
    .required('Keycloak UUID обязателен')
    .min(10, 'UUID должен содержать минимум 10 символов')
    .max(100, 'UUID не должен превышать 100 символов'),
  is_online: yup.boolean().default(true),
});

const sellerSchema = yup.object({
  keycloak_uuid: yup
    .string()
    .required('Keycloak UUID обязателен')
    .min(10, 'UUID должен содержать минимум 10 символов')
    .max(100, 'UUID не должен превышать 100 символов'),
  is_online: yup.boolean().default(true),
  company_name: yup
    .string()
    .max(200, 'Название компании не должно превышать 200 символов')
    .nullable(),
  contact_email: yup
    .string()
    .email('Введите корректный email адрес')
    .max(100, 'Email не должен превышать 100 символов')
    .nullable(),
  contact_phone: yup
    .string()
    .max(20, 'Номер телефона не должен превышать 20 символов')
    .nullable(),
  business_address: yup
    .string()
    .max(300, 'Адрес не должен превышать 300 символов')
    .nullable(),
  business_description: yup
    .string()
    .max(500, 'Описание не должно превышать 500 символов')
    .nullable(),
});

const UserManagement = React.memo(() => {
  const [activeTab, setActiveTab] = useState('buyers');
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Toast notifications
  const toast = useToastContext();

  // Form setup with dynamic schema based on active tab
  const currentSchema = activeTab === 'buyers' ? buyerSchema : sellerSchema;

  const form = useForm({
    resolver: yupResolver(currentSchema),
    defaultValues: {
      keycloak_uuid: '',
      is_online: true,
      company_name: '',
      contact_email: '',
      contact_phone: '',
      business_address: '',
      business_description: '',
    },
  });

  // API hooks for buyers
  const { data: buyers, loading: buyersLoading, error: buyersError, refetch: refetchBuyers } = useApi(
    () => apiService.getBuyers(page, 10),
    [page]
  );

  // API hooks for sellers
  const { data: sellers, loading: sellersLoading, error: sellersError, refetch: refetchSellers } = useApi(
    () => apiService.getSellers(page, 10),
    [page]
  );

  const { mutate, loading: mutating } = useApiMutation();

  // Form handling functions
  const resetForm = useCallback(() => {
    form.reset();
    setEditingUser(null);
    setShowAddForm(false);
  }, [form]);

  const handleAddUser = useCallback(() => {
    resetForm();
    setShowAddForm(true);
  }, [resetForm]);

  const handleEditUser = useCallback((user) => {
    form.reset({
      keycloak_uuid: user.keycloak_uuid || '',
      is_online: user.is_online || false,
      company_name: user.company_name || '',
      contact_email: user.contact_email || '',
      contact_phone: user.contact_phone || '',
      business_address: user.business_address || '',
      business_description: user.business_description || ''
    });
    setEditingUser(user);
    setShowAddForm(true);
  }, [form]);

  const handleFormSubmit = useCallback(async (data) => {
    try {
      const userData = {
        keycloak_uuid: data.keycloak_uuid.trim(),
        is_online: data.is_online
      };

      // Add seller-specific fields
      if (activeTab === 'sellers') {
        if (data.company_name?.trim()) userData.company_name = data.company_name.trim();
        if (data.contact_email?.trim()) userData.contact_email = data.contact_email.trim();
        if (data.contact_phone?.trim()) userData.contact_phone = data.contact_phone.trim();
        if (data.business_address?.trim()) userData.business_address = data.business_address.trim();
        if (data.business_description?.trim()) userData.business_description = data.business_description.trim();
      }

      const operation = editingUser ? 'обновление' : 'создание';
      const userType = activeTab === 'buyers' ? 'покупателя' : 'продавца';

      await toast.promise(
        mutate(async () => {
          if (editingUser) {
            // Update existing user
            if (activeTab === 'buyers') {
              await apiService.updateBuyer(editingUser.id, userData);
              refetchBuyers();
            } else {
              await apiService.updateSeller(editingUser.id, userData);
              refetchSellers();
            }
          } else {
            // Create new user
            if (activeTab === 'buyers') {
              await apiService.createBuyer(userData);
              refetchBuyers();
            } else {
              await apiService.createSeller(userData);
              refetchSellers();
            }
          }
        }),
        {
          loading: `${operation.charAt(0).toUpperCase() + operation.slice(1)} ${userType}...`,
          success: `${userType.charAt(0).toUpperCase() + userType.slice(1)} успешно ${editingUser ? 'обновлен' : 'создан'}`,
          error: `Ошибка при ${operation} ${userType}`,
        }
      );

      resetForm();
    } catch (error) {
      // Error handled by toast.promise
    }
  }, [activeTab, editingUser, mutate, refetchBuyers, refetchSellers, resetForm, toast]);

  const handleDeleteUser = async (id, type) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      try {
        const userType = type === 'buyer' ? 'покупателя' : 'продавца';

        await toast.promise(
          mutate(async () => {
            if (type === 'buyer') {
              await apiService.deleteBuyer(id);
              refetchBuyers();
            } else {
              await apiService.deleteSeller(id);
              refetchSellers();
            }
          }),
          {
            loading: `Удаление ${userType}...`,
            success: `${userType.charAt(0).toUpperCase() + userType.slice(1)} успешно удален`,
            error: `Ошибка при удалении ${userType}`,
          }
        );
      } catch (error) {
        // Error handled by toast.promise
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;

    if (window.confirm(`Вы уверены, что хотите удалить ${selectedUsers.length} пользователей?`)) {
      try {
        const userType = activeTab === 'buyers' ? 'покупателей' : 'продавцов';

        await toast.promise(
          mutate(async () => {
            if (activeTab === 'buyers') {
              await apiService.bulkDeleteBuyers(selectedUsers);
              refetchBuyers();
            } else {
              await apiService.bulkDeleteSellers(selectedUsers);
              refetchSellers();
            }
          }),
          {
            loading: `Удаление ${selectedUsers.length} ${userType}...`,
            success: `${selectedUsers.length} ${userType} успешно удалены`,
            error: `Ошибка при удалении ${userType}`,
          }
        );

        setSelectedUsers([]);
      } catch (error) {
        // Error handled by toast.promise
      }
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = (users) => {
    const userIds = users.map(user => user.id);
    setSelectedUsers(prev =>
      prev.length === userIds.length ? [] : userIds
    );
  };

  const currentData = activeTab === 'buyers' ? buyers : sellers;
  const currentLoading = activeTab === 'buyers' ? buyersLoading : sellersLoading;
  const currentError = activeTab === 'buyers' ? buyersError : sellersError;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Управление продавцами и покупателями</h1>
        <p className="page-description">Управление покупателями и продавцами на платформе</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('buyers')}
          className={`btn ${activeTab === 'buyers' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Покупатели
        </button>
        <button
          onClick={() => setActiveTab('sellers')}
          className={`btn ${activeTab === 'sellers' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Продавцы
        </button>
      </div>

      {/* Error and Success Messages */}
      {mutationError && (
        <div className="error mb-4">
          <strong>Операция не удалась:</strong> {mutationError}
        </div>
      )}

      {success && (
        <div className="success mb-4">
          <strong>Успех:</strong> Операция выполнена успешно!
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            {activeTab === 'buyers' ? 'Покупатели' : 'Продавцы'}
          </h2>
        </div>

        {/* Search and Actions */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder={`Поиск ${activeTab === 'buyers' ? 'покупателей' : 'продавцов'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ width: '300px' }}
            />
            <p>Всего {activeTab === 'buyers' ? 'покупателей' : 'продавцов'}: {currentData?.total || 0}</p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={handleAddUser}
              variant="primary"
              disabled={mutating}
            >
              Добавить {activeTab === 'buyers' ? 'покупателя' : 'продавца'}
            </Button>
            {selectedUsers.length > 0 && (
              <Button
                onClick={handleBulkDelete}
                variant="secondary"
                loading={mutating}
                disabled={mutating}
              >
                Удалить выбранные ({selectedUsers.length})
              </Button>
            )}
            <Button
              onClick={() => activeTab === 'buyers' ? refetchBuyers() : refetchSellers()}
              variant="secondary"
              loading={currentLoading}
              disabled={currentLoading}
            >
              Обновить
            </Button>
          </div>
        </div>

        {/* Professional Add/Edit Form */}
        {showAddForm && (
          <div className="card mb-6">
            <div className="card-header">
              <h2 className="card-title">
                {editingUser ? `Редактировать ${activeTab === 'buyers' ? 'покупателя' : 'продавца'}` : `Добавить нового ${activeTab === 'buyers' ? 'покупателя' : 'продавца'}`}
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                {editingUser ? 'Обновите информацию ниже' : `Заполните данные для создания нового ${activeTab === 'buyers' ? 'покупателя' : 'продавца'}`}
              </p>
            </div>

            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <FormField
                label="Keycloak UUID"
                placeholder="Например: 3ab0f210-ca78-4312-841b-8b1ae774adac"
                required
                maxLength={100}
                helperText="Уникальный идентификатор из системы аутентификации Keycloak"
                error={form.formState.errors.keycloak_uuid?.message}
                {...form.register('keycloak_uuid')}
              />

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_online"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  {...form.register('is_online')}
                />
                <label htmlFor="is_online" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Пользователь онлайн
                </label>
              </div>
              <p className="text-xs text-gray-500 ml-7">
                Установить начальный статус онлайн для этого пользователя
              </p>

              {/* Seller-specific fields */}
              {activeTab === 'sellers' && (
                <>
                  <FormField
                    label="Название компании"
                    placeholder="Например: ООО 'Деревообработка'"
                    maxLength={200}
                    error={form.formState.errors.company_name?.message}
                    {...form.register('company_name')}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Контактный email"
                      type="email"
                      placeholder="contact@company.com"
                      maxLength={100}
                      error={form.formState.errors.contact_email?.message}
                      {...form.register('contact_email')}
                    />

                    <FormField
                      label="Контактный телефон"
                      type="tel"
                      placeholder="+7 (999) 123-45-67"
                      maxLength={20}
                      error={form.formState.errors.contact_phone?.message}
                      {...form.register('contact_phone')}
                    />
                  </div>

                  <FormField
                    label="Адрес предприятия"
                    placeholder="ул. Промышленная, 123, г. Москва"
                    maxLength={300}
                    error={form.formState.errors.business_address?.message}
                    {...form.register('business_address')}
                  />

                  <FormField
                    label="Описание предприятия"
                    type="textarea"
                    placeholder="Опишите предприятие, специализацию и предлагаемые услуги..."
                    rows={3}
                    maxLength={500}
                    helperText={`${form.watch('business_description')?.length || 0}/500 символов`}
                    error={form.formState.errors.business_description?.message}
                    {...form.register('business_description')}
                  />
                </>
              )}

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  variant="primary"
                  loading={mutating}
                  disabled={!form.formState.isValid}
                >
                  {editingUser ? 'Обновить' : 'Создать'} {activeTab === 'buyers' ? 'покупателя' : 'продавца'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetForm}
                  disabled={mutating}
                >
                  Отменить
                </Button>
              </div>
            </form>
          </div>
        )}

        {currentLoading && <div className="loading">Загрузка {activeTab === 'buyers' ? 'покупателей' : 'продавцов'}...</div>}

        {currentError && (
          <div className="error">
            <strong>Не удалось загрузить {activeTab === 'buyers' ? 'покупателей' : 'продавцов'}:</strong> {currentError}
          </div>
        )}

        {currentData && currentData.data && currentData.data.length > 0 ? (
          <div>
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === currentData.data.length}
                      onChange={() => handleSelectAll(currentData.data)}
                    />
                  </th>
                  <th>ID</th>
                  <th>Keycloak UUID</th>
                  <th>Статус</th>
                  {activeTab === 'sellers' && (
                    <>
                      <th>Компания</th>
                      <th>Контакты</th>
                    </>
                  )}
                  <th>Создан</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {currentData.data
                  .filter(user =>
                    searchTerm === '' ||
                    user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.keycloak_uuid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (activeTab === 'sellers' && (
                      user.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
                    ))
                  )
                  .map((user) => (
                  <tr key={user.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                      />
                    </td>
                    <td>
                      <strong>{user.id.substring(0, 8)}...</strong>
                    </td>
                    <td>
                      <div style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'monospace' }}>
                        {user.keycloak_uuid ? user.keycloak_uuid.substring(0, 12) + '...' : 'Не установлен'}
                      </div>
                    </td>
                    <td>
                      <span className={`status ${user.is_online ? 'status-success' : 'status-error'}`}>
                        {user.is_online ? 'Онлайн' : 'Оффлайн'}
                      </span>
                    </td>
                    {activeTab === 'sellers' && (
                      <>
                        <td>
                          <div>
                            <strong>{user.company_name || 'Не указано'}</strong>
                            {user.business_description && (
                              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-light)', marginTop: '0.25rem' }}>
                                {user.business_description.length > 50
                                  ? `${user.business_description.substring(0, 50)}...`
                                  : user.business_description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: 'var(--font-size-xs)' }}>
                            {user.contact_email && (
                              <div style={{ marginBottom: '0.25rem' }}>
                                📧 {user.contact_email}
                              </div>
                            )}
                            {user.contact_phone && (
                              <div style={{ marginBottom: '0.25rem' }}>
                                📞 {user.contact_phone}
                              </div>
                            )}
                            {user.business_address && (
                              <div style={{ color: 'var(--color-text-light)' }}>
                                📍 {user.business_address.length > 30
                                  ? `${user.business_address.substring(0, 30)}...`
                                  : user.business_address}
                              </div>
                            )}
                            {!user.contact_email && !user.contact_phone && !user.business_address && (
                              <span style={{ color: 'var(--color-text-light)' }}>Нет контактной информации</span>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                    <td>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditUser(user)}
                          variant="secondary"
                          size="sm"
                          disabled={mutating}
                        >
                          Редактировать
                        </Button>
                        <Button
                          onClick={() => handleDeleteUser(user.id, activeTab.slice(0, -1))}
                          variant="error"
                          size="sm"
                          disabled={mutating}
                        >
                          Удалить
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <Button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0 || currentLoading}
                variant="secondary"
              >
                Предыдущая
              </Button>
              <span className="text-sm text-gray-600">Страница {page + 1}</span>
              <Button
                onClick={() => setPage(page + 1)}
                disabled={!currentData?.data || currentData.data.length < 10 || currentLoading}
                variant="secondary"
              >
                Следующая
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p>Не найдено {activeTab === 'buyers' ? 'покупателей' : 'продавцов'}.</p>
          </div>
        )}
      </div>
    </div>
  );
});

export default UserManagement;
