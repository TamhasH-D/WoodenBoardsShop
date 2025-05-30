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
  ArrowDownTrayIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

import apiService from '../../../apiService';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Table from '../../ui/Table';
import Badge from '../../ui/Badge';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { formatDate, formatDateTime, debounce, arrayToCSV, downloadFile } from '../../../utils/helpers';

const SellersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filters, setFilters] = useState({
    is_online: '',
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

  // Fetch sellers with real API call
  const { data: sellersResponse, isLoading, error, refetch } = useQuery(
    ['sellers', { page: currentPage, limit: pageSize, search: searchTerm, sortBy, sortDirection, filters }],
    () => apiService.getSellers({
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

  const sellers = sellersResponse?.data || [];
  const pagination = sellersResponse?.pagination || {};

  // Delete seller mutation
  const deleteSellerMutation = useMutation(
    (sellerId) => apiService.deleteSeller(sellerId),
    {
      onSuccess: () => {
        toast.success('Продавец успешно удален');
        queryClient.invalidateQueries('sellers');
      },
      onError: (error) => {
        toast.error(`Ошибка при удалении продавца: ${error.message}`);
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
  const handleDelete = async (seller) => {
    if (window.confirm(`Вы уверены, что хотите удалить продавца ${seller.id}?`)) {
      deleteSellerMutation.mutate(seller.id);
    }
  };

  // Handle export
  const handleExport = () => {
    if (!sellers.length) {
      toast.warning('Нет данных для экспорта');
      return;
    }

    const exportData = sellers.map(seller => ({
      ID: seller.id,
      'Keycloak UUID': seller.keycloak_uuid,
      'Статус': seller.is_online ? 'Онлайн' : 'Офлайн',
      'Дата создания': formatDateTime(seller.created_at),
      'Дата обновления': formatDateTime(seller.updated_at),
    }));

    const csv = arrayToCSV(exportData);
    downloadFile(csv, `sellers-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
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
          <h1 className="text-3xl font-bold text-gray-900">Продавцы</h1>
          <p className="text-gray-600 mt-1">
            Управление продавцами системы ({pagination.total || 0} всего)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            icon={<ArrowDownTrayIcon className="w-4 h-4" />}
            onClick={handleExport}
            disabled={!sellers.length}
          >
            Экспорт
          </Button>
          <Button
            variant="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            as={Link}
            to="/sellers/new"
          >
            Добавить продавца
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Поиск продавцов..."
              icon={<MagnifyingGlassIcon className="w-4 h-4" />}
              onChange={handleSearchChange}
            />
            <select
              className="form-input"
              value={filters.is_online}
              onChange={(e) => {
                setFilters({ ...filters, is_online: e.target.value });
                setCurrentPage(1);
              }}
            >
              <option value="">Все статусы</option>
              <option value="true">Онлайн</option>
              <option value="false">Офлайн</option>
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
          empty={!sellers.length && !isLoading}
          emptyMessage={searchTerm ? 'Продавцы не найдены по вашему запросу' : 'Продавцы не найдены'}
        >
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell
                sortable
                onSort={() => handleSort('id')}
                sortDirection={sortBy === 'id' ? sortDirection : null}
              >
                ID
              </Table.HeaderCell>
              <Table.HeaderCell>Статус</Table.HeaderCell>
              <Table.HeaderCell
                sortable
                onSort={() => handleSort('created_at')}
                sortDirection={sortBy === 'created_at' ? sortDirection : null}
              >
                Дата создания
              </Table.HeaderCell>
              <Table.HeaderCell
                sortable
                onSort={() => handleSort('updated_at')}
                sortDirection={sortBy === 'updated_at' ? sortDirection : null}
              >
                Последнее обновление
              </Table.HeaderCell>
              <Table.HeaderCell>Действия</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sellers.map((seller, index) => (
              <Table.Row
                key={seller.id}
                onClick={() => {/* Navigate to details */}}
              >
                <Table.Cell>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-secondary-100 rounded-lg">
                      <UserIcon className="w-4 h-4 text-secondary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {seller.id.slice(0, 8)}...
                      </p>
                      <p className="text-sm text-gray-500">
                        Keycloak: {seller.keycloak_uuid.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    variant={seller.is_online ? 'success' : 'gray'}
                    className="flex items-center space-x-1"
                  >
                    <span className={`w-2 h-2 rounded-full ${seller.is_online ? 'bg-success-500' : 'bg-gray-400'}`}></span>
                    <span>{seller.is_online ? 'Онлайн' : 'Офлайн'}</span>
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {formatDateTime(seller.created_at)}
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <span className="text-sm text-gray-900">
                    {formatDateTime(seller.updated_at)}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<EyeIcon className="w-4 h-4" />}
                      as={Link}
                      to={`/sellers/${seller.id}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<PencilIcon className="w-4 h-4" />}
                      as={Link}
                      to={`/sellers/edit/${seller.id}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<TrashIcon className="w-4 h-4" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(seller);
                      }}
                      loading={deleteSellerMutation.isLoading}
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

export default SellersList;
