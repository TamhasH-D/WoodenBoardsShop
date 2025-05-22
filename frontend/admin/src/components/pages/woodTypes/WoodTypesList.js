import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { PlusIcon } from '@heroicons/react/24/outline';
import DataTable from '../../common/DataTable';
import apiService from '../../../apiService';

const WoodTypesList = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const queryClient = useQueryClient();

  // Fetch wood types with pagination
  const { data, isLoading } = useQuery(
    ['woodTypes', page, limit],
    () => apiService.getWoodTypes({ offset: (page - 1) * limit, limit }),
    {
      keepPreviousData: true,
      onError: (error) => {
        toast.error(`Ошибка при загрузке типов древесины: ${error.message}`);
      },
    }
  );

  // Delete mutation
  const deleteMutation = useMutation(
    (id) => apiService.deleteWoodType(id),
    {
      onSuccess: () => {
        toast.success('Тип древесины успешно удален');
        queryClient.invalidateQueries('woodTypes');
      },
      onError: (error) => {
        toast.error(`Ошибка при удалении типа древесины: ${error.message}`);
      },
    }
  );

  const handleDelete = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот тип древесины?')) {
      deleteMutation.mutate(id);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (item) => (
        <div className="text-sm text-gray-900 font-medium">
          {item.id.substring(0, 8)}...
        </div>
      ),
    },
    {
      key: 'neme', // Note: API has a typo in the field name
      header: 'Название',
      render: (item) => (
        <div className="text-sm font-medium text-gray-900">{item.neme}</div>
      ),
    },
    {
      key: 'description',
      header: 'Описание',
      render: (item) => (
        <div className="text-sm text-gray-500">
          {item.description || 'Нет описания'}
        </div>
      ),
    },
  ];

  const pagination = data
    ? {
        currentPage: page,
        pageSize: limit,
        totalItems: data.pagination?.total || 0,
        totalPages: Math.ceil((data.pagination?.total || 0) / limit),
      }
    : null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Типы древесины</h1>
        <Link
          to="/wood-types/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Добавить тип древесины
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onDelete={handleDelete}
        viewPath="/wood-types"
        editPath="/wood-types/edit"
      />
    </div>
  );
};

export default WoodTypesList;
