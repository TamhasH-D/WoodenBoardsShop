import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FiPlus } from 'react-icons/fi';
import apiService from '../../../apiService';
import DataTable from '../../common/DataTable';
import { toast } from 'react-toastify';

const WoodenBoardsList = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: woodenBoardsData, isLoading, error } = useQuery(
    ['woodenBoards', currentPage, searchTerm],
    () => apiService.woodenBoards.getWoodenBoards({ page: currentPage, limit: 10, search: searchTerm }),
    { keepPreviousData: true }
  );

  const deleteWoodenBoardMutation = useMutation(
    (boardId) => apiService.woodenBoards.deleteWoodenBoard(boardId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('woodenBoards');
        toast.success('Wooden board deleted successfully!');
      },
      onError: (err) => {
        toast.error(`Error deleting wooden board: ${err.message}`);
      },
    }
  );

  const handleDeleteWoodenBoard = (boardId) => {
    if (window.confirm('Are you sure you want to delete this wooden board?')) {
      deleteWoodenBoardMutation.mutate(boardId);
    }
  };

  const columns = useMemo(() => [
    { header: 'Title', key: 'title' },
    {
      header: 'Wood Type',
      key: 'wood_type',
      render: (item) => (
        <Link to={`/wood-types/${item.wood_type.id}`} className="text-blue-500 hover:underline">
          {item.wood_type.name}
        </Link>
      ),
    },
    {
      header: 'Dimensions (mm)',
      key: 'dimensions',
      render: (item) => `${item.thickness_mm} x ${item.width_mm} x ${item.length_mm}`,
    },
    { 
      header: 'Price',
      key: 'price',
      render: (item) => `${item.price.toFixed(2)} ${item.currency}`
    },
    {
      header: 'In Stock',
      key: 'in_stock',
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs ${          item.in_stock > 100 ? 'bg-green-100 text-green-800' :
          item.in_stock > 50 ? 'bg-yellow-100 text-yellow-800' :
          item.in_stock > 0 ? 'bg-orange-100 text-orange-800' :
          'bg-red-100 text-red-800'
        }`}>
          {item.in_stock}
        </span>
      ),
    },
  ], []);

  const pagination = woodenBoardsData?.meta ? {
    currentPage: woodenBoardsData.meta.page,
    totalPages: woodenBoardsData.meta.pages,
    totalItems: woodenBoardsData.meta.total,
    pageSize: woodenBoardsData.meta.limit,
  } : null;

  if (error) return <div className="text-center p-6 text-red-500">Error loading wooden boards: {error.message}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Wooden Boards</h1>
        <Link 
          to="/wooden-boards/new" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FiPlus className="mr-2" /> Add Board
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by title or wood type name..."
          className="w-full p-2 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on new search
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={woodenBoardsData?.items || []}
        isLoading={isLoading || deleteWoodenBoardMutation.isLoading}
        pagination={pagination}
        onPageChange={setCurrentPage}
        onDelete={handleDeleteWoodenBoard}
        viewPath="/wooden-boards"
        editPath="/wooden-boards/edit"
      />
    </div>
  );
};

export default WoodenBoardsList;
