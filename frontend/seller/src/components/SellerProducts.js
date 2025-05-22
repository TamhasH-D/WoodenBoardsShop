import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiFilter } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { productService, woodTypeService } from '../services';

function SellerProducts() {
  const queryClient = useQueryClient();
  const sellerId = localStorage.getItem('sellerId') || 'demo-seller-id'; // Replace with actual auth logic
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Fetch products
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['sellerProducts', sellerId, currentPage, itemsPerPage],
    queryFn: () => productService.getProductsBySellerId(
      sellerId,
      currentPage * itemsPerPage,
      itemsPerPage
    ),
    enabled: !!sellerId,
  });

  // Fetch wood types for display
  const { data: woodTypesData } = useQuery({
    queryKey: ['woodTypes'],
    queryFn: () => woodTypeService.getAllWoodTypes(),
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (productId) => productService.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerProducts'] });
      toast.success('Товар успешно удален');
      setShowDeleteModal(false);
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast.error('Ошибка при удалении товара');
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
  };

  // Get wood type name by ID
  const getWoodTypeName = (woodTypeId) => {
    if (!woodTypesData || !woodTypesData.data) return 'Загрузка...';
    const woodType = woodTypesData.data.find(type => type.id === woodTypeId);
    return woodType ? woodType.neme : 'Неизвестно';
  };

  // Filter products by search term
  const filteredProducts = productsData?.data?.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-brand-primary font-heading">Управление Товарами</h1>
        <Link
          to="/products/new"
          className="bg-brand-accent hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-lg transition duration-300 font-sans flex items-center"
        >
          <FiPlus className="mr-2" /> Добавить Товар
        </Link>
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
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <FiFilter className="mr-2" /> Фильтры
            </button>
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
                  {sortedProducts.length > 0 ? (
                    sortedProducts.map((product) => (
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
            {productsData?.pagination?.total > itemsPerPage && (
              <div className="px-5 py-4 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
                <div className="text-xs text-gray-500">
                  Показано {currentPage * itemsPerPage + 1} - {Math.min((currentPage + 1) * itemsPerPage, productsData.pagination.total)} из {productsData.pagination.total}
                </div>
                <div className="flex mt-2 xs:mt-0">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className={`text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-l ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Предыдущая
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={(currentPage + 1) * itemsPerPage >= productsData.pagination.total}
                    className={`text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-r ${(currentPage + 1) * itemsPerPage >= productsData.pagination.total ? 'opacity-50 cursor-not-allowed' : ''}`}
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