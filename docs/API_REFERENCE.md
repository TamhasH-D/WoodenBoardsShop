# 📚 API Reference - WoodenBoardsShop

Полная документация REST API системы WoodenBoardsShop.

## 🌐 Базовая информация

- **Base URL**: `http://localhost:8000/api/v1`
- **Документация**: `http://localhost:8000/docs` (Swagger UI)
- **Формат данных**: JSON
- **Аутентификация**: JWT токены через Keycloak

## 📊 Основные сущности

Система управляет 9 основными сущностями:

1. **Buyer** - покупатели товаров
2. **Seller** - продавцы товаров
3. **Product** - товары в маркетплейсе
4. **WoodType** - типы древесины
5. **WoodTypePrice** - исторические цены на древесину
6. **Image** - изображения товаров
7. **WoodenBoard** - результаты AI анализа досок
8. **ChatThread** - потоки общения
9. **ChatMessage** - сообщения в чатах

## 🔧 Системные endpoints

### Health Check
```http
GET /api/v1/health
```
Проверка состояния системы.

### Demo endpoints
```http
POST /api/v1/demo/set-redis
GET /api/v1/demo/get-redis
```
Демонстрационные endpoints для работы с Redis.

## 👥 Управление пользователями

### Покупатели (Buyers)
```http
GET    /api/v1/buyers           # Список покупателей (пагинация)
POST   /api/v1/buyers           # Создание покупателя
GET    /api/v1/buyers/{id}      # Получение покупателя по ID
PUT    /api/v1/buyers/{id}      # Обновление покупателя
DELETE /api/v1/buyers/{id}      # Удаление покупателя
```

### Продавцы (Sellers)
```http
GET    /api/v1/sellers          # Список продавцов (пагинация)
POST   /api/v1/sellers          # Создание продавца
GET    /api/v1/sellers/{id}     # Получение продавца по ID
PUT    /api/v1/sellers/{id}     # Обновление продавца
DELETE /api/v1/sellers/{id}     # Удаление продавца
```

## 🛒 Управление товарами

### Товары (Products)
```http
GET    /api/v1/products                # Список товаров (пагинация)
POST   /api/v1/products                # Создание товара
POST   /api/v1/products/with-image     # Создание товара с AI анализом изображения
GET    /api/v1/products/{id}           # Получение товара по ID
PUT    /api/v1/products/{id}           # Обновление товара
DELETE /api/v1/products/{id}           # Удаление товара
```

**Особенность**: endpoint `/products/with-image` интегрирован с AI микросервисом для автоматического анализа изображений досок.

### Типы древесины (Wood Types)
```http
GET    /api/v1/wood_types       # Список типов древесины
POST   /api/v1/wood_types       # Создание типа древесины
GET    /api/v1/wood_types/{id}  # Получение типа по ID
PUT    /api/v1/wood_types/{id}  # Обновление типа
DELETE /api/v1/wood_types/{id}  # Удаление типа
```

### Цены на древесину (Wood Type Prices)
```http
GET    /api/v1/wood_type_prices       # История цен (пагинация)
POST   /api/v1/wood_type_prices       # Добавление цены
GET    /api/v1/wood_type_prices/{id}  # Получение цены по ID
PUT    /api/v1/wood_type_prices/{id}  # Обновление цены
DELETE /api/v1/wood_type_prices/{id}  # Удаление цены
```

## 🖼️ Управление изображениями

### Изображения (Images)
```http
GET    /api/v1/images       # Список изображений (пагинация)
POST   /api/v1/images       # Загрузка изображения
GET    /api/v1/images/{id}  # Получение изображения по ID
DELETE /api/v1/images/{id}  # Удаление изображения
```

## 🤖 AI анализ досок

### Деревянные доски (Wooden Boards)
```http
GET    /api/v1/wooden-boards       # Результаты анализа (пагинация)
POST   /api/v1/wooden-boards       # Создание записи анализа
GET    /api/v1/wooden-boards/{id}  # Получение результата по ID
PUT    /api/v1/wooden-boards/{id}  # Обновление результата
DELETE /api/v1/wooden-boards/{id}  # Удаление результата
```

## 💬 Система чатов

### Потоки чатов (Chat Threads)
```http
GET    /api/v1/chat_threads       # Список потоков (пагинация)
POST   /api/v1/chat_threads       # Создание потока
GET    /api/v1/chat_threads/{id}  # Получение потока по ID
PUT    /api/v1/chat_threads/{id}  # Обновление потока
DELETE /api/v1/chat_threads/{id}  # Удаление потока
```

### Сообщения чатов (Chat Messages)
```http
GET    /api/v1/chat_messages       # Список сообщений (пагинация)
POST   /api/v1/chat_messages       # Отправка сообщения
GET    /api/v1/chat_messages/{id}  # Получение сообщения по ID
PUT    /api/v1/chat_messages/{id}  # Обновление сообщения
DELETE /api/v1/chat_messages/{id}  # Удаление сообщения
```

## 📝 Формат данных

### Пагинация
Все GET endpoints с множественными результатами поддерживают пагинацию:

```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0
  }
}
```

### UUID генерация
Все создаваемые объекты требуют UUID, генерируемый на frontend:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "...": "other fields"
}
```

### Обработка ошибок
API возвращает стандартные HTTP коды ошибок с детальными сообщениями:

```json
{
  "detail": "Описание ошибки",
  "error_code": "VALIDATION_ERROR"
}
```

## 🔗 Интеграция с AI микросервисом

### Анализ объема досок
Endpoint `/products/with-image` автоматически:
1. Принимает изображение досок
2. Отправляет на AI микросервис (порт 8001)
3. Получает результаты анализа (размеры, объем)
4. Создает товар с рассчитанными параметрами

### AI микросервис endpoints
- **Base URL**: `http://localhost:8001`
- **Анализ досок**: `POST /wooden_boards_volume_seg/`
- **Health check**: `GET /healthcheck`

## 📋 Примеры использования

### Создание товара с AI анализом
```http
POST /api/v1/products/with-image
Content-Type: multipart/form-data

{
  "product_data": {
    "id": "uuid",
    "title": "Доски сосновые",
    "seller_id": "seller_uuid",
    "wood_type_id": "wood_type_uuid"
  },
  "image": "binary_image_data",
  "board_height": 25.0,
  "board_length": 3000.0
}
```

### Получение списка товаров
```http
GET /api/v1/products?limit=20&offset=0

Response:
{
  "data": [
    {
      "id": "uuid",
      "title": "Доски сосновые",
      "price": 15000.0,
      "volume": 0.75,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0
  }
}
```

## 🔐 Аутентификация

Система использует Keycloak для аутентификации:
- **Keycloak URL**: `http://localhost:8030`
- **Realm**: настраивается в конфигурации
- **Токены**: JWT токены в заголовке `Authorization: Bearer <token>`

## 📊 Мониторинг и логирование

- **Логи**: структурированные логи через Loguru
- **Метрики**: доступны через health endpoints
- **Трассировка**: поддержка distributed tracing

---

Для получения актуальной интерактивной документации посетите `/docs` endpoint после запуска системы.
