# 🚀 Diplom Project

Микросервисная архитектура для дипломного проекта с автоматическими миграциями базы данных и CI/CD.

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
├── ci/config/                   # CI/CD конфигурация
├── scripts/                     # Скрипты автоматизации
├── .gitlab-ci.yml              # GitLab CI/CD pipeline
├── docker-compose.yaml         # Основной compose файл
└── Makefile                    # Команды автоматизации
```

## 🚀 Быстрый старт

### Требования
- Docker
- Docker Compose
- Make

### Запуск всех сервисов
```bash
# Сборка и запуск всех сервисов
make setup

# Или по шагам:
make build    # Сборка контейнеров
make up       # Запуск сервисов
```

### Запуск только backend для разработки
```bash
# Быстрый старт backend сервисов
make dev

# Проверка здоровья
make health
```

### Тестирование
```bash
# Локальное тестирование CI/CD пайплайна
make test
```

## 🌐 Доступные сервисы

После запуска доступны следующие сервисы (порты настраиваются через переменные окружения):

- **Backend API**: http://localhost:${BACKEND_PORT:-8000}
- **API Документация**: http://localhost:${BACKEND_PORT:-8000}/docs
- **Admin Frontend**: http://localhost:${FRONTEND_ADMIN_PORT:-8080}
- **Seller Frontend**: http://localhost:${FRONTEND_SELLER_PORT:-8081}
- **Buyer Frontend**: http://localhost:${FRONTEND_BUYER_PORT:-8082}

### 🔧 Настройка портов

Создайте файл `.env` для настройки портов:
```bash
# Порты сервисов
BACKEND_PORT=8000
FRONTEND_ADMIN_PORT=8080
FRONTEND_SELLER_PORT=8081
FRONTEND_BUYER_PORT=8082
```

## 🛠️ Доступные команды

Используйте `make help` для просмотра всех команд.

### Основные команды
```bash
make help           # Показать все команды
make setup          # Сборка и запуск всех сервисов
make dev            # Быстрый старт backend для разработки
make up             # Запуск всех сервисов
make down           # Остановка всех сервисов
make build          # Сборка всех сервисов
make rebuild        # Пересборка и перезапуск
make logs           # Просмотр логов
make ps             # Статус контейнеров
make health         # Проверка здоровья сервисов
make test           # Локальное тестирование CI/CD
make clean          # Очистка Docker ресурсов
```

### Backend команды
```bash
make backend-up     # Запуск только backend сервисов
make backend-down   # Остановка backend сервисов
make backend-logs   # Логи backend сервисов
make backend-migrate # Запуск миграций базы данных
```

## ✨ Особенности

### 🔄 Автоматические миграции базы данных
Миграции базы данных запускаются автоматически при старте API контейнера:
```bash
# Миграции выполняются автоматически при:
make up
make backend-up

# Или вручную:
make backend-migrate
```

### 🚀 CI/CD Pipeline
GitLab CI/CD пайплайн с тремя этапами:
1. **Build** - Сборка всех контейнеров
2. **Test** - Тестирование запуска сервисов
3. **Deploy** - Автоматический деплой в staging (dev ветка), ручной в production (main ветка)

### 🧪 Локальное тестирование
```bash
# Тестирование полного пайплайна локально
make test
```

## 📚 Документация

- [CI/CD Pipeline Guide](CI_CD_PIPELINE_GUIDE.md) - Подробное руководство по CI/CD
- [CI Configuration](ci/README.md) - Конфигурация CI/CD

---

**🎯 Готово к использованию!** Запустите `make help` для начала работы.