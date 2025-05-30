import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FiPlus } from 'react-icons/fi';
import apiService from '../../../apiService';
import DataTable from '../../common/DataTable';
import { toast } from 'react-toastify';

const WoodTypePricesList = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: woodTypePricesData, isLoading, error } = useQuery(
    ['woodTypePrices', currentPage, searchTerm],
    () => apiService.woodTypePrices.getWoodTypePrices({ page: currentPage, limit: 10, search: searchTerm }),
    { keepPreviousData: true }
  );

  const deleteWoodTypePriceMutation = useMutation(
    (priceId) => apiService.woodTypePrices.deleteWoodTypePrice(priceId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('woodTypePrices');
        toast.success('Wood type price deleted successfully!');
      },
      onError: (err) => {
        toast.error(`Error deleting wood type price: ${err.message}`);
      },
    }
  );

  const handleDeleteWoodTypePrice = (priceId) => {
    if (window.confirm('Are you sure you want to delete this wood type price?')) {
      deleteWoodTypePriceMutation.mutate(priceId);
    }
  };

  const columns = useMemo(() => [
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
      header: 'Price',
      key: 'price_per_cubic_meter',
      render: (item) => `${item.price_per_cubic_meter.toFixed(2)} ${item.currency}` 
    },
    { header: 'Min Order (m³)', key: 'min_order_volume' },
    { header: 'Effective Date', key: 'effective_date', render: (item) => new Date(item.effective_date).toLocaleDateString() },
    {
      header: 'Status',
      key: 'is_active',
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs ${          item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'        }`}>          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ], []);

  const pagination = woodTypePricesData?.meta ? {
    currentPage: woodTypePricesData.meta.page,
    totalPages: woodTypePricesData.meta.pages,
    totalItems: woodTypePricesData.meta.total,
    pageSize: woodTypePricesData.meta.limit,
  } : null;

  if (error) return <div className="text-center p-6 text-red-500">Error loading wood type prices: {error.message}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Wood Type Prices</h1>
        <Link 
          to="/wood-type-prices/new" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FiPlus className="mr-2" /> Add Price
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by wood type name..."
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
        data={woodTypePricesData?.items || []}
        isLoading={isLoading || deleteWoodTypePriceMutation.isLoading}
        pagination={pagination}
        onPageChange={setCurrentPage}
        onDelete={handleDeleteWoodTypePrice}
        viewPath="/wood-type-prices"
        editPath="/wood-type-prices/edit"
      />
    </div>
  );
};

export default WoodTypePricesList;
