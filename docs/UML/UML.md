# UML Диаграммы - WoodenBoardsShop

## 📋 Обзор UML диаграмм

Unified Modeling Language (UML) диаграммы предоставляют различные представления архитектуры системы WoodenBoardsShop. Каждый тип диаграммы фокусируется на определенных аспектах системы.

## 🏗️ Диаграмма классов (Class Diagram)

### Основные классы системы:

#### 1. **Модели данных (Models)**

```python
class Buyer:
    + id: UUID
    + keycloak_uuid: UUID
    + is_online: bool
    + created_at: datetime
    + updated_at: datetime
    
    # Relationships
    + chat_threads: List[ChatThread]
    + chat_messages: List[ChatMessage]

class Seller:
    + id: UUID
    + keycloak_uuid: UUID
    + is_online: bool
    + created_at: datetime
    + updated_at: datetime
    
    # Relationships
    + products: List[Product]
    + chat_threads: List[ChatThread]
    + chat_messages: List[ChatMessage]

class WoodType:
    + id: UUID
    + neme: str
    + description: str
    
    # Relationships
    + products: List[Product]
    + wood_type_prices: List[WoodTypePrice]

class Product:
    + id: UUID
    + volume: float
    + price: float
    + title: str
    + descrioption: str
    + delivery_possible: bool
    + pickup_location: str
    + created_at: datetime
    + updated_at: datetime
    + seller_id: UUID
    + wood_type_id: UUID
    
    # Relationships
    + seller: Seller
    + wood_type: WoodType
    + images: List[Image]
```

#### 2. **DAO классы (Data Access Objects)**

```python
class BaseDAO:
    + session: AsyncSession
    + __init__(session: AsyncSession)
    + create(input_dto: BaseModel): Model
    + filter_first(**kwargs): Model
    + update(id: UUID, update_dto: BaseModel): None
    + delete(id: UUID): None
    + get_offset_results(out_dto: Type, pagination: Pagination): OffsetResults

class BuyerDAO(BaseDAO):
    + model = Buyer

class SellerDAO(BaseDAO):
    + model = Seller

class ProductDAO(BaseDAO):
    + model = Product
```

#### 3. **DTO классы (Data Transfer Objects)**

```python
class BuyerDTO(BaseOrmModel):
    + id: UUID
    + keycloak_uuid: UUID
    + is_online: bool
    + created_at: datetime
    + updated_at: datetime

class BuyerInputDTO(BaseModel):
    + id: UUID
    + keycloak_uuid: UUID
    + is_online: bool

class BuyerUpdateDTO(BaseModel):
    + keycloak_uuid: UUID | None
    + is_online: bool | None
```

#### 4. **API Routes классы**

```python
class BuyerRoutes:
    + create_buyer(input_dto: BuyerInputDTO, daos: GetDAOs): DataResponse[BuyerDTO]
    + update_buyer(buyer_id: UUID, update_dto: BuyerUpdateDTO, daos: GetDAOs): EmptyResponse
    + delete_buyer(buyer_id: UUID, daos: GetDAOs): EmptyResponse
    + get_buyer_paginated(daos: GetDAOs, pagination: Pagination): OffsetResults[BuyerDTO]
    + get_buyer(buyer_id: UUID, daos: GetDAOs): DataResponse[BuyerDTO]
```

### Связи между классами:

- **Наследование**: DAO классы наследуются от BaseDAO
- **Композиция**: Routes используют DAO через dependency injection
- **Ассоциация**: Models связаны через Foreign Key relationships
- **Агрегация**: DTO классы агрегируют данные из Models

## 🔄 Диаграмма последовательности (Sequence Diagram)

### Сценарий: Создание товара с анализом изображения

```
Продавец -> Seller Frontend: Заполняет форму товара
Seller Frontend -> Backend API: POST /api/v1/products
Backend API -> ProductDAO: create(product_data)
ProductDAO -> PostgreSQL: INSERT INTO products
PostgreSQL -> ProductDAO: product_id
ProductDAO -> Backend API: created_product

Продавец -> Seller Frontend: Загружает изображение доски
Seller Frontend -> Backend API: POST /api/v1/wooden-boards/calculate-volume
Backend API -> AI Microservice: POST /wooden_boards_volume_seg/
AI Microservice -> Backend API: analysis_results
Backend API -> WoodenBoardDAO: create(board_data)
WoodenBoardDAO -> PostgreSQL: INSERT INTO wooden_boards
Backend API -> Seller Frontend: analysis_response
Seller Frontend -> Продавец: Показывает результаты анализа
```

### Сценарий: Поиск товаров покупателем

```
Покупатель -> Buyer Frontend: Вводит критерии поиска
Buyer Frontend -> Backend API: GET /api/v1/products?filters
Backend API -> ProductDAO: get_offset_results(filters)
ProductDAO -> PostgreSQL: SELECT with JOIN wood_types
PostgreSQL -> ProductDAO: products_data
ProductDAO -> Backend API: OffsetResults[ProductDTO]
Backend API -> Buyer Frontend: search_results
Buyer Frontend -> Покупатель: Отображает товары
```

## 🎯 Диаграмма вариантов использования (Use Case Diagram)

### Актеры:
- **Покупатель** - ищет и покупает товары
- **Продавец** - продает товары, управляет каталогом
- **Администратор** - управляет системой
- **AI Система** - анализирует изображения

### Варианты использования:

#### Для Покупателя:
- Регистрация в системе
- Поиск товаров
- Просмотр деталей товара
- Общение с продавцом
- Управление профилем

#### Для Продавца:
- Регистрация в системе
- Создание товаров
- Загрузка изображений
- Анализ изображений досок
- Управление каталогом
- Общение с покупателями
- Просмотр статистики продаж

#### Для Администратора:
- Управление пользователями
- Модерация товаров
- Мониторинг системы
- Просмотр аналитики
- Управление типами древесины
- Настройка системы

#### Для AI Системы:
- Анализ изображений досок
- Определение размеров
- Расчет объемов
- Возврат результатов анализа

## 🏛️ Диаграмма компонентов (Component Diagram)

### Основные компоненты:

#### Frontend Layer:
- **Admin Frontend** (React)
  - Dashboard компонент
  - User Management компонент
  - Product Management компонент
  - Analytics компонент

- **Seller Frontend** (React)
  - Product Management компонент
  - Chat компонент
  - Analytics компонент

- **Buyer Frontend** (React)
  - Product Catalog компонент
  - Search компонент
  - Chat компонент

#### Backend Layer:
- **API Gateway** (FastAPI)
  - Routes компоненты
  - Middleware компоненты
  - Authentication компонент

- **Business Logic**
  - DAO компоненты
  - Service компоненты
  - Validation компоненты

- **Data Access**
  - Models компоненты
  - Database компонент
  - Migration компоненты

#### External Services:
- **Keycloak** - Authentication Service
- **AI Microservice** - Image Analysis Service
- **PostgreSQL** - Database Service

### Интерфейсы между компонентами:
- **HTTP REST API** - Frontend ↔ Backend
- **HTTP API** - Backend ↔ AI Microservice
- **OIDC/OAuth2** - Frontend ↔ Keycloak
- **SQL** - Backend ↔ PostgreSQL

## 🚀 Диаграмма развертывания (Deployment Diagram)

### Узлы развертывания:

#### Docker Host:
- **Frontend Containers**
  - admin-frontend:8080
  - seller-frontend:8081
  - buyer-frontend:8082

- **Backend Containers**
  - backend-api:8000
  - ai-microservice:8001

- **Database Containers**
  - postgresql:5432
  - keycloak:8080

#### Network Configuration:
- **Frontend Network** - для связи между frontend контейнерами
- **Backend Network** - для связи backend с базой данных
- **External Network** - для внешнего доступа

### Артефакты развертывания:
- **Docker Images**
  - node:18-alpine (для frontend)
  - python:3.11-slim (для backend)
  - postgres:15-alpine (для БД)
  - quay.io/keycloak/keycloak (для аутентификации)

## 📊 Диаграмма состояний (State Diagram)

### Состояния товара:

```
[Создан] -> [Опубликован] -> [Активен]
    |            |              |
    v            v              v
[Черновик] -> [На модерации] -> [Продан]
    |            |              |
    v            v              v
[Удален] <- [Отклонен] <- [Архивирован]
```

### Состояния пользователя:

```
[Незарегистрирован] -> [Зарегистрирован] -> [Активен]
                           |                   |
                           v                   v
                      [На модерации] -> [Заблокирован]
                           |                   |
                           v                   v
                      [Отклонен] <- [Удален] <-+
```

### Состояния анализа изображения:

```
[Загружено] -> [В обработке] -> [Обработано]
     |              |               |
     v              v               v
[Ошибка] <- [Отклонено] <- [Сохранено]
```

## 🔄 Диаграмма активности (Activity Diagram)

### Процесс создания товара:

1. **Начало** → Продавец входит в систему
2. **Аутентификация** → Проверка токена Keycloak
3. **Заполнение формы** → Ввод данных товара
4. **Валидация данных** → Проверка обязательных полей
5. **Загрузка изображения** → Выбор файла изображения
6. **Анализ изображения** → Отправка в AI микросервис
7. **Получение результатов** → Размеры и объем досок
8. **Сохранение товара** → Запись в базу данных
9. **Подтверждение** → Уведомление о создании
10. **Конец** → Товар добавлен в каталог

### Процесс поиска товаров:

1. **Начало** → Покупатель открывает каталог
2. **Ввод критериев** → Фильтры поиска
3. **Отправка запроса** → API запрос с параметрами
4. **Поиск в БД** → SQL запрос с JOIN
5. **Формирование результатов** → Пагинация и сортировка
6. **Отображение товаров** → Список с изображениями
7. **Выбор товара** → Переход к деталям
8. **Конец** → Просмотр информации о товаре

## 🎨 Диаграмма пакетов (Package Diagram)

### Структура пакетов Backend:

```
backend/
├── models/          # Модели данных
│   ├── buyer_models.py
│   ├── seller_models.py
│   ├── product_models.py
│   └── ...
├── daos/           # Data Access Objects
│   ├── buyer_daos.py
│   ├── seller_daos.py
│   └── ...
├── dtos/           # Data Transfer Objects
│   ├── buyer_dtos.py
│   ├── seller_dtos.py
│   └── ...
├── routes/         # API маршруты
│   ├── buyer_routes.py
│   ├── seller_routes.py
│   └── ...
├── services/       # Бизнес-логика
└── db/            # Конфигурация БД
```

### Зависимости между пакетами:
- **routes** зависит от **daos** и **dtos**
- **daos** зависит от **models**
- **dtos** зависит от **models**
- **services** зависит от **daos** и **models**

## 🔧 Паттерны проектирования

### Используемые паттерны:

1. **Repository Pattern** - DAO классы
2. **DTO Pattern** - Разделение моделей и API
3. **Dependency Injection** - FastAPI Dependencies
4. **Factory Pattern** - Создание объектов DAO
5. **Observer Pattern** - Система уведомлений
6. **Strategy Pattern** - Различные алгоритмы поиска
7. **Facade Pattern** - API как фасад для бизнес-логики

### Архитектурные принципы:
- **Single Responsibility** - Каждый класс имеет одну ответственность
- **Open/Closed** - Расширяемость через наследование
- **Dependency Inversion** - Зависимость от абстракций
- **Interface Segregation** - Разделение интерфейсов по назначению
