# Исправления API поиска продуктов с фильтрацией и сортировкой

## Обнаруженные проблемы

### 1. Неправильный порядок операций в SQL запросе
**Проблема**: В методе `ProductDAO.get_filtered_results()` сортировка применялась ПОСЛЕ пагинации (offset/limit), что приводило к неправильным результатам.

**Было**:
```python
# Применяем пагинацию
query = query.offset(pagination.offset).limit(pagination.limit)

# Применяем сортировку ПОСЛЕ пагинации (НЕПРАВИЛЬНО!)
if hasattr(pagination, 'sort_by') and hasattr(pagination, 'sort_order'):
    query = self._apply_sort(query, pagination.sort_by, pagination.sort_order)
```

**Стало**:
```python
# Применяем сортировку ДО пагинации (ПРАВИЛЬНО!)
if hasattr(pagination, 'sort_by') and hasattr(pagination, 'sort_order'):
    query = self._apply_sort(query, pagination.sort_by, pagination.sort_order)

# Применяем пагинацию ПОСЛЕ сортировки
query = query.offset(pagination.offset).limit(pagination.limit)
```

### 2. Ошибка в методе сортировки BaseDAO._apply_sort()
**Проблема**: Использовался `getattr(sa, sort_order)`, но `sort_order` это строка ("asc"/"desc"), а не функция SQLAlchemy.

**Было**:
```python
return query.order_by(
    getattr(sa, sort_order)(getattr(self.model, sort_by)),
)
```

**Стало**:
```python
# Normalize sort_order and apply correct SQLAlchemy function
sort_order = sort_order.lower()
if sort_order not in ['asc', 'desc']:
    raise ValueError(f"Invalid sort order: {sort_order}. Must be 'asc' or 'desc'")

column = getattr(self.model, sort_by)
if sort_order == 'desc':
    return query.order_by(sa.desc(column))
else:
    return query.order_by(sa.asc(column))
```

### 3. Отсутствие валидации параметров сортировки
**Проблема**: В `PaginationParamsSortBy` не было валидации для `sort_order`.

**Было**:
```python
sort_order: str = "asc"
```

**Стало**:
```python
sort_order: str = Field("asc", pattern="^(asc|desc)$", description="Sort order: asc or desc")
```

### 4. Совместимость с Pydantic v2
**Проблема**: Использовался устаревший параметр `regex` вместо `pattern`.

**Исправлено**: Заменен `regex` на `pattern` для совместимости с Pydantic v2.

## Результат исправлений

### Правильная структура SQL запроса
После исправлений SQL запрос генерируется в правильном порядке:

```sql
SELECT product.id, product.volume, product.price, product.title, product.descrioption, 
       product.delivery_possible, product.pickup_location, product.created_at, 
       product.updated_at, product.seller_id, product.wood_type_id 
FROM product 
WHERE (lower(product.title) LIKE :lower_1 OR lower(product.descrioption) LIKE :lower_2) 
  AND product.price >= :price_1 
  AND product.price <= :price_2 
  AND product.delivery_possible = true 
ORDER BY product.created_at DESC    -- Сортировка ДО пагинации
LIMIT :param_1 OFFSET :param_2      -- Пагинация ПОСЛЕ сортировки
```

### Улучшенная валидация
- ✅ Проверка существования поля для сортировки
- ✅ Валидация значений `sort_order` (только "asc" или "desc")
- ✅ Правильная обработка ошибок с информативными сообщениями

### Тестирование
Созданы тесты, подтверждающие корректность исправлений:
- ✅ Метод `_apply_sort()` работает корректно
- ✅ Валидация параметров работает
- ✅ Порядок операций в SQL запросе правильный
- ✅ Обработка ошибок функционирует

## Файлы, которые были изменены

1. `backend/backend/backend/daos/base_daos.py`
   - Исправлен метод `_apply_sort()`
   - Исправлен порядок операций в `get_offset_results()`

2. `backend/backend/backend/daos/product_daos.py`
   - Исправлен порядок операций в `get_filtered_results()`

3. `backend/backend/backend/dtos/__init__.py`
   - Добавлена валидация для `PaginationParamsSortBy`
   - Исправлена совместимость с Pydantic v2

## API Endpoint
Исправления затрагивают endpoint:
```
GET /api/v1/products/search
```

Параметры запроса:
- `offset`, `limit` - пагинация
- `sort_by`, `sort_order` - сортировка
- Фильтры: `search_query`, `price_min`, `price_max`, `volume_min`, `volume_max`, и др.

## Совместимость
Изменения обратно совместимы - существующие вызовы API будут работать корректно, но теперь с правильной сортировкой и пагинацией.
