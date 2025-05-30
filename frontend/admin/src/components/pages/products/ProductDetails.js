import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  CubeIcon,
  TruckIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

import apiService from '../../../apiService';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { formatDate, formatDateTime, formatCurrency } from '../../../utils/helpers';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch product data
  const { data: product, isLoading, error } = useQuery(
    ['product', id],
    () => apiService.getProduct(id),
    {
      enabled: !!id,
    }
  );

  // Fetch wood type data
  const { data: woodType } = useQuery(
    ['woodType', product?.data?.wood_type_id],
    () => apiService.getWoodType(product.data.wood_type_id),
    {
      enabled: !!product?.data?.wood_type_id,
    }
  );

  // Fetch seller data
  const { data: seller } = useQuery(
    ['seller', product?.data?.seller_id],
    () => apiService.getSeller(product.data.seller_id),
    {
      enabled: !!product?.data?.seller_id,
    }
  );

  // Delete product mutation
  const deleteProductMutation = useMutation(
    () => apiService.deleteProduct(id),
    {
      onSuccess: () => {
        toast.success('Товар успешно удален');
        queryClient.invalidateQueries('products');
        navigate('/products');
      },
      onError: (error) => {
        toast.error(`Ошибка при удалении товара: ${error.message}`);
      },
    }
  );

  const handleDelete = () => {
    if (window.confirm(`Вы уверены, что хотите удалить товар "${product?.data?.title}"?`)) {
      deleteProductMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" text="Загрузка товара..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <Card.Body>
            <div className="text-center py-8">
              <div className="text-danger-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ошибка загрузки товара</h3>
              <p className="text-gray-600 mb-4">{error.message}</p>
              <Button onClick={() => navigate('/products')} variant="primary">
                Вернуться к списку товаров
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (!product?.data) {
    return (
      <div className="p-6">
        <Card>
          <Card.Body>
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Товар не найден</h3>
              <p className="text-gray-600 mb-4">Запрашиваемый товар не существует</p>
              <Button onClick={() => navigate('/products')} variant="primary">
                Вернуться к списку товаров
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  const productData = product.data;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            icon={<ArrowLeftIcon className="w-4 h-4" />}
            onClick={() => navigate('/products')}
          >
            Назад
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{productData.title}</h1>
            <p className="text-gray-600 mt-1">ID: {productData.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            icon={<PencilIcon className="w-4 h-4" />}
            as={Link}
            to={`/products/edit/${productData.id}`}
          >
            Редактировать
          </Button>
          <Button
            variant="danger"
            icon={<TrashIcon className="w-4 h-4" />}
            onClick={handleDelete}
            loading={deleteProductMutation.isLoading}
          >
            Удалить
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <ShoppingBagIcon className="w-5 h-5 mr-2" />
                Основная информация
              </h2>
            </Card.Header>
            <Card.Body>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Название товара
                    </label>
                    <p className="text-gray-900 font-medium">{productData.title}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Цена
                    </label>
                    <div className="flex items-center space-x-2">
                      <CurrencyDollarIcon className="w-4 h-4 text-success-500" />
                      <span className="text-xl font-bold text-success-600">
                        {formatCurrency(productData.price)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Объем
                    </label>
                    <div className="flex items-center space-x-2">
                      <CubeIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{productData.volume} м³</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Тип древесины
                    </label>
                    <Badge variant="gray">
                      {woodType?.data?.neme || 'Загрузка...'}
                    </Badge>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Доставка
                    </label>
                    <div className="flex items-center space-x-2">
                      <TruckIcon className="w-4 h-4 text-gray-400" />
                      <Badge variant={productData.delivery_possible ? 'success' : 'warning'}>
                        {productData.delivery_possible ? 'Доставка возможна' : 'Только самовывоз'}
                      </Badge>
                    </div>
                  </div>

                  {productData.pickup_location && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Место самовывоза
                      </label>
                      <div className="flex items-start space-x-2">
                        <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="text-gray-900">{productData.pickup_location}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {productData.descrioption && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание
                  </label>
                  <p className="text-gray-700 leading-relaxed">{productData.descrioption}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Seller Information */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Продавец
              </h3>
            </Card.Header>
            <Card.Body>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID продавца
                  </label>
                  <Link
                    to={`/sellers/${productData.seller_id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {productData.seller_id}
                  </Link>
                </div>

                {seller?.data && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Статус
                    </label>
                    <Badge variant={seller.data.is_online ? 'success' : 'gray'}>
                      {seller.data.is_online ? 'Онлайн' : 'Оффлайн'}
                    </Badge>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Timestamps */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                Временные метки
              </h3>
            </Card.Header>
            <Card.Body>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дата создания
                  </label>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 text-sm">
                      {formatDateTime(productData.created_at)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Последнее обновление
                  </label>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 text-sm">
                      {formatDateTime(productData.updated_at)}
                    </span>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetails;
