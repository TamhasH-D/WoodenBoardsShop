# Entity-Relationship Model (ER) - WoodenBoardsShop

## 📋 Обзор модели данных

Система WoodenBoardsShop представляет собой маркетплейс для торговли изделиями из древесины с интегрированным анализом изображений досок. База данных спроектирована для поддержки полного цикла торговых операций: от регистрации пользователей до обработки заказов и коммуникации между участниками.

## 🗂️ Сущности системы

### 1. **Buyer** (Покупатель)
**Назначение**: Представляет покупателей в системе

| Атрибут | Тип | Ограничения | Описание |
|---------|-----|-------------|----------|
| `id` | UUID | PRIMARY KEY, UNIQUE, INDEX | Уникальный идентификатор покупателя |
| `keycloak_uuid` | UUID | UNIQUE, INDEX | Идентификатор в системе аутентификации Keycloak |
| `is_online` | BOOLEAN | INDEX, DEFAULT FALSE | Статус онлайн |
| `created_at` | DATETIME(TZ) | DEFAULT NOW() | Время создания записи |
| `updated_at` | DATETIME(TZ) | DEFAULT NOW(), ON UPDATE NOW() | Время последнего обновления |

**Связи**:
- `1:N` с ChatThread (buyer_id)
- `1:N` с ChatMessage (buyer_id)

### 2. **Seller** (Продавец)
**Назначение**: Представляет продавцов в системе

| Атрибут | Тип | Ограничения | Описание |
|---------|-----|-------------|----------|
| `id` | UUID | PRIMARY KEY, UNIQUE, INDEX | Уникальный идентификатор продавца |
| `keycloak_uuid` | UUID | UNIQUE, INDEX | Идентификатор в системе аутентификации Keycloak |
| `is_online` | BOOLEAN | INDEX, DEFAULT FALSE | Статус онлайн |
| `created_at` | DATETIME(TZ) | DEFAULT NOW() | Время создания записи |
| `updated_at` | DATETIME(TZ) | DEFAULT NOW(), ON UPDATE NOW() | Время последнего обновления |

**Связи**:
- `1:N` с Product (seller_id)
- `1:N` с ChatThread (seller_id)
- `1:N` с ChatMessage (seller_id)

### 3. **WoodType** (Тип древесины)
**Назначение**: Каталог типов древесины

| Атрибут | Тип | Ограничения | Описание |
|---------|-----|-------------|----------|
| `id` | UUID | PRIMARY KEY, UNIQUE, INDEX | Уникальный идентификатор типа древесины |
| `neme` | STRING | UNIQUE, INDEX | Название типа древесины (сохранена опечатка для совместимости) |
| `description` | STRING | NULLABLE | Описание типа древесины |

**Связи**:
- `1:N` с Product (wood_type_id)
- `1:N` с WoodTypePrice (wood_type_id)

### 4. **WoodTypePrice** (Цена типа древесины)
**Назначение**: Исторические цены на типы древесины

| Атрибут | Тип | Ограничения | Описание |
|---------|-----|-------------|----------|
| `id` | UUID | PRIMARY KEY, UNIQUE, INDEX | Уникальный идентификатор записи цены |
| `price_per_m3` | FLOAT | INDEX | Цена за кубический метр |
| `created_at` | DATETIME(TZ) | DEFAULT NOW() | Время создания записи цены |
| `wood_type_id` | UUID | FOREIGN KEY, INDEX | Ссылка на тип древесины |

**Связи**:
- `N:1` с WoodType (wood_type_id) CASCADE DELETE

### 5. **Product** (Товар)
**Назначение**: Товары в маркетплейсе

| Атрибут | Тип | Ограничения | Описание |
|---------|-----|-------------|----------|
| `id` | UUID | PRIMARY KEY, UNIQUE, INDEX | Уникальный идентификатор товара |
| `volume` | FLOAT | INDEX | Объем товара в кубических метрах |
| `price` | FLOAT | INDEX | Цена товара |
| `title` | STRING | INDEX | Название товара |
| `descrioption` | STRING | NULLABLE | Описание товара (сохранена опечатка для совместимости) |
| `delivery_possible` | BOOLEAN | INDEX, DEFAULT FALSE | Возможность доставки |
| `pickup_location` | STRING | INDEX, NULLABLE | Адрес самовывоза |
| `created_at` | DATETIME(TZ) | DEFAULT NOW() | Время создания товара |
| `updated_at` | DATETIME(TZ) | DEFAULT NOW(), ON UPDATE NOW() | Время последнего обновления |
| `seller_id` | UUID | FOREIGN KEY, INDEX | Ссылка на продавца |
| `wood_type_id` | UUID | FOREIGN KEY, INDEX | Ссылка на тип древесины |

**Связи**:
- `N:1` с Seller (seller_id) CASCADE DELETE
- `N:1` с WoodType (wood_type_id) CASCADE DELETE
- `1:N` с Image (product_id)

### 6. **Image** (Изображение)
**Назначение**: Изображения товаров

| Атрибут | Тип | Ограничения | Описание |
|---------|-----|-------------|----------|
| `id` | UUID | PRIMARY KEY, UNIQUE, INDEX | Уникальный идентификатор изображения |
| `image_path` | STRING | UNIQUE, INDEX | Путь к файлу изображения |
| `product_id` | UUID | FOREIGN KEY, INDEX | Ссылка на товар |

**Связи**:
- `N:1` с Product (product_id) CASCADE DELETE
- `1:1` с WoodenBoard (image_id)

### 7. **WoodenBoard** (Деревянная доска)
**Назначение**: Результаты анализа изображений досок

| Атрибут | Тип | Ограничения | Описание |
|---------|-----|-------------|----------|
| `id` | UUID | PRIMARY KEY, UNIQUE, INDEX | Уникальный идентификатор доски |
| `height` | FLOAT | | Высота доски в метрах |
| `width` | FLOAT | | Ширина доски в метрах |
| `lenght` | FLOAT | | Длина доски в метрах (сохранена опечатка для совместимости) |
| `image_id` | UUID | FOREIGN KEY, INDEX | Ссылка на изображение |

**Связи**:
- `1:1` с Image (image_id) CASCADE DELETE

### 8. **ChatThread** (Тред чата)
**Назначение**: Потоки общения между покупателями и продавцами

| Атрибут | Тип | Ограничения | Описание |
|---------|-----|-------------|----------|
| `id` | UUID | PRIMARY KEY, UNIQUE, INDEX | Уникальный идентификатор треда |
| `created_at` | DATETIME(TZ) | DEFAULT NOW() | Время создания треда |
| `buyer_id` | UUID | FOREIGN KEY, INDEX | Ссылка на покупателя |
| `seller_id` | UUID | FOREIGN KEY, INDEX | Ссылка на продавца |

**Связи**:
- `N:1` с Buyer (buyer_id) CASCADE DELETE
- `N:1` с Seller (seller_id) CASCADE DELETE
- `1:N` с ChatMessage (thread_id)

### 9. **ChatMessage** (Сообщение чата)
**Назначение**: Сообщения в чатах между участниками

| Атрибут | Тип | Ограничения | Описание |
|---------|-----|-------------|----------|
| `id` | UUID | PRIMARY KEY, UNIQUE, INDEX | Уникальный идентификатор сообщения |
| `message` | STRING | | Текст сообщения |
| `is_read_by_buyer` | BOOLEAN | DEFAULT FALSE | Прочитано покупателем |
| `is_read_by_seller` | BOOLEAN | DEFAULT FALSE | Прочитано продавцом |
| `created_at` | DATETIME(TZ) | DEFAULT NOW() | Время создания сообщения |
| `thread_id` | UUID | FOREIGN KEY, INDEX | Ссылка на тред чата |
| `buyer_id` | UUID | FOREIGN KEY, INDEX | Ссылка на покупателя |
| `seller_id` | UUID | FOREIGN KEY, INDEX | Ссылка на продавца |

**Связи**:
- `N:1` с ChatThread (thread_id) CASCADE DELETE
- `N:1` с Buyer (buyer_id) CASCADE DELETE
- `N:1` с Seller (seller_id) CASCADE DELETE

## 🔗 Схема связей

### Основные связи:
1. **Seller → Product**: Один продавец может иметь множество товаров
2. **WoodType → Product**: Один тип древесины может использоваться в множестве товаров
3. **WoodType → WoodTypePrice**: Один тип древесины может иметь множество исторических цен
4. **Product → Image**: Один товар может иметь множество изображений
5. **Image → WoodenBoard**: Одно изображение может иметь один анализ доски
6. **Buyer ↔ Seller → ChatThread**: Покупатель и продавец создают тред общения
7. **ChatThread → ChatMessage**: Один тред содержит множество сообщений

### Каскадные удаления:
- При удалении Seller удаляются все его Product
- При удалении Product удаляются все его Image
- При удалении Image удаляется связанный WoodenBoard
- При удалении WoodType удаляются все связанные Product и WoodTypePrice
- При удалении Buyer/Seller удаляются все связанные ChatThread и ChatMessage
- При удалении ChatThread удаляются все его ChatMessage

## 📊 Индексы и производительность

### Основные индексы:
- **Primary Keys**: Все UUID поля id
- **Foreign Keys**: Все внешние ключи автоматически индексированы
- **Business Logic**: is_online, volume, price, delivery_possible
- **Search Fields**: title, pickup_location, neme
- **Temporal**: created_at, updated_at

### Уникальные ограничения:
- `keycloak_uuid` в Buyer и Seller
- `image_path` в Image
- `neme` в WoodType

## 🔧 Особенности реализации

### UUID как первичные ключи:
- Все сущности используют UUID для обеспечения уникальности в распределенной системе
- UUID генерируются на frontend или автоматически на backend

### Временные метки:
- Исправлена проблема с `created_at`/`updated_at` - используется `lambda: datetime.now(UTC)`
- Автоматическое обновление `updated_at` при изменении записи

### Совместимость:
- Сохранены опечатки в именах полей (`descrioption`, `neme`, `lenght`) для обратной совместимости с API

### Soft Delete:
- В текущей версии используется CASCADE DELETE
- Возможно расширение до soft delete в будущих версиях
