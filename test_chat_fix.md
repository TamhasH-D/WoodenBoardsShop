# Полное исправление ошибок в системе чатов и frontend'ах

## Основная проблема
Ошибка "Unexpected token '<', "<doctype "...is not valid JSON" при загрузке чатов в frontend'ах продавца и покупателя.

## Причины
1. **Прямые fetch запросы без базового URL API** в компонентах чатов
2. **Захардкоженные WebSocket URL** в чатах
3. **Прямые формирования URL изображений** без использования apiService
4. **Отсутствие унификации** в работе с API endpoints

Браузер пытался запросить данные от frontend сервера (localhost:3000) вместо backend API (localhost:8000).

## Исправления

### 1. Исправление загрузки чатов (Коммит 1)

#### Seller Frontend
- **Файл**: `frontend/seller/src/services/api.js`
  - Обновлен метод `getSellerChats()` для использования `/api/v1/chat-threads/by-seller/${sellerId}`
  - Обновлен метод `getChatMessages()` для использования `/api/v1/chat-messages/by-thread/${threadId}`

- **Файл**: `frontend/seller/src/components/Chats.js`
  - Заменен прямой fetch на `apiService.getSellerChats(sellerId)`

#### Buyer Frontend
- **Файл**: `frontend/buyer/src/services/api.js`
  - Обновлен метод `getBuyerChats()` для использования `/api/v1/chat-threads/by-buyer/${buyerId}`
  - Обновлен метод `getChatMessages()` для использования `/api/v1/chat-messages/by-thread/${threadId}`
  - Добавлен метод `startChatWithSeller()` для создания чатов

- **Файл**: `frontend/buyer/src/components/Chats.js`
  - Добавлен импорт `apiService`
  - Заменен прямой fetch на `apiService.getBuyerChats(MOCK_BUYER_ID)`

- **Файл**: `frontend/buyer/src/components/ProductChat.js`
  - Добавлен импорт `apiService`
  - Заменены все прямые fetch запросы на методы apiService
  - Исправлены функции: `loadMessages()`, `loadChatData()`, `createChatThread()`, `handleSendMessage()`

### 2. Исправление WebSocket URL и оставшихся fetch запросов (Коммит 2)

#### WebSocket утилиты
- **Файл**: `frontend/buyer/src/utils/websocket.js` (новый)
- **Файл**: `frontend/seller/src/utils/websocket.js` (новый)
  - Создана функция `getChatWebSocketUrl()` для унификации WebSocket URL
  - Добавлены константы для WebSocket состояний и типов сообщений

#### Buyer Frontend
- **Файл**: `frontend/buyer/src/components/ProductChat.js`
  - Заменен захардкоженный WebSocket URL на использование `getChatWebSocketUrl()`

- **Файл**: `frontend/buyer/src/components/chat/ChatWindow.js`
  - Добавлен импорт `apiService` и `getChatWebSocketUrl`
  - Заменены прямые fetch запросы на методы apiService
  - Исправлен WebSocket URL для использования переменных окружения

### 3. Исправление URL изображений (Коммит 3)

#### Buyer Frontend
- **Файл**: `frontend/buyer/src/components/ui/ProductImage.js`
  - Заменено прямое формирование URL изображений на `apiService.getImageFileUrl()`

#### Seller Frontend
- **Файл**: `frontend/seller/src/components/BoardImageAnalyzer.js`
  - Исправлен прямой fetch запрос на использование базового URL из переменных окружения

- **Файл**: `frontend/seller/src/services/api.js`
  - Добавлены методы для работы с изображениями:
    - `getAllImages()`
    - `getProductImages()`
    - `getImageFileUrl()`
    - `getImageMetadata()`

## Результат
- ✅ **Seller frontend собирается без ошибок**
- ✅ **Buyer frontend собирается без ошибок**
- ✅ **Все fetch запросы используют правильный базовый URL** через apiService
- ✅ **Устранена ошибка JSON parsing** при загрузке чатов
- ✅ **WebSocket соединения используют переменные окружения**
- ✅ **URL изображений формируются правильно** через apiService
- ✅ **Унифицирована работа с API** во всех компонентах
- ✅ **Добавлены утилиты для WebSocket** соединений

## Backend Endpoints используемые
- `GET /api/v1/chat-threads/by-seller/{seller_id}` - получение чатов продавца
- `GET /api/v1/chat-threads/by-buyer/{buyer_id}` - получение чатов покупателя
- `GET /api/v1/chat-messages/by-thread/{thread_id}` - получение сообщений треда
- `POST /api/v1/chat-threads/start-with-seller` - создание чата с продавцом
- `POST /api/v1/chat-messages` - отправка сообщения
- `GET /api/v1/images` - получение всех изображений
- `GET /api/v1/images/{image_id}/file` - получение файла изображения
- `POST /api/v1/wooden-boards/calculate-volume` - анализ изображения досок

## WebSocket Endpoints
- `ws://localhost:8000/ws/chat/{thread_id}?user_id={user_id}&user_type={user_type}` - чат в реальном времени

## Переменные окружения
- `REACT_APP_API_URL` - базовый URL для API запросов (по умолчанию: http://localhost:8000)

## Коммиты
1. **Исправление загрузки чатов**: `fix-chat-loading-error`
2. **Исправление WebSocket и fetch**: `fix-websocket-and-remaining-fetch`
3. **Исправление URL изображений**: `fix-image-urls`

Все изменения объединены в ветку `main`.
