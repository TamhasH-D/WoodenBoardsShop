# Документация API: Покупатели

## Эндпоинты, связанные с покупателями

### Создание покупателя

- **Метод:** POST
- **Путь:** `/buyers/`
- **Описание:** Создает нового покупателя.

- **Ожидаемые входные данные (BuyerInputDTO):**
  ```json
  {
    "id": "UUID", // Уникальный идентификатор покупателя
    "keycloak_uuid": "UUID", // Уникальный идентификатор Keycloak
    "is_online": "boolean" // Статус покупателя онлайн (по умолчанию false)
  }
  ```

- **Формат выходных данных (DataResponse[BuyerDTO]):**
  ```json
  {
    "data": {
      "id": "UUID", // Уникальный идентификатор созданного покупателя
      "keycloak_uuid": "UUID", // Уникальный идентификатор Keycloak
      "is_online": "boolean", // Статус покупателя онлайн
      "created_at": "datetime", // Время создания
      "updated_at": "datetime" // Время последнего обновления
    }
  }
  ```

### Обновление покупателя

- **Метод:** PATCH
- **Путь:** `/buyers/{buyer_id}`
- **Описание:** Обновляет существующего покупателя по его идентификатору.

- **Параметры пути:**
  - `buyer_id`: UUID - Уникальный идентификатор покупателя, которого нужно обновить.

- **Ожидаемые входные данные (BuyerUpdateDTO):**
  ```json
  {
    "keycloak_uuid": "UUID | null", // Новый уникальный идентификатор Keycloak (необязательно)
    "is_online": "boolean | null" // Новый статус покупателя онлайн (необязательно)
  }
  ```

- **Формат выходных данных (DataResponse[BuyerDTO]):**
  ```json
  {
    "data": {
      "id": "UUID", // Уникальный идентификатор обновленного покупателя
      "keycloak_uuid": "UUID", // Уникальный идентификатор Keycloak
      "is_online": "boolean", // Статус покупателя онлайн
      "created_at": "datetime", // Время создания
      "updated_at": "datetime" // Время последнего обновления
    }
  }
  ```

### Удаление покупателя

- **Метод:** DELETE
- **Путь:** `/buyers/{buyer_id}`
- **Описание:** Удаляет существующего покупателя по его идентификатору.

- **Параметры пути:**
  - `buyer_id`: UUID - Уникальный идентификатор покупателя, которого нужно удалить.

- **Формат выходных данных (DataResponse[BuyerDTO]):**
  ```json
  {
    "data": {
      "id": "UUID", // Уникальный идентификатор удаленного покупателя
      "keycloak_uuid": "UUID", // Уникальный идентификатор Keycloak
      "is_online": "boolean", // Статус покупателя онлайн
      "created_at": "datetime", // Время создания
      "updated_at": "datetime" // Время последнего обновления
    }
  }
  ```

### Получение списка покупателей с пагинацией

- **Метод:** GET
- **Путь:** `/buyers/`
- **Описание:** Возвращает список всех покупателей с использованием пагинации.

- **Параметры запроса (PaginationParams):**
  - `offset`: integer (по умолчанию 0, >=0) - Смещение для пагинации.
  - `limit`: integer (по умолчанию 20, >=1, <=20) - Количество записей на странице.

- **Формат выходных данных (OffsetResults[BuyerDTO]):**
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
      "total": "integer" // Общее количество покупателей
    }
  }
  ```

### Получение покупателя по ID

- **Метод:** GET
- **Путь:** `/buyers/{buyer_id}`
- **Описание:** Возвращает информацию о покупателе по его идентификатору.

- **Параметры пути:**
  - `buyer_id`: UUID - Уникальный идентификатор покупателя.

- **Формат выходных данных (DataResponse[BuyerDTO]):**
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

### Получение покупателя по Keycloak UUID

- **Метод:** GET
- **Путь:** `/buyers/by-keycloak/{keycloak_uuid}`
- **Описание:** Возвращает информацию о покупателе по его Keycloak UUID.

- **Параметры пути:**
  - `keycloak_uuid`: UUID - Уникальный идентификатор Keycloak покупателя.

- **Формат выходных данных (DataResponse[BuyerDTO]):**
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
  - `404 Not Found`: Покупатель с указанным keycloak_uuid не найден
  - `422 Unprocessable Entity`: Неверный формат UUID