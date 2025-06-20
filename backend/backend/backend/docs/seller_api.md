# Документация API: Эндпоинты продавцов

## Эндпоинты, связанные с продавцами

### Создание продавца

- **Метод:** POST
- **Путь:** `/sellers/`
- **Описание:** Создает нового продавца.

- **Ожидаемые входные данные (SellerInputDTO):**
  ```json
  {
    "id": "UUID", // Уникальный идентификатор продавца
    "keycloak_uuid": "UUID", // Уникальный идентификатор Keycloak
    "is_online": "boolean" // Статус продавца онлайн (по умолчанию false)
  }
  ```

- **Формат выходных данных (DataResponse[SellerDTO]):**
  ```json
  {
    "data": {
      "id": "UUID", // Уникальный идентификатор созданного продавца
      "keycloak_uuid": "UUID", // Уникальный идентификатор Keycloak
      "is_online": "boolean", // Статус продавца онлайн
      "created_at": "datetime", // Время создания
      "updated_at": "datetime" // Время последнего обновления
    }
  }
  ```

### Обновление продавца

- **Метод:** PATCH
- **Путь:** `/sellers/{seller_id}`
- **Описание:** Обновляет существующего продавца по его идентификатору.

- **Параметры пути:**
  - `seller_id`: UUID - Уникальный идентификатор продавца, которого нужно обновить.

- **Ожидаемые входные данные (SellerUpdateDTO):**
  ```json
  {
    "is_online": "boolean | null" // Новый статус продавца онлайн (необязательно)
  }
  ```

- **Формат выходных данных (EmptyResponse):**
  ```json
  {
    "data": null
  }
  ```

### Удаление продавца

- **Метод:** DELETE
- **Путь:** `/sellers/{seller_id}`
- **Описание:** Удаляет существующего продавца по его идентификатору.

- **Параметры пути:**
  - `seller_id`: UUID - Уникальный идентификатор продавца, которого нужно удалить.

- **Формат выходных данных (EmptyResponse):**
  ```json
  {
    "data": null
  }
  ```

### Получение списка продавцов с пагинацией

- **Метод:** GET
- **Путь:** `/sellers/`
- **Описание:** Возвращает список всех продавцов с использованием пагинации.

- **Параметры запроса (PaginationParams):
  - `offset`: integer (по умолчанию 0, >=0) - Смещение для пагинации.
  - `limit`: integer (по умолчанию 20, >=1, <=20) - Количество записей на странице.

- **Формат выходных данных (OffsetResults[SellerDTO]):**
  ```json
  {
    "data": [
      {
        "id": "UUID",
        "keycloak_uuid": "UUID",
        "is_online": "boolean",
        "created_at": "datetime",
        "updated_at": "datetime"
      }
    ],
    "pagination": {
      "total": "integer" // Общее количество продавцов
    }
  }
  ```

### Получение продавца по ID

- **Метод:** GET
- **Путь:** `/sellers/{seller_id}`
- **Описание:** Возвращает информацию о продавце по его идентификатору.

- **Параметры пути:**
  - `seller_id`: UUID - Уникальный идентификатор продавца.

- **Формат выходных данных (DataResponse[SellerDTO]):**
  ```json
  {
    "data": {
      "id": "UUID",
      "keycloak_uuid": "UUID",
      "is_online": "boolean",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  }
  ```

### Получение продавца по Keycloak UUID

- **Метод:** GET
- **Путь:** `/sellers/by-keycloak/{keycloak_uuid}`
- **Описание:** Возвращает информацию о продавце по его Keycloak UUID.

- **Параметры пути:**
  - `keycloak_uuid`: UUID - Уникальный идентификатор Keycloak продавца.

- **Формат выходных данных (DataResponse[SellerDTO]):**
  ```json
  {
    "data": {
      "id": "UUID",
      "keycloak_uuid": "UUID",
      "is_online": "boolean",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  }
  ```

- **Возможные ошибки:**
  - `404 Not Found`: Продавец с указанным keycloak_uuid не найден
  - `422 Unprocessable Entity`: Неверный формат UUID