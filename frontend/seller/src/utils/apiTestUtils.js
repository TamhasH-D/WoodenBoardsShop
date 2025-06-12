/**
 * Утилиты для тестирования API поиска продуктов
 * Помогают проверить корректность работы исправленного API
 */

import { apiService } from '../services/api';

/**
 * Тестирование различных сценариев поиска продуктов
 */
export const testProductSearchAPI = async () => {
  console.log('🧪 Начинаем тестирование API поиска продуктов...');
  
  const testResults = {
    basicSearch: false,
    sortingTest: false,
    filteringTest: false,
    paginationTest: false,
    errorHandling: false
  };

  try {
    // Тест 1: Базовый поиск
    console.log('\n📋 Тест 1: Базовый поиск');
    const basicResult = await apiService.searchProducts({
      search_query: 'древесина'
    }, 0, 10);
    
    if (basicResult && typeof basicResult.total === 'number') {
      console.log('✅ Базовый поиск работает');
      console.log(`📊 Найдено товаров: ${basicResult.total}`);
      testResults.basicSearch = true;
    } else {
      console.log('❌ Базовый поиск не работает');
    }

    // Тест 2: Сортировка
    console.log('\n📋 Тест 2: Сортировка');
    const sortTests = [
      { sort_by: 'created_at', sort_order: 'desc' },
      { sort_by: 'price', sort_order: 'asc' },
      { sort_by: 'volume', sort_order: 'desc' },
      { sort_by: 'title', sort_order: 'asc' }
    ];

    let sortingWorking = true;
    for (const sortTest of sortTests) {
      try {
        const sortResult = await apiService.searchProducts(sortTest, 0, 5);
        console.log(`✅ Сортировка по ${sortTest.sort_by} ${sortTest.sort_order}: OK`);
      } catch (error) {
        console.log(`❌ Сортировка по ${sortTest.sort_by} ${sortTest.sort_order}: ОШИБКА`);
        sortingWorking = false;
      }
    }
    testResults.sortingTest = sortingWorking;

    // Тест 3: Фильтрация
    console.log('\n📋 Тест 3: Фильтрация');
    const filterResult = await apiService.searchProducts({
      price_min: 100,
      price_max: 1000,
      volume_min: 0.5,
      delivery_possible: true
    }, 0, 10);
    
    if (filterResult && typeof filterResult.total === 'number') {
      console.log('✅ Фильтрация работает');
      console.log(`📊 Найдено с фильтрами: ${filterResult.total}`);
      testResults.filteringTest = true;
    } else {
      console.log('❌ Фильтрация не работает');
    }

    // Тест 4: Пагинация
    console.log('\n📋 Тест 4: Пагинация');
    const page1 = await apiService.searchProducts({}, 0, 5);
    const page2 = await apiService.searchProducts({}, 1, 5);
    
    if (page1 && page2 && page1.data && page2.data) {
      console.log('✅ Пагинация работает');
      console.log(`📊 Страница 1: ${page1.data.length} товаров`);
      console.log(`📊 Страница 2: ${page2.data.length} товаров`);
      testResults.paginationTest = true;
    } else {
      console.log('❌ Пагинация не работает');
    }

    // Тест 5: Обработка ошибок
    console.log('\n📋 Тест 5: Обработка ошибок');
    try {
      // Попытка использовать неправильные параметры
      await apiService.searchProducts({
        sort_by: 'invalid_field',
        sort_order: 'invalid_order'
      }, 0, 5);
      console.log('❌ Обработка ошибок не работает (должна была быть ошибка)');
    } catch (error) {
      console.log('✅ Обработка ошибок работает');
      testResults.errorHandling = true;
    }

  } catch (error) {
    console.error('❌ Общая ошибка тестирования:', error);
  }

  // Итоговый отчет
  console.log('\n📊 ИТОГОВЫЙ ОТЧЕТ ТЕСТИРОВАНИЯ:');
  console.log('=' * 40);
  Object.entries(testResults).forEach(([test, passed]) => {
    const status = passed ? '✅' : '❌';
    const testName = test.replace(/([A-Z])/g, ' $1').toLowerCase();
    console.log(`${status} ${testName}: ${passed ? 'ПРОШЕЛ' : 'НЕ ПРОШЕЛ'}`);
  });

  const passedTests = Object.values(testResults).filter(Boolean).length;
  const totalTests = Object.keys(testResults).length;
  console.log(`\n🎯 Результат: ${passedTests}/${totalTests} тестов прошли успешно`);

  return testResults;
};

/**
 * Тестирование производительности API
 */
export const testAPIPerformance = async () => {
  console.log('\n⚡ Тестирование производительности API...');
  
  const performanceTests = [
    { name: 'Простой поиск', filters: { search_query: 'сосна' } },
    { name: 'Сложные фильтры', filters: { 
      search_query: 'древесина',
      price_min: 100,
      price_max: 1000,
      volume_min: 0.5,
      delivery_possible: true
    }},
    { name: 'Сортировка', filters: { sort_by: 'price', sort_order: 'desc' } }
  ];

  for (const test of performanceTests) {
    const startTime = performance.now();
    
    try {
      await apiService.searchProducts(test.filters, 0, 20);
      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);
      
      console.log(`✅ ${test.name}: ${duration}ms`);
    } catch (error) {
      console.log(`❌ ${test.name}: ОШИБКА`);
    }
  }
};

/**
 * Валидация структуры ответа API
 */
export const validateAPIResponse = (response) => {
  const errors = [];

  // Проверяем основную структуру
  if (!response) {
    errors.push('Ответ API пустой');
    return errors;
  }

  if (!Array.isArray(response.data)) {
    errors.push('response.data должен быть массивом');
  }

  if (!response.pagination || typeof response.pagination.total !== 'number') {
    errors.push('response.pagination.total должен быть числом');
  }

  // Проверяем структуру товаров
  if (response.data && response.data.length > 0) {
    const product = response.data[0];
    const requiredFields = [
      'id', 'title', 'price', 'volume', 
      'seller_id', 'wood_type_id', 'created_at'
    ];

    requiredFields.forEach(field => {
      if (!(field in product)) {
        errors.push(`Отсутствует обязательное поле: ${field}`);
      }
    });

    // Проверяем типы данных
    if (typeof product.price !== 'number') {
      errors.push('price должен быть числом');
    }
    if (typeof product.volume !== 'number') {
      errors.push('volume должен быть числом');
    }
  }

  return errors;
};

/**
 * Демонстрация работы исправленного API
 */
export const demonstrateAPIFixes = async () => {
  console.log('\n🔧 Демонстрация исправлений API поиска продуктов...');
  
  try {
    // Демонстрация правильной сортировки
    console.log('\n📋 Демонстрация сортировки:');
    const sortedByPrice = await apiService.searchProducts({
      sort_by: 'price',
      sort_order: 'asc'
    }, 0, 5);
    
    if (sortedByPrice.data && sortedByPrice.data.length > 1) {
      console.log('✅ Товары отсортированы по цене (по возрастанию):');
      sortedByPrice.data.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.title}: ${product.price}₽`);
      });
    }

    // Демонстрация фильтрации
    console.log('\n📋 Демонстрация фильтрации:');
    const filtered = await apiService.searchProducts({
      price_min: 500,
      price_max: 2000,
      delivery_possible: true
    }, 0, 3);
    
    console.log(`✅ Найдено товаров с доставкой (500-2000₽): ${filtered.total}`);
    
    // Демонстрация пагинации
    console.log('\n📋 Демонстрация пагинации:');
    const page1 = await apiService.searchProducts({}, 0, 3);
    const page2 = await apiService.searchProducts({}, 1, 3);
    
    console.log(`✅ Страница 1: ${page1.data.length} товаров`);
    console.log(`✅ Страница 2: ${page2.data.length} товаров`);
    console.log(`📊 Всего товаров: ${page1.total}`);

  } catch (error) {
    console.error('❌ Ошибка в демонстрации:', error);
  }
};

/**
 * Запуск всех тестов
 */
export const runAllTests = async () => {
  console.log('🚀 Запуск полного тестирования API поиска продуктов...');
  
  await testProductSearchAPI();
  await testAPIPerformance();
  await demonstrateAPIFixes();
  
  console.log('\n✨ Тестирование завершено!');
};

// Экспорт для использования в консоли браузера
if (typeof window !== 'undefined') {
  window.apiTestUtils = {
    testProductSearchAPI,
    testAPIPerformance,
    validateAPIResponse,
    demonstrateAPIFixes,
    runAllTests
  };
}
