# 🚀 Diplom Project

Микросервисная архитектура для дипломного проекта с полной кроссплатформенной совместимостью.

## 🌍 Cross-Platform Compatibility

This project is designed to work seamlessly across all operating systems and Docker environments:
- ✅ **Linux** (Ubuntu, CentOS, Debian, etc.)
- ✅ **macOS** (Intel and Apple Silicon)
- ✅ **Windows** (with Docker Desktop or WSL2)
- ✅ **Cloud environments** (AWS, GCP, Azure)


## 📁 Структура проекта

```
diplom/
├── backend/                     # Backend сервисы
│   ├── backend/                # Основной FastAPI backend (порт 8000)
│   └── prosto_board_volume-main/ # AI микросервис анализа досок (порты 8001, 8002)
├── frontend/                    # Frontend приложения (React)
│   ├── admin/                  # Панель администратора (порт 8080)
│   ├── buyer/                  # Интерфейс покупателей (порт 8082)
│   └── seller/                 # Интерфейс продавцов (порт 8081)
├── keycloak/                   # Система аутентификации (порт 8030)
├── docs/                       # Техническая документация
│   ├── ER/                     # Entity-Relationship диаграммы
│   ├── DFD/                    # Data Flow Diagrams
│   ├── IDEF0/                  # Функциональная модель IDEF0
│   └── UML/                    # UML диаграммы
├── scripts/                    # Вспомогательные скрипты
├── docker-compose.yaml         # Основной compose файл
└── Makefile                    # Команды автоматизации
```

## 🚀 Quick Start (Works on Any System)

### Prerequisites
- **Docker** (20.10+ recommended)
- **Docker Compose** (v2.0+ recommended)
- **Make** (optional, but recommended)

### One-Command Setup
```bash
# Clone the repository
git clone <repository-url>
cd diplom

# Run the automated setup (works on any system)
./scripts/setup.sh

# Start all services
make up
```

### Manual Setup (if setup script is not available)
```bash
# Initialize Docker networks
./scripts/init-network.sh

# Start all services
make up

# Or start only backend for development
make dev
```

### Verification
After startup, verify all services are running:
```bash
make ps
```

## 🌐 Available Services

После запуска доступны следующие сервисы:

### 🔧 Backend сервисы:
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **AI Микросервис (анализ досок)**: http://localhost:8001
- **YOLO Детекция**: http://localhost:8002

### 🎨 Frontend приложения:
- **Admin Frontend**: http://localhost:8080
- **Seller Frontend**: http://localhost:8081
- **Buyer Frontend**: http://localhost:8082

### 🔐 Инфраструктура:
- **Keycloak (аутентификация)**: http://localhost:8030
- **PostgreSQL**: localhost:5432 (основная БД)
- **PostgreSQL Keycloak**: localhost:5430 (БД Keycloak)
- **Redis**: localhost:6379 (кеш и сессии)

## 🛠️ Доступные команды

### 📦 Основные команды
```bash
make help           # Show all commands with URLs from .env
make up             # Start all services
make down           # Stop all services
make rebuild        # Rebuild and restart all services
make dev            # Quick start backend for development
make logs           # View logs from all services
make ps             # List running containers
```

### 🧪 Тестирование
```bash
# Backend unit тесты
cd backend/backend
make test           # Запуск всех тестов
make test-coverage  # Тесты с покрытием кода

# Frontend тесты
cd frontend
make test-all       # Тесты всех фронтендов
make lint-all       # Линтинг всех фронтендов
```

### 🔧 Backend команды
```bash
make backend-up     # Start only backend services
make backend-down   # Stop backend services
make backend-logs   # View backend logs
make backend-migrate # Run database migrations
```

### 🧹 Очистка
```bash
make clean          # Clean Docker resources
make clean-all      # Clean all Docker resources including networks
```

### ⚙️ Настройка и инициализация
```bash
./scripts/setup.sh  # One-time setup for new environments
make init-network   # Initialize Docker networks
# Edit .env file to configure ports and URLs
```

## ⚙️ Конфигурация через .env файл

Проект использует .env файл для конфигурации. Скопируйте `.env.example` в `.env` и настройте под ваше окружение.

### Основные переменные:

```bash
# Порты сервисов
BACKEND_PORT=8000                    # Основной API
FRONTEND_ADMIN_PORT=8080            # Админ панель
FRONTEND_SELLER_PORT=8081           # Интерфейс продавца
FRONTEND_BUYER_PORT=8082            # Интерфейс покупателя
PROSTO_BOARD_PORT=8001              # AI микросервис
DETECT_PORT=8002                    # YOLO детекция
KEYCLOAK_PORT=8030                  # Аутентификация

# API URL для frontend
REACT_APP_API_URL=http://localhost:8000

# База данных
BACKEND_PG_HOST=backend-pg
BACKEND_PG_DATABASE=your_database_name
BACKEND_PG_USER=your_db_user
BACKEND_PG_PASSWORD=your_secure_password

# Keycloak
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin
```

## ✨ Особенности системы

### 🏗️ Архитектура:
- **Микросервисная архитектура** с разделением ответственности
- **AI-интеграция** для анализа изображений досок через YOLO
- **Многопользовательская система** с ролями (Admin, Seller, Buyer)
- **Система чатов** для коммуникации между пользователями

### 🔧 Технические особенности:
- 🔄 **Автоматические миграции базы данных** при старте API
- 📊 **Конфигурация через .env** - все порты и URL настраиваются в одном файле
- 🐳 **Docker Compose** - простой запуск всех сервисов
- 🔐 **Keycloak аутентификация** - централизованная система авторизации
- 📱 **Адаптивные React фронтенды** с современным UI/UX
- 🤖 **AI анализ досок** - автоматическое определение объема и размеров
- 💾 **Redis кеширование** - быстрая работа с данными
- 🔍 **Полная API документация** - автоматически генерируемая через OpenAPI

---

**🎯 Готово к использованию!** Запустите `make help` для начала работы.