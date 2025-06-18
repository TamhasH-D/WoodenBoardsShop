import React, { useState, useEffect, useCallback } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';
import { ADMIN_TEXTS } from '../utils/localization';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import Table from './ui/Table';
import Pagination from './ui/Pagination';
import Modal from './ui/Modal';
import LoadingSpinner from './ui/LoadingSpinner';
import ImageViewer from './ImageViewer';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

// Entity configurations
const ENTITY_CONFIGS = {
  buyers: {
    title: ADMIN_TEXTS.BUYERS,
    icon: '👥',
    fields: [
      { key: 'id', label: ADMIN_TEXTS.ID, type: 'uuid', readonly: true, showInCreate: true, optional: true,
        placeholder: 'Оставьте пустым для автогенерации',
        helperText: 'UUID будет сгенерирован автоматически, если не указан' },
      { key: 'keycloak_uuid', label: ADMIN_TEXTS.KEYCLOAK_UUID, type: 'uuid', required: true },
      { key: 'is_online', label: ADMIN_TEXTS.ONLINE_STATUS, type: 'checkbox' },
      { key: 'created_at', label: ADMIN_TEXTS.CREATED_AT, type: 'datetime', readonly: true },
      { key: 'updated_at', label: ADMIN_TEXTS.UPDATED_AT, type: 'datetime', readonly: true }
    ],
    api: {
      getAll: (page, size) => apiService.getBuyers(page, size),
      getOne: (id) => apiService.getBuyer(id),
      create: (data) => apiService.createBuyer(data),
      update: (id, data) => apiService.updateBuyer(id, data),
      delete: (id) => apiService.deleteBuyer(id),
      bulkDelete: (ids) => apiService.bulkDeleteBuyers(ids)
    }
  },
  sellers: {
    title: ADMIN_TEXTS.SELLERS,
    icon: '🏪',
    fields: [
      { key: 'id', label: ADMIN_TEXTS.ID, type: 'uuid', readonly: true, showInCreate: true, optional: true,
        placeholder: 'Оставьте пустым для автогенерации',
        helperText: 'UUID будет сгенерирован автоматически, если не указан' },
      { key: 'keycloak_uuid', label: ADMIN_TEXTS.KEYCLOAK_UUID, type: 'uuid', required: true },
      { key: 'is_online', label: ADMIN_TEXTS.ONLINE_STATUS, type: 'checkbox' },
      { key: 'created_at', label: ADMIN_TEXTS.CREATED_AT, type: 'datetime', readonly: true },
      { key: 'updated_at', label: ADMIN_TEXTS.UPDATED_AT, type: 'datetime', readonly: true }
    ],
    api: {
      getAll: (page, size) => apiService.getSellers(page, size),
      getOne: (id) => apiService.getSeller(id),
      create: (data) => apiService.createSeller(data),
      update: (id, data) => apiService.updateSeller(id, data),
      delete: (id) => apiService.deleteSeller(id),
      bulkDelete: (ids) => apiService.bulkDeleteSellers(ids)
    }
  },
  products: {
    title: ADMIN_TEXTS.PRODUCTS,
    icon: '📦',
    fields: [
      { key: 'id', label: ADMIN_TEXTS.ID, type: 'uuid', readonly: true, showInCreate: true, optional: true,
        placeholder: 'Оставьте пустым для автогенерации',
        helperText: 'UUID будет сгенерирован автоматически, если не указан' },
      { key: 'title', label: ADMIN_TEXTS.TITLE, type: 'text', required: true },
      { key: 'volume', label: `${ADMIN_TEXTS.VOLUME} (м³)`, type: 'number', required: true, step: 0.01 },
      { key: 'price', label: `${ADMIN_TEXTS.PRICE} (₽)`, type: 'number', required: true, step: 0.01 },
      { key: 'descrioption', label: ADMIN_TEXTS.DESCRIPTION, type: 'textarea' },
      { key: 'delivery_possible', label: ADMIN_TEXTS.DELIVERY_POSSIBLE, type: 'checkbox' },
      { key: 'pickup_location', label: ADMIN_TEXTS.PICKUP_LOCATION, type: 'text' },
      { key: 'wood_type_id', label: ADMIN_TEXTS.WOOD_TYPE, type: 'select', required: true,
        options: 'woodTypes', optionValue: 'id', optionLabel: 'neme' },
      { key: 'seller_id', label: ADMIN_TEXTS.SELLER, type: 'select', required: true,
        options: 'sellers', optionValue: 'id', optionLabel: 'displayName' },
      { key: 'created_at', label: ADMIN_TEXTS.CREATED_AT, type: 'datetime', readonly: true },
      { key: 'updated_at', label: ADMIN_TEXTS.UPDATED_AT, type: 'datetime', readonly: true }
    ],
    api: {
      getAll: (page, size) => apiService.getProducts(page, size),
      getOne: (id) => apiService.getProduct(id),
      create: (data) => apiService.createProduct(data),
      update: (id, data) => apiService.updateProduct(id, data),
      delete: (id) => apiService.deleteProduct(id),
      bulkDelete: (ids) => apiService.bulkDeleteProducts(ids)
    }
  },
  woodTypes: {
    title: 'Wood Types',
    icon: '🌳',
    fields: [
      { key: 'id', label: 'ID', type: 'uuid', readonly: true, showInCreate: true, optional: true,
        placeholder: 'Оставьте пустым для автогенерации',
        helperText: 'UUID будет сгенерирован автоматически, если не указан' },
      { key: 'neme', label: 'Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' }
    ],
    api: {
      getAll: (page, size) => apiService.getWoodTypes(page, size),
      getOne: (id) => apiService.getWoodType(id),
      create: (data) => apiService.createWoodType(data),
      update: (id, data) => apiService.updateWoodType(id, data),
      delete: (id) => apiService.deleteWoodType(id),
      bulkDelete: (ids) => apiService.bulkDeleteWoodTypes(ids)
    }
  },
  prices: {
    title: 'Wood Type Prices',
    icon: '💰',
    fields: [
      { key: 'id', label: 'ID', type: 'uuid', readonly: true, showInCreate: true, optional: true,
        placeholder: 'Оставьте пустым для автогенерации',
        helperText: 'UUID будет сгенерирован автоматически, если не указан' },
      { key: 'price_per_m3', label: 'Price per m³ ($)', type: 'number', required: true, step: 0.01 },
      { key: 'wood_type_id', label: 'Wood Type', type: 'select', required: true,
        options: 'woodTypes', optionValue: 'id', optionLabel: 'neme' },
      { key: 'created_at', label: 'Created', type: 'datetime', readonly: true }
    ],
    api: {
      getAll: (page, size) => apiService.getWoodTypePrices(page, size),
      getOne: (id) => apiService.getWoodTypePrice(id),
      create: (data) => apiService.createWoodTypePrice(data),
      update: (id, data) => apiService.updateWoodTypePrice(id, data),
      delete: (id) => apiService.deleteWoodTypePrice(id),
      bulkDelete: (ids) => apiService.bulkDeleteWoodTypePrices(ids)
    }
  },
  boards: {
    title: 'Wooden Boards',
    icon: '🪵',
    fields: [
      { key: 'id', label: 'ID', type: 'uuid', readonly: true, showInCreate: true, optional: true,
        placeholder: 'Оставьте пустым для автогенерации',
        helperText: 'UUID будет сгенерирован автоматически, если не указан' },
      { key: 'height', label: 'Height (cm)', type: 'number', required: true, step: 0.1 },
      { key: 'width', label: 'Width (cm)', type: 'number', required: true, step: 0.1 },
      { key: 'lenght', label: 'Length (cm)', type: 'number', required: true, step: 0.1 },
      { key: 'image_id', label: 'Image', type: 'select', required: true,
        options: 'images', optionValue: 'id', optionLabel: 'image_path' }
    ],
    api: {
      getAll: (page, size) => apiService.getWoodenBoards(page, size),
      getOne: (id) => apiService.getWoodenBoard(id),
      create: (data) => apiService.createWoodenBoard(data),
      update: (id, data) => apiService.updateWoodenBoard(id, data),
      delete: (id) => apiService.deleteWoodenBoard(id),
      bulkDelete: (ids) => apiService.bulkDeleteWoodenBoards(ids)
    }
  },
  images: {
    title: 'Images',
    icon: '🖼️',
    fields: [
      { key: 'id', label: 'ID', type: 'uuid', readonly: true, showInCreate: true, optional: true,
        placeholder: 'Оставьте пустым для автогенерации',
        helperText: 'UUID будет сгенерирован автоматически, если не указан' },
      { key: 'image_path', label: 'Файл', type: 'text', required: true },
      { key: 'product_id', label: 'Товар', type: 'select', required: true,
        options: 'products', optionValue: 'id', optionLabel: 'title' },
      { key: 'created_at', label: 'Создано', type: 'datetime', readonly: true },
      { key: 'updated_at', label: 'Обновлено', type: 'datetime', readonly: true }
    ],
    api: {
      getAll: (page, size) => apiService.getImages(page, size),
      getOne: (id) => apiService.getImage(id),
      create: (data) => apiService.createImage(data),
      update: (id, data) => apiService.updateImage(id, data),
      delete: (id) => apiService.deleteImage(id),
      bulkDelete: (ids) => apiService.bulkDeleteImages(ids)
    }
  },
  threads: {
    title: 'Chat Threads',
    icon: '💬',
    fields: [
      { key: 'id', label: 'ID', type: 'uuid', readonly: true, showInCreate: true, optional: true,
        placeholder: 'Оставьте пустым для автогенерации',
        helperText: 'UUID будет сгенерирован автоматически, если не указан' },
      { key: 'buyer_id', label: 'Buyer', type: 'select', required: true,
        options: 'buyers', optionValue: 'id', optionLabel: 'displayName' },
      { key: 'seller_id', label: 'Seller', type: 'select', required: true,
        options: 'sellers', optionValue: 'id', optionLabel: 'displayName' },
      { key: 'created_at', label: 'Created', type: 'datetime', readonly: true }
    ],
    api: {
      getAll: (page, size) => apiService.getChatThreads(page, size),
      getOne: (id) => apiService.getChatThread(id),
      create: (data) => apiService.createChatThread(data),
      update: (id, data) => apiService.updateChatThread(id, data),
      delete: (id) => apiService.deleteChatThread(id),
      bulkDelete: (ids) => apiService.bulkDeleteChatThreads(ids)
    }
  },
  messages: {
    title: 'Chat Messages',
    icon: '💭',
    fields: [
      { key: 'id', label: 'ID', type: 'uuid', readonly: true, showInCreate: true, optional: true,
        placeholder: 'Оставьте пустым для автогенерации',
        helperText: 'UUID будет сгенерирован автоматически, если не указан' },
      { key: 'message', label: 'Message', type: 'textarea', required: true },
      { key: 'is_read_by_buyer', label: 'Read by Buyer', type: 'checkbox' },
      { key: 'is_read_by_seller', label: 'Read by Seller', type: 'checkbox' },
      { key: 'thread_id', label: 'Thread', type: 'select', required: true,
        options: 'threads', optionValue: 'id', optionLabel: 'id' },
      { key: 'buyer_id', label: 'Buyer', type: 'select', required: true,
        options: 'buyers', optionValue: 'id', optionLabel: 'displayName' },
      { key: 'seller_id', label: 'Seller', type: 'select', required: true,
        options: 'sellers', optionValue: 'id', optionLabel: 'displayName' },
      { key: 'created_at', label: 'Created', type: 'datetime', readonly: true }
    ],
    api: {
      getAll: (page, size) => apiService.getChatMessages(page, size),
      getOne: (id) => apiService.getChatMessage(id),
      create: (data) => apiService.createChatMessage(data),
      update: (id, data) => apiService.updateChatMessage(id, data),
      delete: (id) => apiService.deleteChatMessage(id),
      bulkDelete: (ids) => apiService.bulkDeleteChatMessages(ids)
    }
  }
};

/**
 * Corporate Entity Manager Component
 * Professional, minimal design suitable for enterprise admin panels
 */
function EntityManager({ entityType }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDuplicateNameError, setIsDuplicateNameError] = useState(false);

  // Initialize form data
  const getInitialFormData = useCallback(() => {
    const config = ENTITY_CONFIGS[entityType];
    if (!config) return {};
    const formData = {};
    config.fields.forEach(field => {
      if (field.type === 'checkbox') {
        formData[field.key] = false;
      } else {
        formData[field.key] = '';
      }
    });
    return formData;
  }, [entityType]);

  const [formData, setFormData] = useState(() => getInitialFormData());

  const config = ENTITY_CONFIGS[entityType];

  // API hooks - always call them
  const { data, loading, error, refetch } = useApi(
    () => config ? config.api.getAll(currentPage - 1, 20) : Promise.resolve(null),
    [currentPage, entityType]
  );
  const { mutate, loading: mutating } = useApiMutation();

  // Load reference data for select fields (only load what's needed)
  const { data: woodTypes } = useApi(() => apiService.getAllWoodTypes(), []);
  const { data: sellers } = useApi(() => apiService.getAllSellers(), []);
  const { data: buyers } = useApi(() => apiService.getAllBuyers(), []);
  const { data: products } = useApi(() => apiService.getAllProducts(), []);
  // Don't load all images for reference - too many records (2500+)
  const { data: images } = useApi(() =>
    entityType === 'wooden_boards' ? apiService.getImages(0, 100) : Promise.resolve({ data: [] }),
    [entityType]
  );
  const { data: threads } = useApi(() => apiService.getAllChatThreads(), []);

  const referenceData = {
    woodTypes: woodTypes?.data || [],
    sellers: (sellers?.data || []).map(seller => ({
      ...seller,
      displayName: `${seller.id.substring(0, 8)}... ${seller.is_online ? '🟢 Онлайн' : '🔴 Оффлайн'}`
    })),
    buyers: (buyers?.data || []).map(buyer => ({
      ...buyer,
      displayName: `${buyer.id.substring(0, 8)}... ${buyer.is_online ? '🟢 Онлайн' : '🔴 Оффлайн'}`
    })),
    products: products?.data || [],
    images: images?.data || [],
    threads: threads?.data || []
  };

  // Reset form when entity type changes
  useEffect(() => {
    setFormData(getInitialFormData());
    setEditingItem(null);
    setShowCreateModal(false);
    setShowEditModal(false);
    setCurrentPage(1);
  }, [entityType, getInitialFormData]);

  // Early return after all hooks
  if (!config) {
    return (
      <div className="p-6">
        <Card className="p-6 text-center">
          <p className="text-red-600">Unknown entity type: {entityType}</p>
        </Card>
      </div>
    );
  }

  // Render field component based on field type
  const renderField = (field, isCreate = false) => {
    const fieldProps = {
      label: field.label + (field.required ? ' *' : ''),
      value: formData[field.key] || '',
      onChange: (e) => setFormData(prev => ({
        ...prev,
        [field.key]: field.type === 'checkbox' ? e.target.checked : e.target.value
      })),
      required: field.required,
      disabled: field.readonly && (!isCreate || !field.showInCreate),
      placeholder: field.placeholder,
      helperText: field.helperText
    };

    // Select field for foreign keys
    if (field.type === 'select' && field.options && referenceData[field.options]) {
      return (
        <Select
          {...fieldProps}
          options={referenceData[field.options]}
          optionValue={field.optionValue || 'id'}
          optionLabel={field.optionLabel || 'name'}
          placeholder={`Выберите ${field.label.toLowerCase()}...`}
        />
      );
    }

    // Regular input field
    return (
      <Input
        {...fieldProps}
        type={field.type === 'textarea' ? 'textarea' : field.type || 'text'}
      />
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsDuplicateNameError(false); // Reset error state on new submission

    // Specific validation for woodTypes name update
    if (editingItem && config.api.update && entityType === 'woodTypes') {
      const originalName = (editingItem.neme || '').toLowerCase();
      const newName = (formData.neme || '').toLowerCase();

      if (newName && newName !== originalName) {
        const isDuplicate = referenceData.woodTypes.some(wt =>
          wt.id !== editingItem.id && (wt.neme || '').toLowerCase() === newName
        );

        if (isDuplicate) {
          toast.error('Тип древесины с таким названием уже существует');
          setIsDuplicateNameError(true);
          return; // Prevent form submission
        }
      }
    }

    // Specific validation for products title update
    if (editingItem && config.api.update && entityType === 'products') {
      const originalTitle = (editingItem.title || '').toLowerCase();
      const newTitle = (formData.title || '').toLowerCase();

      if (newTitle && newTitle !== originalTitle) {
        const isDuplicate = referenceData.products.some(product =>
          product.id !== editingItem.id && (product.title || '').toLowerCase() === newTitle
        );

        if (isDuplicate) {
          toast.error('Продукт с таким названием уже существует');
          return; // Prevent form submission
        }
      }
    }

    try {
      if (editingItem) {
        // Ensure that we use config.api.update for the update operation
        await mutate(() => config.api.update(editingItem.id, formData));
        toast.success('Запись обновлена успешно');
        setShowEditModal(false);
      } else {
        // Create operation
        // Specific validation for woodTypes name create
        if (entityType === 'woodTypes') {
          const newName = (formData.neme || '').toLowerCase();
          if (newName) { // Only proceed if newName is not empty
            const isDuplicate = referenceData.woodTypes.some(
              wt => (wt.neme || '').toLowerCase() === newName
            );

            if (isDuplicate) {
              toast.error('Тип древесины с таким названием уже существует');
              setIsDuplicateNameError(true);
              return; // Prevent form submission
            }
          }
        }

        // Specific validation for products title create
        if (entityType === 'products') {
          const newTitle = (formData.title || '').toLowerCase();
          if (newTitle) { // Only proceed if newTitle is not empty
            const isDuplicate = referenceData.products.some(
              product => (product.title || '').toLowerCase() === newTitle
            );

            if (isDuplicate) {
              toast.error('Продукт с таким названием уже существует');
              return; // Prevent form submission
            }
          }
        }

        // Generate UUID if not provided
        const dataToSubmit = { ...formData };
        if (!dataToSubmit.id) {
          dataToSubmit.id = crypto.randomUUID();
        }
        await mutate(() => config.api.create(dataToSubmit));
        toast.success('Запись создана успешно');
        setShowCreateModal(false);
      }
      setFormData(getInitialFormData());
      setEditingItem(null);
      refetch();
    } catch (error) {
      toast.error('Ошибка при сохранении');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await mutate(() => config.api.delete(itemToDelete.id));
      toast.success('Запись удалена успешно');
      setShowDeleteModal(false);
      setItemToDelete(null);
      refetch();
    } catch (error) {
      toast.error('Ошибка при удалении');
    }
  };

  // Handle edit
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowEditModal(true);
  };

  // Function to get display value for foreign key fields
  const getDisplayValue = (field, value) => {
    if (field.type === 'select' && field.options && value) {
      const options = referenceData[field.options];
      const option = options.find(opt => opt[field.optionValue || 'id'] === value);
      if (option) {
        return option[field.optionLabel || 'name'] || option.displayName || value;
      }
    }
    return value;
  };

  // Prepare table columns
  const columns = config.fields
    .filter(field => !field.hideInTable)
    .slice(0, 5) // Limit columns for better display
    .map(field => ({
      key: field.key,
      header: field.label,
      render: (value, row) => {
        // Special handling for images
        if (entityType === 'images' && field.key === 'image_path') {
          const productTitle = referenceData.products.find(p => p.id === row.product_id)?.title;
          return (
            <ImageViewer
              imageId={row.id}
              imagePath={value}
              productTitle={productTitle}
            />
          );
        }

        if (field.type === 'datetime' && value) {
          return new Date(value).toLocaleString('ru-RU');
        }
        if (field.type === 'checkbox') {
          return value ? 'Да' : 'Нет';
        }
        if (field.type === 'select') {
          const displayValue = getDisplayValue(field, value);
          if (typeof displayValue === 'string' && displayValue.length > 30) {
            return displayValue.substring(0, 30) + '...';
          }
          return displayValue || '-';
        }
        if (typeof value === 'string' && value.length > 50) {
          return value.substring(0, 50) + '...';
        }
        return value || '-';
      }
    }));

  // Add actions column
  columns.push({
    key: 'actions',
    header: 'Действия',
    render: (_, row) => (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEdit(row)}
          className="p-1"
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setItemToDelete(row);
            setShowDeleteModal(true);
          }}
          className="p-1 text-red-600 hover:text-red-700"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    )
  });

  // Filter data based on search
  const filteredData = data?.data?.filter(item => {
    if (!searchTerm) return true;
    return Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{config.title}</h1>
          <p className="mt-1 text-sm text-gray-600">
            Управление {config.title.toLowerCase()}
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Создать
        </Button>
      </div>

      {/* Search and filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={`Поиск ${config.title.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={refetch}
            disabled={loading}
          >
            {loading ? 'Загрузка...' : 'Обновить'}
          </Button>
        </div>
      </Card>

      {/* Error message */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-600">
            Ошибка загрузки {config.title.toLowerCase()}: {error}
          </p>
        </Card>
      )}

      {/* Data table */}
      <Card>
        {loading ? (
          <div className="p-12 text-center">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={filteredData}
              loading={loading}
            />

            {/* Pagination */}
            {data?.pagination && (
              <div className="p-4 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil((data.pagination.total || 0) / 20)}
                  onPageChange={setCurrentPage}
                  totalItems={data.pagination.total || 0}
                  itemsPerPage={20}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData(getInitialFormData());
        }}
        title={`Создать ${config.title.slice(0, -1)}`}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setFormData(getInitialFormData());
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSubmit}
              loading={mutating}
              disabled={mutating || (entityType === 'woodTypes' && isDuplicateNameError)}
            >
              Создать
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {config.fields
            .filter(field => !field.readonly || field.showInCreate)
            .map((field) => (
              <div key={field.key}>
                {renderField(field, true)}
              </div>
            ))}
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
          setFormData(getInitialFormData());
        }}
        title={`Редактировать ${config.title.slice(0, -1)}`}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setEditingItem(null);
                setFormData(getInitialFormData());
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSubmit}
              loading={mutating}
              disabled={mutating || (entityType === 'woodTypes' && isDuplicateNameError)}
            >
              Сохранить
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {config.fields
            .filter(field => !field.hideInEdit)
            .map((field) => (
              <div key={field.key}>
                {renderField(field, false)}
              </div>
            ))}
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
        }}
        title="Подтвердить удаление"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setItemToDelete(null);
              }}
            >
              Отмена
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={mutating}
            >
              Удалить
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          Вы уверены, что хотите удалить эту запись? Это действие нельзя отменить.
        </p>
      </Modal>
    </div>
  );
}

export default EntityManager;
