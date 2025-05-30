import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

import apiService from '../../../apiService';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Table from '../../ui/Table';
import Badge from '../../ui/Badge';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { formatDate, formatDateTime, getRelativeTime, debounce, arrayToCSV, downloadFile } from '../../../utils/helpers';

const ChatThreadsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  const queryClient = useQueryClient();

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((term) => {
      setSearchTerm(term);
      setCurrentPage(1); // Reset to first page when searching
    }, 300),
    []
  );

  // Fetch chat messages with real API call
  const { data: chatResponse, isLoading, error, refetch } = useQuery(
    ['chatMessages', { page: currentPage, limit: pageSize, search: searchTerm, sortBy, sortDirection }],
    () => apiService.getChatMessages({
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      sortBy,
      sortDirection,
    }),
    {
      keepPreviousData: true,
      staleTime: 30000, // 30 seconds
    }
  );

  const chatMessages = chatResponse?.data || [];
  const pagination = chatResponse?.pagination || {};

  // Delete chat message mutation
  const deleteChatMessageMutation = useMutation(
    (messageId) => apiService.deleteChatMessage(messageId),
    {
      onSuccess: () => {
        toast.success('Сообщение успешно удалено');
        queryClient.invalidateQueries('chatMessages');
      },
      onError: (error) => {
        toast.error(`Ошибка при удалении сообщения: ${error.message}`);
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
  const handleDelete = async (message) => {
    if (window.confirm(`Вы уверены, что хотите удалить сообщение?`)) {
      deleteChatMessageMutation.mutate(message.id);
    }
  };

  // Handle export
  const handleExport = () => {
    if (!chatMessages.length) {
      toast.warning('Нет данных для экспорта');
      return;
    }

    const exportData = chatMessages.map(message => ({
      ID: message.id,
      'Отправитель': message.sender_id,
      'Получатель': message.receiver_id,
      'Сообщение': message.message,
      'Дата создания': formatDateTime(message.created_at),
    }));

    const csv = arrayToCSV(exportData);
    downloadFile(csv, `chat-messages-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
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
          <h1 className="text-3xl font-bold text-gray-900">Сообщения чата</h1>
          <p className="text-gray-600 mt-1">
            Управление сообщениями чата ({pagination.total || 0} всего)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            icon={<ArrowDownTrayIcon className="w-4 h-4" />}
            onClick={handleExport}
            disabled={!chatMessages.length}
          >
            Экспорт
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Поиск сообщений..."
              icon={<MagnifyingGlassIcon className="w-4 h-4" />}
              onChange={handleSearchChange}
            />
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
          empty={!chatMessages.length && !isLoading}
          emptyMessage={searchTerm ? 'Сообщения не найдены по вашему запросу' : 'Сообщения не найдены'}
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
              <Table.HeaderCell>Отправитель</Table.HeaderCell>
              <Table.HeaderCell>Получатель</Table.HeaderCell>
              <Table.HeaderCell>Сообщение</Table.HeaderCell>
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
            {chatMessages.map((message, index) => (
              <Table.Row
                key={message.id}
                onClick={() => {/* Navigate to details */}}
              >
                <Table.Cell>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <ChatBubbleLeftRightIcon className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {message.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {message.sender_id.slice(0, 8)}...
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {message.receiver_id.slice(0, 8)}...
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <p className="text-sm text-gray-900 max-w-xs truncate">
                    {message.message}
                  </p>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {formatDateTime(message.created_at)}
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
                      to={`/chat/${message.id}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<TrashIcon className="w-4 h-4" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(message);
                      }}
                      loading={deleteChatMessageMutation.isLoading}
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

export default ChatThreadsList;
