import React, { useState } from 'react';
import { apiService } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

/**
 * Тестовая страница для проверки API и пагинации
 */
const ApiTestPage = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoints = [
    { name: 'Покупатели', func: () => apiService.getBuyers(0, 5) },
    { name: 'Продавцы', func: () => apiService.getSellers(0, 5) },
    { name: 'Товары', func: () => apiService.getProducts(0, 5) },
    { name: 'Типы древесины', func: () => apiService.getWoodTypes(0, 5) },
    { name: 'Цены', func: () => apiService.getWoodTypePrices(0, 5) },
    { name: 'Доски', func: () => apiService.getWoodenBoards(0, 5) },
    { name: 'Изображения', func: () => apiService.getImages(0, 5) },
    { name: 'Чат-треды', func: () => apiService.getChatThreads(0, 5) },
    { name: 'Сообщения', func: () => apiService.getChatMessages(0, 5) },
  ];

  const runTest = async (test) => {
    setLoading(true);
    try {
      const result = await test.func();
      setResults(prev => ({
        ...prev,
        [test.name]: { 
          success: true, 
          data: result, 
          error: null,
          timestamp: new Date().toLocaleTimeString('ru-RU')
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [test.name]: { 
          success: false, 
          data: null, 
          error: error.message,
          timestamp: new Date().toLocaleTimeString('ru-RU')
        }
      }));
    }
    setLoading(false);
  };

  const runAllTests = async () => {
    setLoading(true);
    setResults({});
    
    for (const test of testEndpoints) {
      try {
        const result = await test.func();
        setResults(prev => ({
          ...prev,
          [test.name]: { 
            success: true, 
            data: result, 
            error: null,
            timestamp: new Date().toLocaleTimeString('ru-RU')
          }
        }));
      } catch (error) {
        setResults(prev => ({
          ...prev,
          [test.name]: { 
            success: false, 
            data: null, 
            error: error.message,
            timestamp: new Date().toLocaleTimeString('ru-RU')
          }
        }));
      }
    }
    setLoading(false);
  };

  const clearResults = () => {
    setResults({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Тестирование API</h1>
        <p className="mt-1 text-sm text-gray-600">
          Проверка работы API endpoints и структуры данных
        </p>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={runAllTests}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? <LoadingSpinner size="sm" /> : null}
            Тестировать все
          </Button>
          <Button
            variant="outline"
            onClick={clearResults}
            disabled={loading}
          >
            Очистить результаты
          </Button>
        </div>
      </Card>

      {/* Test Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {testEndpoints.map(test => (
          <Card key={test.name} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">{test.name}</h3>
              <Button
                size="sm"
                onClick={() => runTest(test)}
                disabled={loading}
              >
                Тест
              </Button>
            </div>
            
            {results[test.name] && (
              <div className="space-y-2">
                <div className={`text-xs px-2 py-1 rounded ${
                  results[test.name].success 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {results[test.name].success ? 'Успешно' : 'Ошибка'}
                  <span className="ml-2 opacity-75">
                    {results[test.name].timestamp}
                  </span>
                </div>
                
                {results[test.name].success ? (
                  <div className="text-xs space-y-1">
                    <div>
                      <strong>Всего записей:</strong> {results[test.name].data.total || 0}
                    </div>
                    <div>
                      <strong>Получено:</strong> {results[test.name].data.data?.length || 0}
                    </div>
                    <div>
                      <strong>Пагинация:</strong> {
                        results[test.name].data.pagination ? 'Есть' : 'Нет'
                      }
                    </div>
                    {results[test.name].data.pagination && (
                      <div className="text-xs text-gray-600">
                        offset: {results[test.name].data.pagination.offset}, 
                        limit: {results[test.name].data.pagination.limit}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-red-600">
                    {results[test.name].error}
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Summary */}
      {Object.keys(results).length > 0 && (
        <Card className="p-4">
          <h3 className="font-medium text-gray-900 mb-3">Сводка результатов</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Успешных тестов:</strong> {
                Object.values(results).filter(r => r.success).length
              }
            </div>
            <div>
              <strong>Неудачных тестов:</strong> {
                Object.values(results).filter(r => !r.success).length
              }
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Общая статистика:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {Object.entries(results)
                .filter(([_, result]) => result.success)
                .map(([name, result]) => (
                  <div key={name}>
                    <strong>{name}:</strong> {result.data.total || 0} записей
                  </div>
                ))
              }
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ApiTestPage;
