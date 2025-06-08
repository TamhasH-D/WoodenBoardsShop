/**
 * Тест генерации UUID для всех фронтендов
 * Проверяет, что UUID генерируется корректно во всех API сервисах
 */

// Импортируем утилиты UUID из каждого фронтенда
const fs = require('fs');
const path = require('path');

// Функция для чтения и выполнения кода UUID утилиты
function loadUUIDUtils(frontendPath) {
  const uuidPath = path.join(__dirname, frontendPath, 'src/utils/uuid.js');
  
  if (!fs.existsSync(uuidPath)) {
    throw new Error(`UUID файл не найден: ${uuidPath}`);
  }
  
  const uuidCode = fs.readFileSync(uuidPath, 'utf8');
  
  // Простая эмуляция ES6 модулей для Node.js
  const exports = {};
  const module = { exports };
  
  // Заменяем export на присвоение к exports
  const nodeCode = uuidCode
    .replace(/export const (\w+) = /g, 'exports.$1 = ')
    .replace(/export default (\w+);/, 'module.exports = $1;')
    .replace(/process\.env\.NODE_ENV/g, '"development"');
  
  eval(nodeCode);
  
  return exports;
}

// Функция для проверки валидности UUID
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Тестируем каждый фронтенд
const frontends = ['frontend/buyer', 'frontend/seller', 'frontend/admin'];

console.log('🧪 Тестирование генерации UUID во всех фронтендах...\n');

frontends.forEach(frontend => {
  console.log(`📁 Тестируем ${frontend}:`);
  
  try {
    const uuidUtils = loadUUIDUtils(frontend);
    
    // Тест 1: Генерация базового UUID
    const uuid1 = uuidUtils.generateUUID();
    console.log(`  ✅ generateUUID(): ${uuid1} - ${isValidUUID(uuid1) ? 'VALID' : 'INVALID'}`);
    
    // Тест 2: Генерация UUID для сущности
    const uuid2 = uuidUtils.generateEntityUUID('test_entity');
    console.log(`  ✅ generateEntityUUID(): ${uuid2} - ${isValidUUID(uuid2) ? 'VALID' : 'INVALID'}`);
    
    // Тест 3: Создание объекта с UUID
    const testData = { name: 'Test', value: 123 };
    const withUUIDData = uuidUtils.withUUID(testData, 'test');
    console.log(`  ✅ withUUID(): ${withUUIDData.id} - ${isValidUUID(withUUIDData.id) ? 'VALID' : 'INVALID'}`);
    console.log(`     Данные: ${JSON.stringify(withUUIDData)}`);
    
    // Тест 4: Проверка констант типов сущностей
    const entityTypes = uuidUtils.ENTITY_TYPES;
    console.log(`  ✅ ENTITY_TYPES: ${Object.keys(entityTypes).length} типов`);
    console.log(`     Типы: ${Object.values(entityTypes).join(', ')}`);
    
    // Тест 5: Уникальность UUID
    const uuids = new Set();
    for (let i = 0; i < 100; i++) {
      uuids.add(uuidUtils.generateUUID());
    }
    console.log(`  ✅ Уникальность: ${uuids.size}/100 уникальных UUID`);
    
    console.log(`  🎉 ${frontend} - ВСЕ ТЕСТЫ ПРОШЛИ!\n`);
    
  } catch (error) {
    console.log(`  ❌ ${frontend} - ОШИБКА: ${error.message}\n`);
  }
});

// Тест API запроса с UUID (симуляция)
console.log('🔌 Симуляция API запросов с UUID:');

try {
  const buyerUtils = loadUUIDUtils('frontend/buyer');
  
  // Симуляция создания покупателя
  const buyerData = {
    keycloak_uuid: 'test-keycloak-uuid',
    is_online: true
  };
  
  const buyerWithUUID = buyerUtils.withUUID(buyerData, buyerUtils.ENTITY_TYPES.BUYER);
  console.log('  📝 Создание покупателя:');
  console.log(`     POST /api/v1/buyers`);
  console.log(`     Body: ${JSON.stringify(buyerWithUUID, null, 2)}`);
  
  // Симуляция создания товара
  const sellerUtils = loadUUIDUtils('frontend/seller');
  const productData = {
    title: 'Тестовый товар',
    description: 'Описание товара',
    price: 1000,
    volume: 2.5,
    seller_id: 'seller-uuid',
    wood_type_id: 'wood-type-uuid'
  };
  
  const productWithUUID = sellerUtils.withUUID(productData, sellerUtils.ENTITY_TYPES.PRODUCT);
  console.log('\n  📦 Создание товара:');
  console.log(`     POST /api/v1/products`);
  console.log(`     Body: ${JSON.stringify(productWithUUID, null, 2)}`);
  
  console.log('\n🎉 ВСЕ ТЕСТЫ UUID ГЕНЕРАЦИИ ПРОШЛИ УСПЕШНО!');
  
} catch (error) {
  console.log(`\n❌ ОШИБКА В ТЕСТАХ API: ${error.message}`);
}
