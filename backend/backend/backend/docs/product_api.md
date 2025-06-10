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