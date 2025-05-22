# Документация API: Сообщения чата

## Эндпоинты, связанные с сообщениями чата

### Создание сообщения чата

- **Метод:** POST
- **Путь:** `/chat-messages/`
- **Описание:** Создает новое сообщение в чате.

- **Ожидаемые входные данные (ChatMessageInputDTO):**
  ```json
  {
    "id": "UUID", // Уникальный идентификатор сообщения
    "message": "string", // Текст сообщения
    "is_read_by_buyer": "boolean", // Прочитано ли покупателем (по умолчанию false)
    "is_read_by_seller": "boolean", // Прочитано ли продавцом (по умолчанию false)
    "thread_id": "UUID", // Идентификатор треда чата
    "buyer_id": "UUID", // Идентификатор покупателя
    "seller_id": "UUID" // Идентификатор продавца
  }
  ```

- **Формат выходных данных (DataResponse[ChatMessageDTO]):**
  ```json
  {
    "data": {
      "id": "UUID", // Уникальный идентификатор созданного сообщения
      "message": "string", // Текст сообщения
      "is_read_by_buyer": "boolean", // Прочитано ли покупателем
      "is_read_by_seller": "boolean", // Прочитано ли продавцом
      "created_at": "datetime", // Время создания
      "thread_id": "UUID", // Идентификатор треда чата
      "buyer_id": "UUID", // Идентификатор покупателя
      "seller_id": "UUID" // Идентификатор продавца
    }
  }
  ```

### Обновление сообщения чата

- **Метод:** PATCH
- **Путь:** `/chat-messages/{chat_message_id}`
- **Описание:** Обновляет существующее сообщение в чате по его идентификатору.

- **Параметры пути:**
  - `chat_message_id`: UUID - Уникальный идентификатор сообщения, которое нужно обновить.

- **Ожидаемые входные данные (ChatMessageUpdateDTO):**
  ```json
  {
    "message": "string | null", // Новый текст сообщения (необязательно)
    "is_read_by_buyer": "boolean | null", // Новый статус прочтения покупателем (необязательно)
    "is_read_by_seller": "boolean | null", // Новый статус прочтения продавцом (необязательно)
    "thread_id": "UUID | null", // Новый идентификатор треда чата (необязательно)
    "buyer_id": "UUID | null", // Новый идентификатор покупателя (необязательно)
    "seller_id": "UUID | null" // Новый идентификатор продавца (необязательно)
  }
  ```

- **Формат выходных данных (EmptyResponse):**
  ```json
  {
    "data": null
  }
  ```

### Удаление сообщения чата

- **Метод:** DELETE
- **Путь:** `/chat-messages/{chat_message_id}`
- **Описание:** Удаляет существующее сообщение в чате по его идентификатору.

- **Параметры пути:**
  - `chat_message_id`: UUID - Уникальный идентификатор сообщения, которое нужно удалить.

- **Формат выходных данных (EmptyResponse):**
  ```json
  {
    "data": null
  }
  ```

### Получение списка сообщений чата с пагинацией

- **Метод:** GET
- **Путь:** `/chat-messages/`
- **Описание:** Возвращает список всех сообщений чата с использованием пагинации.

- **Параметры запроса (PaginationParams):**
  - `offset`: integer (по умолчанию 0, >=0) - Смещение для пагинации.
  - `limit`: integer (по умолчанию 20, >=1, <=20) - Количество записей на странице.

- **Формат выходных данных (OffsetResults[ChatMessageDTO]):**
  ```json
  {
    "data": [
      {
        "id": "UUID",
        "message": "string",
        "is_read_by_buyer": "boolean",
        "is_read_by_seller": "boolean",
        "created_at": "datetime",
        "thread_id": "UUID",
        "buyer_id": "UUID",
        "seller_id": "UUID"
      }
    ],
    "pagination": {
      "total": "integer" // Общее количество сообщений
    }
  }
  ```

### Получение сообщения чата по ID

- **Метод:** GET
- **Путь:** `/chat-messages/{chat_message_id}`
- **Описание:** Возвращает информацию о сообщении чата по его идентификатору.

- **Параметры пути:**
  - `chat_message_id`: UUID - Уникальный идентификатор сообщения чата.

- **Формат выходных данных (DataResponse[ChatMessageDTO]):**
  ```json
  {
    "data": {
      "id": "UUID",
      "message": "string",
      "is_read_by_buyer": "boolean",
      "is_read_by_seller": "boolean",
      "created_at": "datetime",
      "thread_id": "UUID",
      "buyer_id": "UUID",
      "seller_id": "UUID"
    }
  }
  ```