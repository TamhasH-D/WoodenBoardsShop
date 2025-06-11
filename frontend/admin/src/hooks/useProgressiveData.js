import { useState, useEffect, useCallback } from 'react';

/**
 * Hook для прогрессивной загрузки данных с анимацией
 * Автоматически делает несколько запросов с правильным лимитом для получения всех данных
 */
export const useProgressiveData = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [stats, setStats] = useState({ loaded: 0, total: 0 });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setData([]);
      setProgress({ current: 0, total: 0, percentage: 0 });
      setStats({ loaded: 0, total: 0 });

      // Первый запрос для определения общего количества
      const firstPage = await fetchFunction(0, 20);
      const total = firstPage.total || 0;
      
      if (total === 0) {
        setData([]);
        setProgress({ current: 0, total: 0, percentage: 100 });
        setStats({ loaded: 0, total: 0 });
        return;
      }

      // Рассчитываем количество страниц
      const pageSize = 20; // Максимальный лимит API
      const totalPages = Math.ceil(total / pageSize);
      
      setProgress({ current: 1, total: totalPages, percentage: (1 / totalPages) * 100 });
      setStats({ loaded: firstPage.data.length, total });

      let allData = [...firstPage.data];

      // Загружаем остальные страницы с задержкой для анимации
      for (let page = 1; page < totalPages; page++) {
        // Небольшая задержка для визуального эффекта
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const pageData = await fetchFunction(page, pageSize);
        allData = [...allData, ...pageData.data];
        
        setData([...allData]);
        setProgress({ 
          current: page + 1, 
          total: totalPages, 
          percentage: ((page + 1) / totalPages) * 100 
        });
        setStats({ loaded: allData.length, total });
      }

      setData(allData);
      setProgress({ current: totalPages, total: totalPages, percentage: 100 });
      setStats({ loaded: allData.length, total });

    } catch (err) {
      console.error('Progressive data loading error:', err);
      setError(err.message || 'Ошибка загрузки данных');
      setData([]);
      setProgress({ current: 0, total: 0, percentage: 0 });
      setStats({ loaded: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    loadData();
  }, dependencies);

  const refetch = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    progress,
    stats,
    refetch
  };
};

/**
 * Hook для прогрессивной загрузки статистики всех сущностей
 */
export const useProgressiveStats = (apiService) => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 9, percentage: 0 });
  const [loadingEntity, setLoadingEntity] = useState('');

  const entities = [
    { key: 'buyers', name: 'Покупатели', fetchFn: (page, size) => apiService.getBuyers(page, size) },
    { key: 'sellers', name: 'Продавцы', fetchFn: (page, size) => apiService.getSellers(page, size) },
    { key: 'products', name: 'Товары', fetchFn: (page, size) => apiService.getProducts(page, size) },
    { key: 'woodTypes', name: 'Типы древесины', fetchFn: (page, size) => apiService.getWoodTypes(page, size) },
    { key: 'prices', name: 'Цены', fetchFn: (page, size) => apiService.getWoodTypePrices(page, size) },
    { key: 'boards', name: 'Доски', fetchFn: (page, size) => apiService.getWoodenBoards(page, size) },
    { key: 'images', name: 'Изображения', fetchFn: (page, size) => apiService.getImages(page, size) },
    { key: 'threads', name: 'Чаты', fetchFn: (page, size) => apiService.getChatThreads(page, size) },
    { key: 'messages', name: 'Сообщения', fetchFn: (page, size) => apiService.getChatMessages(page, size) }
  ];

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setStats({});
      setProgress({ current: 0, total: entities.length, percentage: 0 });

      const newStats = {};

      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        setLoadingEntity(entity.name);
        
        try {
          // Получаем первую страницу для определения общего количества
          const firstPage = await entity.fetchFn(0, 20);
          const total = firstPage.total || 0;
          
          // Для некоторых сущностей загружаем все данные для расчетов
          let allData = firstPage.data;
          let calculations = {};

          if (entity.key === 'products' && total > 20) {
            // Для товаров загружаем все данные для расчета объема и стоимости
            const pageSize = 20;
            const totalPages = Math.ceil(total / pageSize);
            
            for (let page = 1; page < totalPages; page++) {
              const pageData = await entity.fetchFn(page, pageSize);
              allData = [...allData, ...pageData.data];
              
              // Обновляем прогресс внутри загрузки товаров
              setProgress({ 
                current: i + (page / totalPages), 
                total: entities.length, 
                percentage: ((i + (page / totalPages)) / entities.length) * 100 
              });
            }
            
            // Рассчитываем дополнительную статистику для товаров
            calculations = {
              totalVolume: allData.reduce((sum, p) => sum + (p.volume || 0), 0),
              totalValue: allData.reduce((sum, p) => sum + (p.price || 0), 0),
              avgPrice: allData.length > 0 ? allData.reduce((sum, p) => sum + (p.price || 0), 0) / allData.length : 0
            };
          } else if (entity.key === 'buyers' || entity.key === 'sellers') {
            // Для пользователей считаем онлайн
            calculations = {
              online: allData.filter(u => u.is_online).length
            };
          } else if (entity.key === 'prices' && allData.length > 0) {
            // Для цен считаем среднюю цену
            calculations = {
              avgPrice: allData.reduce((sum, p) => sum + (p.price_per_m3 || 0), 0) / allData.length
            };
          }

          newStats[entity.key] = {
            total,
            data: allData,
            ...calculations
          };

        } catch (entityError) {
          console.error(`Error loading ${entity.key}:`, entityError);
          newStats[entity.key] = {
            total: 0,
            data: [],
            error: entityError.message
          };
        }

        setStats({ ...newStats });
        setProgress({ 
          current: i + 1, 
          total: entities.length, 
          percentage: ((i + 1) / entities.length) * 100 
        });

        // Небольшая задержка для визуального эффекта
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setLoadingEntity('');
      
    } catch (err) {
      console.error('Progressive stats loading error:', err);
      setError(err.message || 'Ошибка загрузки статистики');
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  const refetch = useCallback(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    progress,
    loadingEntity,
    refetch,
    loadStats
  };
};
