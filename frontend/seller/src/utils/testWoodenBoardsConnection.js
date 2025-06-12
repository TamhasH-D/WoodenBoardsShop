// Утилиты для тестирования соединения с Wooden Boards API

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const WOODEN_BOARDS_API_URL = process.env.REACT_APP_WOODEN_BOARDS_API_URL || 'http://localhost:8001';

/**
 * Получить конфигурацию Wooden Boards API
 */
export const getWoodenBoardsConfig = () => {
  return {
    mainApiUrl: API_BASE_URL,
    woodenBoardsApiUrl: WOODEN_BOARDS_API_URL,
    environment: process.env.NODE_ENV,
    timeout: 60000
  };
};

/**
 * Тестировать соединение с основным API
 */
export const testWoodenBoardsConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        status: response.status,
        data: data,
        message: 'Соединение с основным API успешно'
      };
    } else {
      return {
        success: false,
        status: response.status,
        message: `Ошибка соединения: ${response.status}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Не удалось подключиться к основному API'
    };
  }
};

/**
 * Тестировать эндпоинт анализа изображений
 */
export const testImageAnalysisEndpoint = async () => {
  try {
    // Создаем тестовое изображение (1x1 пиксель PNG)
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 1, 1);
    
    // Конвертируем в blob
    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/png');
    });
    
    const formData = new FormData();
    formData.append('image', blob, 'test.png');
    
    const response = await fetch(
      `${API_BASE_URL}/api/v1/wooden-boards/calculate-volume?board_height=100&board_length=100`,
      {
        method: 'POST',
        body: formData,
        timeout: 30000
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        status: response.status,
        data: data,
        message: 'Эндпоинт анализа изображений работает'
      };
    } else {
      const errorText = await response.text();
      return {
        success: false,
        status: response.status,
        error: errorText,
        message: `Ошибка эндпоинта анализа: ${response.status}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Не удалось протестировать эндпоинт анализа изображений'
    };
  }
};

/**
 * Тестировать Wooden Boards микросервис напрямую
 */
export const testWoodenBoardsMicroservice = async () => {
  try {
    const response = await fetch(`${WOODEN_BOARDS_API_URL}/health`, {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        status: response.status,
        data: data,
        message: 'Wooden Boards микросервис доступен'
      };
    } else {
      return {
        success: false,
        status: response.status,
        message: `Ошибка Wooden Boards микросервиса: ${response.status}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Wooden Boards микросервис недоступен'
    };
  }
};

/**
 * Полный тест всех соединений
 */
export const runFullConnectionTest = async () => {
  console.log('=== Запуск полного теста соединений ===');
  
  const results = {
    config: getWoodenBoardsConfig(),
    mainApi: await testWoodenBoardsConnection(),
    imageAnalysis: await testImageAnalysisEndpoint(),
    microservice: await testWoodenBoardsMicroservice()
  };
  
  console.log('Результаты тестирования:', results);
  return results;
};

export default {
  getWoodenBoardsConfig,
  testWoodenBoardsConnection,
  testImageAnalysisEndpoint,
  testWoodenBoardsMicroservice,
  runFullConnectionTest
};
