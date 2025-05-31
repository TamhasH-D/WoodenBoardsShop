# 🚀 Diplom Project

Микросервисная архитектура для дипломного проекта.

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

## 🚀 Быстрый старт

### Требования
- Docker
- Docker Compose
- Make

### Запуск сервисов
```bash
# Запуск всех сервисов
make up

# Или только backend для разработки
make dev
```

## 🌐 Доступные сервисы

После запуска доступны следующие сервисы:

- **Backend API**: http://localhost:8000
- **API Документация**: http://localhost:8000/docs

## 🛠️ Доступные команды

```bash
make help           # Показать все команды с URL из .env
make up             # Запуск всех сервисов
make down           # Остановка всех сервисов
make dev            # Быстрый старт backend для разработки
make logs           # Просмотр логов
make clean          # Очистка Docker ресурсов

# Backend команды
make backend-up     # Запуск только backend сервисов
make backend-down   # Остановка backend сервисов
make backend-logs   # Логи backend сервисов
make backend-migrate # Запуск миграций базы данных

# Конфигурация
# Редактируйте .env файл для настройки портов и URL
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