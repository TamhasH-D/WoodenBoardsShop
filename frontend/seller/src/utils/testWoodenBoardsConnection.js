/**
 * Утилиты для тестирования соединения с микросервисом wooden-boards
 * Используется для диагностики и отладки в режиме разработки
 */

// Получение конфигурации wooden-boards микросервиса
export const getWoodenBoardsConfig = () => {
  const config = {
    baseUrl: process.env.REACT_APP_WOODEN_BOARDS_API_URL || 'http://localhost:8001',
    timeout: 60000,
    endpoints: {
      health: '/health',
      calculateVolume: '/api/v1/wooden-boards/calculate-volume'
    }
  };

  return config;
};

/**
 * Тестирование health endpoint микросервиса wooden-boards
 */
export const testWoodenBoardsConnection = async () => {
  const config = getWoodenBoardsConfig();
  const healthUrl = `${config.baseUrl}${config.endpoints.health}`;

  try {
    const response = await fetch(healthUrl, {
      method: 'GET',
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      },
    });
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        status: response.status,
        data: data,
        url: healthUrl,
        message: 'Wooden boards service is healthy'
      };
    } else {
      return {
        success: false,
        status: response.status,
        error: `HTTP ${response.status}`,
        url: healthUrl,
        message: 'Wooden boards service returned error status'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      url: healthUrl,
      message: 'Failed to connect to wooden boards service'
    };
  }
};

/**
 * Тестирование endpoint для анализа изображений
 */
export const testImageAnalysisEndpoint = async () => {
  const config = getWoodenBoardsConfig();

  // Создаем тестовое изображение (1x1 пиксель PNG)
  const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

  try {
    // Конвертируем base64 в blob
    const response = await fetch(testImageData);
    const blob = await response.blob();

    // Создаем FormData
    const formData = new FormData();
    formData.append('image', blob, 'test.png');

    // Тестовые параметры
    const testHeight = 50; // mm
    const testLength = 1000; // mm

    const analysisUrl = `${config.baseUrl}${config.endpoints.calculateVolume}?board_height=${testHeight}&board_length=${testLength}`;

    const analysisResponse = await fetch(analysisUrl, {
      method: 'POST',
      body: formData,
      timeout: 30000,
    });

    if (analysisResponse.ok) {
      const data = await analysisResponse.json();
      return {
        success: true,
        status: analysisResponse.status,
        data: data,
        url: analysisUrl,
        message: 'Image analysis endpoint is working'
      };
    } else {
      const errorText = await analysisResponse.text();
      return {
        success: false,
        status: analysisResponse.status,
        error: errorText,
        url: analysisUrl,
        message: 'Image analysis endpoint returned error'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      url: `${config.baseUrl}${config.endpoints.calculateVolume}`,
      message: 'Failed to test image analysis endpoint'
    };
  }
};

/**
 * Комплексное тестирование всех endpoints
 */
export const runFullConnectionTest = async () => {
  console.log('🔧 Starting full wooden boards connection test...');

  const config = getWoodenBoardsConfig();
  console.log('Configuration:', config);

  const healthTest = await testWoodenBoardsConnection();
  console.log('Health test result:', healthTest);

  const endpointTest = await testImageAnalysisEndpoint();
  console.log('Endpoint test result:', endpointTest);

  const results = {
    config,
    health: healthTest,
    imageAnalysis: endpointTest,
    overall: healthTest.success && endpointTest.success
  };

  console.log('Full test results:', results);
  return results;
};

// Экспорт по умолчанию
const testUtils = {
  getWoodenBoardsConfig,
  testWoodenBoardsConnection,
  testImageAnalysisEndpoint,
  runFullConnectionTest
};

export default testUtils;
