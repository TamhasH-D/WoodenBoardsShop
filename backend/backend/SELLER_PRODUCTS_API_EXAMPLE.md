# API для получения товаров продавца - Примеры использования

## Обзор

Новые эндпоинты позволяют продавцам безопасно получать только свои товары:

- `GET /products/my-products` - базовый список товаров продавца
- `GET /products/my-products/search` - расширенный поиск с фильтрами

## Примеры запросов

### 1. Получить все товары продавца

```bash
GET /api/v1/products/my-products?keycloak_id=550e8400-e29b-41d4-a716-446655440000
```

**Ответ:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Дубовая доска",
      "price": 1500.0,
      "volume": 0.5,
      "descrioption": "Качественная дубовая доска",
      "delivery_possible": true,
      "pickup_location": "Москва, ул. Лесная 10",
      "seller_id": "550e8400-e29b-41d4-a716-446655440000",
      "wood_type_id": "660e8400-e29b-41d4-a716-446655440000",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "offset": 0,
    "limit": 20,
    "total": 1
  }
}
```

### 2. Получить товары с пагинацией и сортировкой

```bash
GET /api/v1/products/my-products?keycloak_id=550e8400-e29b-41d4-a716-446655440000&limit=10&offset=0&sort_by=created_at&sort_order=desc
```

### 3. Поиск товаров по названию

```bash
GET /api/v1/products/my-products/search?keycloak_id=550e8400-e29b-41d4-a716-446655440000&search_query=дуб
```

### 4. Фильтрация по цене

```bash
GET /api/v1/products/my-products/search?keycloak_id=550e8400-e29b-41d4-a716-446655440000&price_min=1000&price_max=5000
```

### 5. Комплексный поиск с несколькими фильтрами

```bash
GET /api/v1/products/my-products/search?keycloak_id=550e8400-e29b-41d4-a716-446655440000&search_query=доска&price_min=500&volume_min=0.1&delivery_possible=true&sort_by=price&sort_order=asc
```

## Безопасность

- ✅ Продавец видит только свои товары
- ✅ Параметр `seller_ids` в фильтрах игнорируется и автоматически устанавливается
- ✅ Если продавец не найден - возвращается 404 ошибка
- ✅ Все существующие фильтры и сортировки поддерживаются

## Коды ответов

- `200` - Успешно получен список товаров
- `404` - Продавец с указанным keycloak_id не найден
- `422` - Ошибка валидации параметров

## Интеграция с фронтендом

### JavaScript пример

```javascript
// Получить товары продавца
async function getMyProducts(keycloakId, page = 0, size = 20) {
  const response = await fetch(
    `/api/v1/products/my-products?keycloak_id=${keycloakId}&offset=${page * size}&limit=${size}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  
  return await response.json();
}

// Поиск товаров с фильтрами
async function searchMyProducts(keycloakId, filters = {}) {
  const params = new URLSearchParams({
    keycloak_id: keycloakId,
    ...filters
  });
  
  const response = await fetch(`/api/v1/products/my-products/search?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to search products');
  }
  
  return await response.json();
}

// Использование
const keycloakId = 'your-keycloak-id';
const products = await getMyProducts(keycloakId);
const searchResults = await searchMyProducts(keycloakId, {
  search_query: 'дуб',
  price_min: 1000,
  delivery_possible: true
});
```

## Будущие улучшения

- [ ] Замена параметра `keycloak_id` на автоматическое получение из JWT токена
- [ ] Добавление кеширования результатов
- [ ] Поддержка экспорта списка товаров в различных форматах
- [ ] Добавление статистики по товарам продавца
