# Расширенный API поиска товаров

## Обзор

Реализован новый endpoint для расширенного поиска и фильтрации товаров с полной поддержкой сортировки и пагинации.

## Новый Endpoint

### `GET /api/v1/products/search`

Расширенный поиск товаров с поддержкой множественных фильтров и сортировки.

## Параметры запроса

### Пагинация и сортировка
- `offset` (int, по умолчанию 0) - Смещение для пагинации
- `limit` (int, по умолчанию 20, макс 20) - Количество записей на странице
- `sort_by` (string) - Поле для сортировки (price, volume, title, created_at, etc.)
- `sort_order` (string, по умолчанию "asc") - Порядок сортировки ("asc" или "desc")

### Фильтры поиска
- `search_query` (string) - Текстовый поиск по названию и описанию
- `price_min` (float, >=0) - Минимальная цена
- `price_max` (float, >=0) - Максимальная цена
- `volume_min` (float, >=0) - Минимальный объем
- `volume_max` (float, >=0) - Максимальный объем
- `wood_type_ids` (array[UUID]) - Фильтр по типам древесины (можно указать несколько)
- `seller_ids` (array[UUID]) - Фильтр по продавцам (можно указать несколько)
- `delivery_possible` (boolean) - Фильтр по возможности доставки
- `has_pickup_location` (boolean) - Фильтр по наличию места самовывоза
- `created_after` (datetime) - Товары созданные после указанной даты
- `created_before` (datetime) - Товары созданные до указанной даты

## Примеры использования

### Базовый поиск
```
GET /api/v1/products/search
```

### Поиск по тексту с сортировкой по цене
```
GET /api/v1/products/search?search_query=дуб&sort_by=price&sort_order=asc
```

### Фильтрация по диапазону цен
```
GET /api/v1/products/search?price_min=1000&price_max=5000
```

### Множественный выбор типов древесины
```
GET /api/v1/products/search?wood_type_ids=uuid1&wood_type_ids=uuid2
```

### Комбинированные фильтры
```
GET /api/v1/products/search?search_query=доски&price_min=2000&volume_min=0.5&delivery_possible=true&sort_by=created_at&sort_order=desc
```

### Фильтрация по дате создания
```
GET /api/v1/products/search?created_after=2024-01-01T00:00:00Z&created_before=2024-12-31T23:59:59Z
```

## Формат ответа

```json
{
  "data": [
    {
      "id": "UUID",
      "volume": "float",
      "price": "float",
      "title": "string",
      "descrioption": "string | null",
      "delivery_possible": "boolean",
      "pickup_location": "string | null",
      "created_at": "datetime",
      "updated_at": "datetime",
      "seller_id": "UUID",
      "wood_type_id": "UUID"
    }
  ],
  "pagination": {
    "total": "integer"
  }
}
```

## Особенности реализации

### Архитектура
- **ProductFilterDTO** - Pydantic модель для валидации параметров фильтрации
- **ProductDAO.get_filtered_results()** - Метод для выполнения сложных запросов с фильтрацией
- **Обратная совместимость** - Существующий endpoint `/api/v1/products/` продолжает работать

### Производительность
- Использование индексов БД для оптимизации запросов
- Эффективные SQL запросы с использованием SQLAlchemy
- Поддержка пагинации для больших наборов данных

### Валидация
- Автоматическая валидация всех параметров через Pydantic
- Проверка диапазонов значений (цены >= 0, лимит <= 20)
- Валидация UUID для фильтров по связанным сущностям

## Тестирование

Добавлены comprehensive тесты в `tests/endpoint_tests/product/test_search_products.py`:
- Тесты всех типов фильтрации
- Тесты сортировки
- Тесты пагинации
- Тесты комбинированных фильтров
- Тесты валидации параметров

## Использование во фронтенде

### Для каталога покупателя
```javascript
// Поиск товаров с фильтрами
const searchProducts = async (filters) => {
  const params = new URLSearchParams();
  
  if (filters.searchQuery) params.append('search_query', filters.searchQuery);
  if (filters.priceMin) params.append('price_min', filters.priceMin);
  if (filters.priceMax) params.append('price_max', filters.priceMax);
  if (filters.woodTypeIds) {
    filters.woodTypeIds.forEach(id => params.append('wood_type_ids', id));
  }
  if (filters.deliveryPossible !== undefined) {
    params.append('delivery_possible', filters.deliveryPossible);
  }
  
  params.append('sort_by', filters.sortBy || 'created_at');
  params.append('sort_order', filters.sortOrder || 'desc');
  params.append('offset', filters.offset || 0);
  params.append('limit', filters.limit || 20);
  
  const response = await fetch(`/api/v1/products/search?${params}`);
  return response.json();
};
```

### Для админ панели
```javascript
// Получение всех товаров с фильтрацией
const getFilteredProducts = async (adminFilters) => {
  // Аналогично, но с дополнительными фильтрами для администратора
  // например, по продавцам, датам создания и т.д.
};
```

## Миграция с существующего API

Существующий код продолжит работать без изменений. Для использования новых возможностей:

1. Замените `/api/v1/products/` на `/api/v1/products/search`
2. Добавьте необходимые параметры фильтрации
3. Обновите обработку ответов (структура остается той же)

## Совместимость

- ✅ Python 3.10+
- ✅ Обратная совместимость с существующим API
- ✅ Все существующие тесты проходят
- ✅ Следует архитектурной философии проекта
