# 🚀 Diplom Project

Микросервисная архитектура для дипломного проекта с полной кроссплатформенной совместимостью.

## 🌍 Cross-Platform Compatibility

This project is designed to work seamlessly across all operating systems and Docker environments:
- ✅ **Linux** (Ubuntu, CentOS, Debian, etc.)
- ✅ **macOS** (Intel and Apple Silicon)
- ✅ **Windows** (with Docker Desktop or WSL2)
- ✅ **Cloud environments** (AWS, GCP, Azure)
- ✅ **CI/CD pipelines** (GitLab CI, GitHub Actions, Jenkins)

## 📁 Структура проекта

```
diplom/
├── backend/                     # Backend сервисы
│   ├── backend/                # Основной FastAPI backend
│   └── prosto_board_volume-main/ # Дополнительные backend сервисы
├── frontend/                    # Frontend приложения
│   ├── admin/                  # Панель администратора
│   ├── buyer/                  # Интерфейс покупателей
│   └── seller/                 # Интерфейс продавцов
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

After startup, the following services are available on any system:

- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Admin Frontend**: http://localhost:8080
- **Seller Frontend**: http://localhost:8081
- **Buyer Frontend**: http://localhost:8082
- **YOLO Backend**: http://localhost:8001
- **YOLO Detect Service**: http://localhost:8002

## 🛠️ Доступные команды

```bash
# Setup and initialization
make help           # Show all commands with URLs from .env
./scripts/setup.sh  # One-time setup for new environments
make init-network   # Initialize Docker networks

# Service management
make up             # Start all services
make down           # Stop all services
make rebuild        # Rebuild and restart all services
make dev            # Quick start backend for development
make logs           # View logs from all services
make ps             # List running containers

# Cleanup
make clean          # Clean Docker resources
make clean-all      # Clean all Docker resources including networks

# Backend-specific commands
make backend-up     # Start only backend services
make backend-down   # Stop backend services
make backend-logs   # View backend logs
make backend-migrate # Run database migrations

# Configuration
# Edit .env file to configure ports and URLs
```

## ⚙️ Конфигурация через .env файл

Проект использует .env файл для конфигурации. Основные переменные:

```bash
# Порты сервисов
BACKEND_PORT=8000
FRONTEND_ADMIN_PORT=8080

# API URL для frontend
REACT_APP_API_URL=http://localhost:8000

# База данных
BACKEND_PG_HOST=postgres
BACKEND_PG_DATABASE=backend
BACKEND_PG_USER=backend
BACKEND_PG_PASSWORD=backend
```

## ✨ Особенности

- 🔄 **Автоматические миграции базы данных** при старте API
- 📊 **Конфигурация через .env** - все порты и URL настраиваются в одном файле
- 🐳 **Docker Compose** - простой запуск всех сервисов

---

**🎯 Готово к использованию!** Запустите `make help` для начала работы.