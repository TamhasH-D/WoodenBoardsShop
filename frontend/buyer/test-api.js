#!/usr/bin/env node

/**
 * Простой скрипт для тестирования API изображений
 * Запуск: node test-api.js
 */

const https = require('https');
const http = require('http');

const API_BASE_URL = 'http://localhost:8000';

// Функция для выполнения HTTP запросов
function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Node.js Test Script'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Тесты
async function runTests() {
  console.log('🚀 Тестирование API изображений для Frontend Buyer\n');

  // Тест 1: Проверка доступности backend
  console.log('1️⃣ Проверка доступности backend...');
  try {
    const healthResponse = await makeRequest(`${API_BASE_URL}/api/v1/health`);
    if (healthResponse.status === 200) {
      console.log('✅ Backend доступен');
      console.log(`   Статус: ${healthResponse.status}`);
      console.log(`   Ответ: ${JSON.stringify(healthResponse.data)}\n`);
    } else {
      console.log(`❌ Backend недоступен (статус: ${healthResponse.status})\n`);
      return;
    }
  } catch (error) {
    console.log(`❌ Ошибка подключения к backend: ${error.message}`);
    console.log('   Убедитесь, что backend запущен на порту 8000\n');
    return;
  }

  // Тест 2: Получение списка изображений
  console.log('2️⃣ Получение списка изображений...');
  try {
    const imagesResponse = await makeRequest(`${API_BASE_URL}/api/v1/images?offset=0&limit=10`);
    if (imagesResponse.status === 200) {
      const images = imagesResponse.data.data || [];
      console.log(`✅ Получено ${images.length} изображений`);
      
      if (images.length > 0) {
        console.log('   Примеры изображений:');
        images.slice(0, 3).forEach((img, index) => {
          console.log(`   ${index + 1}. ID: ${img.id}`);
          console.log(`      Product ID: ${img.product_id}`);
          console.log(`      Path: ${img.image_path}`);
        });
        
        // Тест 3: Проверка загрузки конкретного изображения
        console.log('\n3️⃣ Тестирование загрузки конкретного изображения...');
        const testImage = images[0];
        
        try {
          // Проверяем метаданные
          const metaResponse = await makeRequest(`${API_BASE_URL}/api/v1/images/${testImage.id}`);
          if (metaResponse.status === 200) {
            console.log(`✅ Метаданные изображения ${testImage.id} получены`);
            
            // Проверяем файл изображения
            const fileResponse = await makeRequest(`${API_BASE_URL}/api/v1/images/${testImage.id}/file`);
            if (fileResponse.status === 200) {
              console.log(`✅ Файл изображения ${testImage.id} доступен`);
              console.log(`   Content-Type: ${fileResponse.headers['content-type']}`);
              console.log(`   Content-Length: ${fileResponse.headers['content-length']} bytes`);
            } else {
              console.log(`❌ Файл изображения недоступен (статус: ${fileResponse.status})`);
            }
          } else {
            console.log(`❌ Метаданные изображения недоступны (статус: ${metaResponse.status})`);
          }
        } catch (error) {
          console.log(`❌ Ошибка тестирования изображения: ${error.message}`);
        }
        
        // Тест 4: Группировка по товарам
        console.log('\n4️⃣ Анализ изображений по товарам...');
        const productGroups = {};
        images.forEach(img => {
          if (!productGroups[img.product_id]) {
            productGroups[img.product_id] = [];
          }
          productGroups[img.product_id].push(img);
        });
        
        console.log(`✅ Найдено ${Object.keys(productGroups).length} товаров с изображениями`);
        Object.entries(productGroups).slice(0, 3).forEach(([productId, productImages]) => {
          console.log(`   Товар ${productId}: ${productImages.length} изображений`);
        });
        
      } else {
        console.log('⚠️  В базе данных нет изображений');
        console.log('   Загрузите изображения через seller frontend или API');
      }
    } else {
      console.log(`❌ Ошибка получения изображений (статус: ${imagesResponse.status})`);
    }
  } catch (error) {
    console.log(`❌ Ошибка запроса изображений: ${error.message}`);
  }

  console.log('\n📋 Резюме тестирования:');
  console.log('   - Проверьте консоль браузера в frontend для дополнительных логов');
  console.log('   - Откройте test-images.html для интерактивного тестирования');
  console.log('   - Убедитесь, что CORS настроен правильно в backend');
  console.log('\n🔧 Для отладки проблем смотрите IMAGES_DEBUG.md');
}

// Запуск тестов
runTests().catch(error => {
  console.error('💥 Критическая ошибка:', error.message);
  process.exit(1);
});
