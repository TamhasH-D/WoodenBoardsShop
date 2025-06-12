# Тест исправления ошибки загрузки чатов

## Проблема
Ошибка "Unexpected token '<', "<doctype "...is not valid JSON" при загрузке чатов в frontend'ах продавца и покупателя.

## Причина
Прямые fetch запросы без базового URL API:
- `fetch('/api/v1/chat-threads/by-seller/${sellerId}')` 
- `fetch('/api/v1/chat-threads/by-buyer/${buyerId}')`

Браузер пытался запросить данные от frontend сервера (localhost:3000) вместо backend API (localhost:8000).

## Исправления

### 1. Seller Frontend
- **Файл**: `frontend/seller/src/services/api.js`
- **Изменения**: 
  - Обновлен метод `getSellerChats()` для использования `/api/v1/chat-threads/by-seller/${sellerId}`
  - Обновлен метод `getChatMessages()` для использования `/api/v1/chat-messages/by-thread/${threadId}`

- **Файл**: `frontend/seller/src/components/Chats.js`
- **Изменения**: 
  - Заменен прямой fetch на `apiService.getSellerChats(sellerId)`

### 2. Buyer Frontend
- **Файл**: `frontend/buyer/src/services/api.js`
- **Изменения**:
  - Обновлен метод `getBuyerChats()` для использования `/api/v1/chat-threads/by-buyer/${buyerId}`
  - Обновлен метод `getChatMessages()` для использования `/api/v1/chat-messages/by-thread/${threadId}`
  - Добавлен метод `startChatWithSeller()` для создания чатов

- **Файл**: `frontend/buyer/src/components/Chats.js`
- **Изменения**:
  - Добавлен импорт `apiService`
  - Заменен прямой fetch на `apiService.getBuyerChats(MOCK_BUYER_ID)`

- **Файл**: `frontend/buyer/src/components/ProductChat.js`
- **Изменения**:
  - Добавлен импорт `apiService`
  - Заменены все прямые fetch запросы на методы apiService
  - Исправлена функция `loadMessages()` 
  - Исправлена функция `loadChatData()`
  - Исправлена функция `createChatThread()`
  - Исправлена функция `handleSendMessage()`

## Результат
- ✅ Seller frontend собирается без ошибок
- ✅ Buyer frontend собирается без ошибок  
- ✅ Все fetch запросы теперь используют правильный базовый URL через apiService
- ✅ Устранена ошибка JSON parsing при загрузке чатов

## Backend Endpoints используемые
- `GET /api/v1/chat-threads/by-seller/{seller_id}` - получение чатов продавца
- `GET /api/v1/chat-threads/by-buyer/{buyer_id}` - получение чатов покупателя  
- `GET /api/v1/chat-messages/by-thread/{thread_id}` - получение сообщений треда
- `POST /api/v1/chat-threads/start-with-seller` - создание чата с продавцом
- `POST /api/v1/chat-messages` - отправка сообщения

## Коммит
```
git commit -m "Исправлена ошибка загрузки чатов в frontend'ах продавца и покупателя"
```

Ветка: `fix-chat-loading-error`
