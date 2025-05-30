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

const BuyersList = () => {
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

  // Fetch buyers with real API call
  const { data: buyersResponse, isLoading, error, refetch } = useQuery(
    ['buyers', { page: currentPage, limit: pageSize, search: searchTerm, sortBy, sortDirection, filters }],
    () => apiService.getBuyers({
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

  const buyers = buyersResponse?.data || [];
  const pagination = buyersResponse?.pagination || {};

  // Delete buyer mutation
  const deleteBuyerMutation = useMutation(
    (buyerId) => apiService.deleteBuyer(buyerId),
    {
      onSuccess: () => {
        toast.success('Покупатель успешно удален');
        queryClient.invalidateQueries('buyers');
      },
      onError: (error) => {
        toast.error(`Ошибка при удалении покупателя: ${error.message}`);
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
  const handleDelete = async (buyer) => {
    if (window.confirm(`Вы уверены, что хотите удалить покупателя ${buyer.id}?`)) {
      deleteBuyerMutation.mutate(buyer.id);
    }
  };

  // Handle export
  const handleExport = () => {
    if (!buyers.length) {
      toast.warning('Нет данных для экспорта');
      return;
    }

    const exportData = buyers.map(buyer => ({
      ID: buyer.id,
      'Keycloak UUID': buyer.keycloak_uuid,
      'Статус': buyer.is_online ? 'Онлайн' : 'Офлайн',
      'Дата создания': formatDateTime(buyer.created_at),
      'Дата обновления': formatDateTime(buyer.updated_at),
    }));

    const csv = arrayToCSV(exportData);
    downloadFile(csv, `buyers-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
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
          <h1 className="text-3xl font-bold text-gray-900">Покупатели</h1>
          <p className="text-gray-600 mt-1">
            Управление покупателями системы ({pagination.total || 0} всего)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            icon={<ArrowDownTrayIcon className="w-4 h-4" />}
            onClick={handleExport}
            disabled={!buyers.length}
          >
            Экспорт
          </Button>
          <Button
            variant="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            as={Link}
            to="/buyers/new"
          >
            Добавить покупателя
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Поиск покупателей..."
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
          empty={!buyers.length && !isLoading}
          emptyMessage={searchTerm ? 'Покупатели не найдены по вашему запросу' : 'Покупатели не найдены'}
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
            {buyers.map((buyer, index) => (
              <Table.Row
                key={buyer.id}
                onClick={() => {/* Navigate to details */}}
              >
                <Table.Cell>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <UserIcon className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {buyer.id.slice(0, 8)}...
                      </p>
                      <p className="text-sm text-gray-500">
                        Keycloak: {buyer.keycloak_uuid.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    variant={buyer.is_online ? 'success' : 'gray'}
                    className="flex items-center space-x-1"
                  >
                    <span className={`w-2 h-2 rounded-full ${buyer.is_online ? 'bg-success-500' : 'bg-gray-400'}`}></span>
                    <span>{buyer.is_online ? 'Онлайн' : 'Офлайн'}</span>
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {formatDateTime(buyer.created_at)}
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <span className="text-sm text-gray-900">
                    {formatDateTime(buyer.updated_at)}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<EyeIcon className="w-4 h-4" />}
                      as={Link}
                      to={`/buyers/${buyer.id}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<PencilIcon className="w-4 h-4" />}
                      as={Link}
                      to={`/buyers/edit/${buyer.id}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<TrashIcon className="w-4 h-4" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(buyer);
                      }}
                      loading={deleteBuyerMutation.isLoading}
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

export default BuyersList;
