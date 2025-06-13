# Документация API: Эндпоинты продуктов

## Эндпоинты, связанные с продуктами

### Создание продукта

- **Метод:** POST
- **Путь:** `/products/`
- **Описание:** Создает новый продукт.

- **Ожидаемые входные данные (ProductInputDTO):**
  ```json
  {
    "id": "UUID", // Уникальный идентификатор продукта
    "volume": "float", // Объем продукта
    "price": "float", // Цена продукта
    "title": "string", // Название продукта
    "descrioption": "string | null", // Описание продукта (необязательно)
    "delivery_possible": "boolean", // Возможна ли доставка (по умолчанию false)
    "pickup_location": "string | null", // Место самовывоза (необязательно)
    "seller_id": "UUID", // Идентификатор продавца
    "wood_type_id": "UUID" // Идентификатор типа древесины
  }
  ```

- **Формат выходных данных (DataResponse[ProductDTO]):**
  ```json
  {
    "data": {
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
  }
  ```

### Обновление продукта

- **Метод:** PATCH
- **Путь:** `/products/{product_id}`
- **Описание:** Обновляет существующий продукт по его идентификатору.

- **Параметры пути:**
  - `product_id`: UUID - Уникальный идентификатор продукта, который нужно обновить.

- **Ожидаемые входные данные (ProductUpdateDTO):**
  ```json
  {
    "volume": "float | null",
    "price": "float | null",
    "title": "string | null",
    "descrioption": "string | null",
    "delivery_possible": "boolean | null",
    "pickup_location": "string | null",
    "seller_id": "UUID | null",
    "wood_type_id": "UUID | null"
  }
  ```

- **Формат выходных данных (EmptyResponse):**
  ```json
  {
    "data": null
  }
  ```

### Удаление продукта

- **Метод:** DELETE
- **Путь:** `/products/{product_id}`
- **Описание:** Удаляет существующий продукт по его идентификатору.

- **Параметры пути:**
  - `product_id`: UUID - Уникальный идентификатор продукта, который нужно удалить.

- **Формат выходных данных (EmptyResponse):**
  ```json
  {
    "data": null
  }
  ```

### Получение списка продуктов с пагинацией

- **Метод:** GET
- **Путь:** `/products/`
- **Описание:** Возвращает список всех продуктов с использованием пагинации.

- **Параметры запроса (PaginationParams):
  - `offset`: integer (по умолчанию 0, >=0) - Смещение для пагинации.
  - `limit`: integer (по умолчанию 20, >=1, <=20) - Количество записей на странице.

- **Формат выходных данных (OffsetResults[ProductDTO]):**
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
      "total": "integer" // Общее количество продуктов
    }
  }
  ```

### Расширенный поиск и фильтрация продуктов

- **Метод:** GET
- **Путь:** `/products/search`
- **Описание:** Расширенный поиск и фильтрация продуктов с поддержкой сортировки.

- **Параметры запроса:**

  **Пагинация и сортировка:**
  - `offset`: integer (по умолчанию 0, >=0) - Смещение для пагинации
  - `limit`: integer (по умолчанию 20, >=1, <=20) - Количество записей на странице
  - `sort_by`: string - Поле для сортировки (price, volume, title, created_at, etc.)
  - `sort_order`: string (по умолчанию "asc") - Порядок сортировки ("asc" или "desc")

  **Фильтры поиска:**
  - `search_query`: string (optional) - Текстовый поиск по названию и описанию
  - `price_min`: float (optional, >=0) - Минимальная цена
  - `price_max`: float (optional, >=0) - Максимальная цена
  - `volume_min`: float (optional, >=0) - Минимальный объем
  - `volume_max`: float (optional, >=0) - Максимальный объем
  - `wood_type_ids`: array[UUID] (optional) - Фильтр по типам древесины
  - `seller_ids`: array[UUID] (optional) - Фильтр по продавцам
  - `delivery_possible`: boolean (optional) - Фильтр по возможности доставки
  - `has_pickup_location`: boolean (optional) - Фильтр по наличию места самовывоза
  - `created_after`: datetime (optional) - Товары созданные после указанной даты
  - `created_before`: datetime (optional) - Товары созданные до указанной даты

- **Примеры запросов:**
  ```
  GET /products/search?search_query=дуб&price_min=1000&price_max=5000&sort_by=price&sort_order=asc
  GET /products/search?wood_type_ids=uuid1&wood_type_ids=uuid2&delivery_possible=true
  GET /products/search?volume_min=0.5&has_pickup_location=true&sort_by=created_at&sort_order=desc
  ```

### Получение товаров текущего продавца

- **Метод:** GET
- **Путь:** `/products/my-products`
- **Описание:** Получает список товаров для текущего продавца с поддержкой пагинации и сортировки.

- **Параметры запроса:**
  - `keycloak_id`: UUID (обязательный) - Keycloak UUID продавца
  - `offset`: integer (optional, default=0) - Смещение для пагинации
  - `limit`: integer (optional, default=20, max=20) - Количество записей на страницу
  - `sort_by`: string (optional) - Поле для сортировки
  - `sort_order`: string (optional, "asc"|"desc", default="desc") - Порядок сортировки

- **Ответ:** Пагинированный список товаров продавца
  ```json
  {
    "data": [ProductDTO],
    "pagination": {
      "offset": 0,
      "limit": 20,
      "total": 100
    }
  }
  ```

- **Коды ответов:**
  - `200` - Успешно получен список товаров
  - `404` - Продавец не найден
  - `422` - Ошибка валидации параметров

### Поиск товаров текущего продавца

- **Метод:** GET
- **Путь:** `/products/my-products/search`
- **Описание:** Расширенный поиск и фильтрация товаров для текущего продавца.

- **Параметры запроса:**
  - `keycloak_id`: UUID (обязательный) - Keycloak UUID продавца
  - Все параметры пагинации и сортировки из `/products/my-products`
  - Все фильтры из `/products/search` (кроме `seller_ids` - автоматически устанавливается)

  **Доступные фильтры:**
  - `search_query`: string (optional) - Текстовый поиск по названию и описанию
  - `price_min`: float (optional, >=0) - Минимальная цена
  - `price_max`: float (optional, >=0) - Максимальная цена
  - `volume_min`: float (optional, >=0) - Минимальный объем
  - `volume_max`: float (optional, >=0) - Максимальный объем
  - `wood_type_ids`: array[UUID] (optional) - Фильтр по типам древесины
  - `delivery_possible`: boolean (optional) - Фильтр по возможности доставки
  - `has_pickup_location`: boolean (optional) - Фильтр по наличию места самовывоза
  - `created_after`: datetime (optional) - Товары созданные после указанной даты
  - `created_before`: datetime (optional) - Товары созданные до указанной даты

- **Примеры запросов:**
  ```
  GET /products/my-products?keycloak_id=uuid&sort_by=created_at&sort_order=desc
  GET /products/my-products/search?keycloak_id=uuid&search_query=дуб&price_min=1000
  GET /products/my-products/search?keycloak_id=uuid&wood_type_ids=uuid1&delivery_possible=true
  ```

- **Безопасность:**
  - Продавец может видеть только свои товары
  - Параметр `seller_ids` игнорируется и автоматически устанавливается в ID текущего продавца
  - В будущем `keycloak_id` будет получаться из JWT токена аутентификации

- **Формат выходных данных (OffsetResults[ProductDTO]):**
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
      "total": "integer" // Общее количество найденных продуктов
    }
  }
  ```

### Получение продукта по ID

- **Метод:** GET
- **Путь:** `/products/{product_id}`
- **Описание:** Возвращает информацию о продукте по его идентификатору.

- **Параметры пути:**
  - `product_id`: UUID - Уникальный идентификатор продукта.

- **Формат выходных данных (DataResponse[ProductDTO]):**
  ```json
  {
    "data": {
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
  }
  ```

### Получение изображения товара

- **Метод:** GET
- **Путь:** `/products/{product_id}/image`
- **Описание:** Получает основное изображение товара по ID товара.

- **Параметры пути:**
  - `product_id`: UUID - Уникальный идентификатор товара

- **Ответ:** Файл изображения
  - **Content-Type:** `image/jpeg`, `image/png`, `image/gif`, `image/webp`
  - **Заголовки:**
    - `Content-Disposition: attachment; filename="product_{product_id}.{ext}"`

- **Коды ответов:**
  - `200` - Изображение успешно возвращено
  - `404` - Товар не найден или у товара нет изображений

- **Примеры использования:**
  ```
  GET /products/550e8400-e29b-41d4-a716-446655440000/image
  ```

- **Особенности:**
  - Возвращает первое найденное изображение для товара
  - Поддерживает все основные форматы изображений
  - Автоматически определяет MIME-тип по расширению файла
  - Использует новую иерархическую структуру хранения файлов

### Создание товара с анализом изображения

- **Метод:** POST
- **Путь:** `/products/with-image`
- **Описание:** Создает новый товар с анализом изображения досок через YOLO backend.

- **Формат входных данных (multipart/form-data):**
  - `keycloak_id`: UUID - Keycloak UUID продавца
  - `title`: string - Название товара (1-200 символов)
  - `description`: string (optional) - Описание товара (до 1000 символов)
  - `wood_type_id`: UUID - Тип древесины
  - `board_height`: float - Высота доски в мм (0-1000)
  - `board_length`: float - Длина доски в мм (0-10000)
  - `volume`: float - Объем в м³ (больше 0)
  - `price`: float - Цена в рублях (больше 0)
  - `delivery_possible`: boolean (optional) - Возможность доставки
  - `pickup_location`: string (optional) - Адрес самовывоза (до 500 символов)
  - `image`: file - Изображение досок для анализа

- **Формат выходных данных (DataResponse[ProductWithImageResponseDTO]):**
  ```json
  {
    "data": {
      "product_id": "UUID",
      "seller_id": "UUID",
      "image_id": "UUID",
      "analysis_result": {
        "total_volume": "float",
        "total_count": "int",
        "wooden_boards": [
          {
            "volume": "float",
            "height": "float",
            "width": "float",
            "length": "float",
            "detection": {
              "confidence": "float",
              "class_name": "string",
              "points": [{"x": "float", "y": "float"}]
            }
          }
        ]
      },
      "wooden_boards_count": "int",
      "total_volume": "float",
      "message": "string"
    }
  }
  ```

- **Последовательность обработки:**
  1. Валидация входных данных
  2. Поиск продавца по keycloak_id
  3. Валидация типа древесины
  4. Отправка изображения в YOLO backend для анализа
  5. Проверка что доски обнаружены
  6. Создание товара в транзакции
  7. Сохранение изображения в файловой системе
  8. Создание записи изображения в БД
  9. Создание записей досок в БД

- **Возможные ошибки:**
  - `400 Bad Request`: Неверные данные или доски не обнаружены
  - `404 Not Found`: Продавец или тип древесины не найден
  - `500 Internal Server Error`: Ошибка анализа или сохранения
  - `503 Service Unavailable`: YOLO backend недоступен

- **Особенности:**
  - Использует транзакции БД для атомарности
  - При ошибке откатывает все изменения
  - Удаляет сохраненное изображение при ошибке
  - Требует наличия YOLO backend на localhost:8001