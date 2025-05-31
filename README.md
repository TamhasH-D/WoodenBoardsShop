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

# Управление .env файлом
make env            # Показать текущие переменные окружения
make env-create     # Создать .env файл с настройками по умолчанию
make env-reset      # Сбросить .env файл к настройкам по умолчанию
make env-remove     # Удалить .env файл
```

## ⚙️ Конфигурация через .env файл

Проект использует .env файл как единый источник конфигурации. Все команды Makefile автоматически загружают переменные из .env.

### 📝 Создание .env файла
```bash
# Создать .env файл с настройками по умолчанию
make env-create

# Посмотреть текущие настройки
make env

# Сбросить к настройкам по умолчанию
make env-reset
```

### 🔧 Основные переменные
```bash
# Порты сервисов
BACKEND_PORT=8000
FRONTEND_ADMIN_PORT=8080
FRONTEND_SELLER_PORT=8081
FRONTEND_BUYER_PORT=8082

# Хост для подключения
BACKEND_HOST=localhost

# База данных
BACKEND_PG_HOST=postgres
BACKEND_PG_PORT=5432
BACKEND_PG_DATABASE=backend
BACKEND_PG_USER=backend
BACKEND_PG_PASSWORD=backend
```

## ✨ Особенности

### 🔄 Автоматические миграции базы данных
Миграции базы данных запускаются автоматически при старте API контейнера.

Для ручного запуска миграций:
```bash
make backend-migrate
```

### 📊 Динамические URL
Все URL в команде `make help` автоматически обновляются на основе значений из .env файла.

---

**🎯 Готово к использованию!** Запустите `make help` для начала работы.