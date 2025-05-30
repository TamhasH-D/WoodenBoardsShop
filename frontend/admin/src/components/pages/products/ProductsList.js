import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ShoppingBagIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

import apiService from '../../../apiService';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Table from '../../ui/Table';
import Badge from '../../ui/Badge';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { formatDate, formatDateTime, formatCurrency, debounce, arrayToCSV, downloadFile } from '../../../utils/helpers';

const ProductsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filters, setFilters] = useState({
    delivery_possible: '',
    wood_type_id: '',
    seller_id: '',
  });

  const queryClient = useQueryClient();

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((term) => {
      setSearchTerm(term);
      setCurrentPage(1); // Reset to first page when searching
    }, 300),
    []
  );

  // Fetch products with real API call
  const { data: productsResponse, isLoading, error, refetch } = useQuery(
    ['products', { page: currentPage, limit: pageSize, search: searchTerm, sortBy, sortDirection, filters }],
    () => apiService.getProducts({
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      sortBy,
      sortDirection,
      filters: Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== '')
      ),
    }),
    {
      keepPreviousData: true,
      staleTime: 30000, // 30 seconds
    }
  );

  const products = productsResponse?.data || [];
  const pagination = productsResponse?.pagination || {};

  // Fetch wood types for filter dropdown
  const { data: woodTypes } = useQuery('woodTypes', () => apiService.getWoodTypes({ limit: 100 }));

  // Fetch sellers for filter dropdown
  const { data: sellers } = useQuery('sellers', () => apiService.getSellers({ limit: 100 }));

  // Delete product mutation
  const deleteProductMutation = useMutation(
    (productId) => apiService.deleteProduct(productId),
    {
      onSuccess: () => {
        toast.success('Товар успешно удален');
        queryClient.invalidateQueries('products');
      },
      onError: (error) => {
        toast.error(`Ошибка при удалении товара: ${error.message}`);
      },
    }
  );

  // Handle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Handle delete
  const handleDelete = async (product) => {
    if (window.confirm(`Вы уверены, что хотите удалить товар "${product.title}"?`)) {
      deleteProductMutation.mutate(product.id);
    }
  };

  // Handle export
  const handleExport = () => {
    if (!products.length) {
      toast.warning('Нет данных для экспорта');
      return;
    }

    const exportData = products.map(product => ({
      ID: product.id,
      'Название': product.title,
      'Цена': product.price,
      'Объем': product.volume,
      'Описание': product.descrioption || '',
      'Доставка возможна': product.delivery_possible ? 'Да' : 'Нет',
      'Место самовывоза': product.pickup_location || '',
      'Дата создания': formatDateTime(product.created_at),
      'Дата обновления': formatDateTime(product.updated_at),
    }));

    const csv = arrayToCSV(exportData);
    downloadFile(csv, `products-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    toast.success('Данные экспортированы');
  };

  // Handle search input
  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(pagination.total / pageSize);

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <Card.Body>
            <div className="text-center py-8">
              <div className="text-danger-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ошибка загрузки данных</h3>
              <p className="text-gray-600 mb-4">{error.message}</p>
              <Button onClick={() => refetch()} variant="primary">
                Попробовать снова
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Товары</h1>
          <p className="text-gray-600 mt-1">
            Управление товарами системы ({pagination.total || 0} всего)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            icon={<ArrowDownTrayIcon className="w-4 h-4" />}
            onClick={handleExport}
            disabled={!products.length}
          >
            Экспорт
          </Button>
          <Button
            variant="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            as={Link}
            to="/products/new"
          >
            Добавить товар
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Поиск товаров..."
              icon={<MagnifyingGlassIcon className="w-4 h-4" />}
              onChange={handleSearchChange}
            />
            <select
              className="form-input"
              value={filters.delivery_possible}
              onChange={(e) => {
                setFilters({ ...filters, delivery_possible: e.target.value });
                setCurrentPage(1);
              }}
            >
              <option value="">Все варианты доставки</option>
              <option value="true">Доставка возможна</option>
              <option value="false">Только самовывоз</option>
            </select>
            <select
              className="form-input"
              value={filters.wood_type_id}
              onChange={(e) => {
                setFilters({ ...filters, wood_type_id: e.target.value });
                setCurrentPage(1);
              }}
            >
              <option value="">Все типы древесины</option>
              {woodTypes?.data?.map((woodType) => (
                <option key={woodType.id} value={woodType.id}>
                  {woodType.name}
                </option>
              ))}
            </select>
            <select
              className="form-input"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10 на странице</option>
              <option value={20}>20 на странице</option>
              <option value={50}>50 на странице</option>
              <option value={100}>100 на странице</option>
            </select>
          </div>
        </Card.Body>
      </Card>

      {/* Table */}
      <Card>
        <Table
          loading={isLoading}
          empty={!products.length && !isLoading}
          emptyMessage={searchTerm ? 'Товары не найдены по вашему запросу' : 'Товары не найдены'}
        >
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell
                sortable
                onSort={() => handleSort('title')}
                sortDirection={sortBy === 'title' ? sortDirection : null}
              >
                Название
              </Table.HeaderCell>
              <Table.HeaderCell
                sortable
                onSort={() => handleSort('price')}
                sortDirection={sortBy === 'price' ? sortDirection : null}
              >
                Цена
              </Table.HeaderCell>
              <Table.HeaderCell
                sortable
                onSort={() => handleSort('volume')}
                sortDirection={sortBy === 'volume' ? sortDirection : null}
              >
                Объем (м³)
              </Table.HeaderCell>
              <Table.HeaderCell>Тип древесины</Table.HeaderCell>
              <Table.HeaderCell>Доставка</Table.HeaderCell>
              <Table.HeaderCell
                sortable
                onSort={() => handleSort('created_at')}
                sortDirection={sortBy === 'created_at' ? sortDirection : null}
              >
                Дата создания
              </Table.HeaderCell>
              <Table.HeaderCell>Действия</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {products.map((product, index) => (
              <Table.Row
                key={product.id}
                onClick={() => {/* Navigate to details */}}
              >
                <Table.Cell>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-secondary-100 rounded-lg">
                      <ShoppingBagIcon className="w-4 h-4 text-secondary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {product.title}
                      </p>
                      {product.descrioption && (
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {product.descrioption}
                        </p>
                      )}
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center space-x-2">
                    <CurrencyDollarIcon className="w-4 h-4 text-success-500" />
                    <span className="font-semibold text-success-600">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center space-x-2">
                    <CubeIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {product.volume} м³
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Badge variant="gray" size="sm">
                    {woodTypes?.data?.find(wt => wt.id === product.wood_type_id)?.neme || 'Неизвестно'}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    variant={product.delivery_possible ? 'success' : 'warning'}
                    className="flex items-center space-x-1"
                  >
                    <span>{product.delivery_possible ? 'Доставка' : 'Самовывоз'}</span>
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {formatDateTime(product.created_at)}
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<EyeIcon className="w-4 h-4" />}
                      as={Link}
                      to={`/products/${product.id}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<PencilIcon className="w-4 h-4" />}
                      as={Link}
                      to={`/products/edit/${product.id}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<TrashIcon className="w-4 h-4" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(product);
                      }}
                      loading={deleteProductMutation.isLoading}
                      className="text-danger-600 hover:text-danger-700"
                    />
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <Card.Body>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Показано {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, pagination.total)} из {pagination.total} результатов
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Предыдущая
                </Button>

                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Следующая
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}
    </motion.div>
  );
};

export default ProductsList;
