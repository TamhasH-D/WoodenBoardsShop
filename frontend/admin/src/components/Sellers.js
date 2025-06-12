import React, { useState, useMemo, useCallback } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';

function Sellers() {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Create stable API function to prevent infinite loops
  const sellersApiFunction = useMemo(() =>
    showAll
      ? () => apiService.getAllSellers()
      : () => apiService.getSellers(page, 20),
    [page, showAll]
  );

  const { data, loading, error, refetch } = useApi(sellersApiFunction, [page, showAll]);
  const { mutate, loading: mutating, error: mutationError, success } = useApiMutation();

  // Filter sellers based on search term
  const filteredSellers = useMemo(() => {
    if (!data?.data || !searchTerm) return data?.data || [];

    return data.data.filter(seller =>
      seller.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.keycloak_uuid.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data?.data, searchTerm]);

  // Calculate pagination info
  const totalPages = useMemo(() => {
    if (showAll) return 1;
    return Math.ceil((data?.total || 0) / 20);
  }, [data?.total, showAll]);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этого продавца?')) {
      try {
        await mutate(apiService.deleteSeller, id);
        refetch();
      } catch (err) {
        console.error('Ошибка удаления продавца:', err);
      }
    }
  }, [mutate, refetch]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Управление продавцами</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAll(!showAll)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                showAll
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showAll ? 'Показать с пагинацией' : 'Показать всех'}
            </button>
            <button
              onClick={refetch}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Загрузка...' : 'Обновить'}
            </button>
          </div>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Поиск по ID или Keycloak UUID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-600">
            Всего продавцов: <span className="font-semibold">{data?.total || 0}</span>
            {searchTerm && (
              <span className="ml-2">
                | Найдено: <span className="font-semibold">{filteredSellers.length}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">Ошибка загрузки продавцов: {error}</p>
        </div>
      )}

      {mutationError && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">Ошибка операции: {mutationError}</p>
        </div>
      )}

      {success && (
        <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">Операция выполнена успешно!</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="px-6 py-8 text-center">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-gray-600">Загрузка продавцов...</span>
          </div>
        </div>
      )}

      {/* Table */}
      {data && !loading && (
        <>
          {filteredSellers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keycloak UUID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата создания</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSellers.map((seller) => (
                    <tr key={seller.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {seller.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {seller.keycloak_uuid.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          seller.is_online
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {seller.is_online ? 'Онлайн' : 'Офлайн'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(seller.created_at).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDelete(seller.id)}
                          disabled={mutating}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 font-medium transition-colors"
                        >
                          {mutating ? 'Удаление...' : 'Удалить'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">
                {searchTerm ? 'Продавцы не найдены по вашему запросу' : 'Продавцы не найдены'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {!showAll && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Страница {page + 1} из {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0 || loading}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Предыдущая
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages - 1 || loading}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Следующая
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Sellers;
