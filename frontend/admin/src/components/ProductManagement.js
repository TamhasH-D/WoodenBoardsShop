import React, { useState } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useToastContext } from '../hooks/useToast';
import { apiService } from '../services/api';
import Button from './ui/Button';

const ProductManagement = React.memo(() => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [filterBy, setFilterBy] = useState('all'); // all, with_delivery, pickup_only

  // Toast notifications
  const toast = useToastContext();

  const { data: products, loading, error, refetch } = useApi(
    () => apiService.getProducts(page, 10),
    [page]
  );

  const { mutate, loading: mutating } = useApiMutation();

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      try {
        await toast.promise(
          mutate(async () => {
            await apiService.deleteProduct(id);
            refetch();
          }),
          {
            loading: 'Удаление товара...',
            success: 'Товар успешно удален',
            error: 'Ошибка при удалении товара',
          }
        );
      } catch (error) {
        // Error handled by toast.promise
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    if (window.confirm(`Вы уверены, что хотите удалить ${selectedProducts.length} товаров?`)) {
      try {
        await toast.promise(
          mutate(async () => {
            await apiService.bulkDeleteProducts(selectedProducts);
            setSelectedProducts([]);
            refetch();
          }),
          {
            loading: `Удаление ${selectedProducts.length} товаров...`,
            success: `${selectedProducts.length} товаров успешно удалены`,
            error: 'Ошибка при удалении товаров',
          }
        );
      } catch (error) {
        // Error handled by toast.promise
      }
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = (products) => {
    const productIds = products.map(product => product.id);
    setSelectedProducts(prev =>
      prev.length === productIds.length ? [] : productIds
    );
  };

  // Filter products based on search and filter criteria
  const filteredProducts = products?.data?.filter(product => {
    const matchesSearch = searchTerm === '' ||
      product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.seller_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterBy === 'all' ||
      (filterBy === 'with_delivery' && product.delivery_possible) ||
      (filterBy === 'pickup_only' && !product.delivery_possible);

    return matchesSearch && matchesFilter;
  }) || [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Управление товарами</h1>
        <p className="page-description">Просмотр и управление всеми товарами продавцов</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Все товары</h2>
        </div>

        {/* Search and Filters */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ width: '300px' }}
            />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="form-input"
              style={{ width: '150px' }}
            >
              <option value="all">Все товары</option>
              <option value="with_delivery">С доставкой</option>
              <option value="pickup_only">Только самовывоз</option>
            </select>
            <p>Всего: {products?.total || 0} | Отфильтровано: {filteredProducts.length}</p>
          </div>
          <div className="flex gap-4">
            {selectedProducts.length > 0 && (
              <Button
                onClick={handleBulkDelete}
                variant="secondary"
                loading={mutating}
                disabled={mutating}
              >
                Удалить выбранные ({selectedProducts.length})
              </Button>
            )}
            <Button
              onClick={refetch}
              variant="secondary"
              loading={loading}
              disabled={loading}
            >
              Обновить
            </Button>
          </div>
        </div>

        {loading && <div className="loading">Загрузка товаров...</div>}

        {error && (
          <div className="error">
            <strong>Не удалось загрузить товары:</strong> {error}
          </div>
        )}

        {filteredProducts.length > 0 ? (
          <div>
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length}
                      onChange={() => handleSelectAll(filteredProducts)}
                    />
                  </th>
                  <th>Название</th>
                  <th>Продавец</th>
                  <th>Объем</th>
                  <th>Цена</th>
                  <th>Доставка</th>
                  <th>Создан</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                      />
                    </td>
                    <td>
                      <div>
                        <strong>{product.title || 'Без названия'}</strong>
                        {product.descrioption && (
                          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                            {product.descrioption.length > 50
                              ? `${product.descrioption.substring(0, 50)}...`
                              : product.descrioption}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {product.seller_id ? product.seller_id.substring(0, 8) + '...' : 'N/A'}
                    </td>
                    <td>
                      {product.volume} m³
                    </td>
                    <td>
                      ₽{product.price?.toFixed(2) || 0}
                    </td>
                    <td>
                      <span className={`status ${product.delivery_possible ? 'status-success' : 'status-warning'}`}>
                        {product.delivery_possible ? 'Доступна' : 'Только самовывоз'}
                      </span>
                    </td>
                    <td>
                      {new Date(product.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <Button
                        onClick={() => handleDeleteProduct(product.id)}
                        variant="error"
                        size="sm"
                        disabled={mutating}
                      >
                        Удалить
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <Button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0 || loading}
                variant="secondary"
              >
                Предыдущая
              </Button>
              <span className="text-sm text-gray-600">Страница {page + 1}</span>
              <Button
                onClick={() => setPage(page + 1)}
                disabled={!products?.data || products.data.length < 10 || loading}
                variant="secondary"
              >
                Следующая
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p>Товары не найдены.</p>
          </div>
        )}
      </div>
    </div>
  );
});

export default ProductManagement;
