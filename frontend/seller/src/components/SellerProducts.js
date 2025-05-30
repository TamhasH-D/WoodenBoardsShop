import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiFilter, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import apiService from '../apiService';

function SellerProducts() {
  const queryClient = useQueryClient();
  const sellerId = 'seller-test-001'; // Use test seller ID
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Debounced search
  const debouncedSearch = useMemo(
    () => {
      const timer = setTimeout(() => {
        setCurrentPage(1); // Reset to first page when searching
      }, 300);
      return () => clearTimeout(timer);
    },
    [searchTerm]
  );

  // Fetch products with real API call
  const { data: productsData, isLoading: isLoadingProducts, error } = useQuery({
    queryKey: ['sellerProducts', sellerId, currentPage, itemsPerPage, searchTerm, sortField, sortDirection],
    queryFn: () => apiService.getProducts({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      sortBy: sortField,
      sortDirection: sortDirection,
      filters: { seller_id: sellerId }
    }),
    enabled: !!sellerId,
    keepPreviousData: true,
    staleTime: 30000, // 30 seconds
  });

  // Fetch wood types for display
  const { data: woodTypesData } = useQuery({
    queryKey: ['woodTypes'],
    queryFn: () => apiService.getWoodTypes({ limit: 100 }),
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (productId) => apiService.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerProducts'] });
      toast.success('Товар успешно удален');
      setShowDeleteModal(false);
      setProductToDelete(null);
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast.error(`Ошибка при удалении товара: ${error.message}`);
    },
  });

  // Handle delete confirmation
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete.id);
    }
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Get wood type name by ID
  const getWoodTypeName = (woodTypeId) => {
    if (!woodTypesData || !woodTypesData.data) return 'Загрузка...';
    const woodType = woodTypesData.data.find(type => type.id === woodTypeId);
    return woodType ? woodType.neme : 'Неизвестно';
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Export products
  const handleExport = () => {
    if (!productsData?.data?.length) {
      toast.warning('Нет данных для экспорта');
      return;
    }

    const exportData = productsData.data.map(product => ({
      'Название': product.title,
      'Описание': product.descrioption || '',
      'Цена': product.price,
      'Объем': product.volume,
      'Тип древесины': getWoodTypeName(product.wood_type_id),
      'Доставка': product.delivery_possible ? 'Да' : 'Нет',
      'Место самовывоза': product.pickup_location || '',
      'Дата создания': new Date(product.created_at).toLocaleDateString('ru-RU'),
    }));

    // Simple CSV export
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `products-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Данные экспортированы');
  };

  const products = productsData?.data || [];
  const pagination = productsData?.pagination || {};
  const totalPages = Math.ceil(pagination.total / itemsPerPage);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ошибка загрузки товаров</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => queryClient.invalidateQueries(['sellerProducts'])}
            className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-80"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary font-heading">Управление Товарами</h1>
          <p className="text-gray-600 mt-1">
            Всего товаров: {pagination.total || 0}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExport}
            disabled={!products.length}
            className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded-lg transition duration-300 font-sans flex items-center"
          >
            <FiDownload className="mr-2" /> Экспорт
          </button>
          <Link
            to="/products/new"
            className="bg-brand-accent hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-lg transition duration-300 font-sans flex items-center"
          >
            <FiPlus className="mr-2" /> Добавить Товар
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Поиск товаров..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex items-center space-x-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5 на странице</option>
              <option value={10}>10 на странице</option>
              <option value={20}>20 на странице</option>
              <option value={50}>50 на странице</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {isLoadingProducts ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка товаров...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr className="bg-gray-100">
                    <th
                      className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-sans cursor-pointer"
                      onClick={() => handleSort('title')}
                    >
                      Название {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-sans cursor-pointer"
                      onClick={() => handleSort('volume')}
                    >
                      Объем {sortField === 'volume' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-sans cursor-pointer"
                      onClick={() => handleSort('price')}
                    >
                      Цена {sortField === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-sans">
                      Тип Древесины
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-sans">
                      Доставка
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-sans">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                          <p className="text-gray-900 whitespace-no-wrap font-heading">{product.title}</p>
                          <p className="text-gray-600 text-xs mt-1">{product.descrioption || 'Нет описания'}</p>
                        </td>
                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                          <p className="text-gray-900 whitespace-no-wrap font-sans">{product.volume} м³</p>
                        </td>
                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                          <p className="text-gray-900 whitespace-no-wrap font-sans">₽{product.price}</p>
                        </td>
                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                          <p className="text-gray-900 whitespace-no-wrap font-sans">{getWoodTypeName(product.wood_type_id)}</p>
                        </td>
                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                          <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${product.delivery_possible ? 'text-green-900' : 'text-gray-900'}`}>
                            <span aria-hidden className={`absolute inset-0 ${product.delivery_possible ? 'bg-green-200' : 'bg-gray-200'} opacity-50 rounded-full`}></span>
                            <span className="relative font-sans">{product.delivery_possible ? 'Доступна' : 'Самовывоз'}</span>
                          </span>
                          {product.pickup_location && (
                            <p className="text-xs text-gray-600 mt-1">{product.pickup_location}</p>
                          )}
                        </td>
                        <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                          <div className="flex space-x-3">
                            <Link
                              to={`/products/edit/${product.id}`}
                              className="text-brand-primary hover:text-brand-secondary flex items-center font-sans"
                            >
                              <FiEdit className="mr-1" /> Редактировать
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(product)}
                              className="text-red-600 hover:text-red-800 flex items-center font-sans"
                            >
                              <FiTrash2 className="mr-1" /> Удалить
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-5 py-8 border-b border-gray-200 bg-white text-sm text-center">
                        {searchTerm ? 'Товары не найдены. Попробуйте изменить параметры поиска.' : 'У вас пока нет товаров. Нажмите "Добавить Товар", чтобы создать первый товар.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-4 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
                <div className="text-xs text-gray-500">
                  Показано {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, pagination.total)} из {pagination.total}
                </div>
                <div className="flex mt-2 xs:mt-0 items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Предыдущая
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`text-sm py-2 px-3 rounded ${
                            currentPage === page
                              ? 'bg-brand-primary text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Следующая
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-brand-primary mb-4">Подтверждение удаления</h3>
            <p className="mb-6">Вы уверены, что хотите удалить товар "{productToDelete?.title}"? Это действие нельзя отменить.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                disabled={deleteProductMutation.isPending}
              >
                {deleteProductMutation.isPending ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default SellerProducts;