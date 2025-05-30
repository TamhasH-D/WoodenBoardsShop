# Diplom Project

Микросервисная архитектура для дипломного проекта с полной CI/CD интеграцией.

## 📁 Структура проекта

```
diplom/
├── ci/                          # CI/CD конфигурация и скрипты
│   ├── config/                  # Конфигурационные файлы CI/CD
│   │   ├── .env.ci             # Переменные окружения для CI
│   │   └── docker-compose.ci.yml # Docker Compose для CI
│   └── scripts/                 # Скрипты автоматизации
│       ├── test-ci-cd.sh       # Локальное тестирование CI/CD
│       └── start-all.sh        # Быстрый запуск всех сервисов
├── docs/                        # Документация
│   ├── CI-CD.md                # Документация CI/CD
│   └── DEPLOYMENT.md           # Руководство по деплою
├── backend/                     # Backend сервисы
│   ├── backend/                # Основной FastAPI backend
│   └── prosto_board_volume-main/ # Дополнительные backend сервисы
├── frontend/                    # Frontend приложения
│   ├── admin/                  # Панель администратора
│   ├── buyer/                  # Интерфейс покупателей
│   └── seller/                 # Интерфейс продавцов
├── .gitlab-ci.yml              # GitLab CI/CD pipeline
├── docker-compose.yaml         # Основной compose файл
├── .env                        # Переменные окружения
└── Makefile                    # Автоматизация сборки
```

## 🚀 Быстрый старт

### Простой запуск
```bash
# Запуск всех сервисов в продакшен режиме
./ci/scripts/start-all.sh

# Запуск в режиме разработки
./ci/scripts/start-all.sh --dev

# Пересборка и запуск
./ci/scripts/start-all.sh --rebuild
```

### Тестирование CI/CD
```bash
# Полное тестирование CI/CD локально
make test-ci

# Проверка здоровья сервисов
make health-check
```

## Запуск проекта

Проект можно запустить в двух режимах: разработки (dev) и продакшена (prod). Оба режима настроены в одном файле docker-compose.yml с использованием переменных окружения для переключения между ними.

### Предварительные требования

- Docker
- Docker Compose
- Make

### Режим разработки

В режиме разработки фронтенд-сервисы запускаются с помощью Node.js с возможностью горячей перезагрузки.

```bash
# Сборка и запуск в режиме разработки
make build-dev
make up-dev

# Просмотр логов
make logs
```

### Режим продакшена

В режиме продакшена фронтенд-сервисы запускаются с использованием Nginx для раздачи статических файлов.

```bash
# Сборка и запуск в режиме продакшена
make build-prod
make up-prod

# Или просто (по умолчанию - продакшен)
make build
make up

# Просмотр логов
make logs
```

### Локальная разработка Frontend (без Docker)

Для быстрой разработки frontend приложений можно запускать их локально:

```bash
# Перейти в папку frontend
cd frontend

# Полная настройка (очистка + установка + сборка)
make setup

# Запуск всех frontend приложений в режиме разработки
make dev
# Admin: http://localhost:3001
# Buyer: http://localhost:3002
# Seller: http://localhost:3003

# Сборка всех приложений локально
make build-local

# Показать все доступные команды
make help
```

**Примечание**: При первой установке зависимостей автоматически применяются исправления совместимости AJV. Подробности в `frontend/AJV_FIX_README.md`.

### Остановка проекта

```bash
make down
```

## Порты по умолчанию

- **Backend**: 8000
- **Admin Frontend**:
  - Разработка: 3000
  - Продакшен: 80
- **Seller Frontend**:
  - Разработка: 3000
  - Продакшен: 80
- **Buyer Frontend**:
  - Разработка: 3000
  - Продакшен: 80

Порты можно изменить через переменные окружения в файле `.env`.

## Переменные окружения

Создайте файл `.env` в корне проекта со следующими переменными:

```
# Порты
BACKEND_PORT=8000
FRONTEND_ADMIN_PORT=8080
FRONTEND_SELLER_PORT=8081
FRONTEND_BUYER_PORT=8082

# Режим (используется автоматически через Makefile)
NODE_ENV=production  # или development
FRONTEND_PORT=80     # или 3000 для разработки
CONTAINER_PORT=80    # или 3000 для разработки
COMPOSE_FILE_EXT=.yaml  # или .dev.yaml для разработки
```

## 🛠️ Команды Makefile

### Основные операции
- `make help` - Показать справку
- `make up-dev` - Запустить в режиме разработки
- `make up-prod` - Запустить в режиме продакшена
- `make up-ci` - Запустить в CI режиме (с health checks)
- `make up` - Запустить в режиме продакшена (по умолчанию)
- `make down` - Остановить все контейнеры
- `make restart` - Перезапустить все сервисы
- `make logs` - Просмотр логов
- `make ps` - Список запущенных контейнеров

### Сборка
- `make build-dev` - Собрать в режиме разработки
- `make build-prod` - Собрать в режиме продакшена
- `make build-ci` - Собрать в CI режиме
- `make build` - Собрать в режиме продакшена (по умолчанию)
- `make rebuild-dev` - Пересобрать и перезапустить (разработка)
- `make rebuild-prod` - Пересобрать и перезапустить (продакшен)
- `make rebuild-ci` - Пересобрать и перезапустить (CI)

### Тестирование и мониторинг
- `make test-ci` - Запустить локальное тестирование CI/CD
- `make health-check` - Проверить здоровье всех сервисов

## Как это работает

Переключение между режимами разработки и продакшена происходит с помощью переменных окружения:

1. В режиме разработки:
   - `NODE_ENV=development`
   - `COMPOSE_FILE_EXT=.dev.yaml` (использует docker-compose.dev.yaml)
   - `FRONTEND_PORT=3000` и `CONTAINER_PORT=3000` (для Node.js)

2. В режиме продакшена:
   - `NODE_ENV=production`
   - `COMPOSE_FILE_EXT=.yaml` (использует docker-compose.yaml)
   - `FRONTEND_PORT=80` и `CONTAINER_PORT=80` (для Nginx)

Эти переменные автоматически устанавливаются через Makefile при использовании соответствующих команд.

## 🔄 CI/CD с GitLab

Проект включает полную настройку CI/CD для GitLab:

### Pipeline Stages
1. **validate** - Валидация структуры проекта и Docker конфигурации
2. **build** - Сборка всех Docker контейнеров
3. **test** - Интеграционные тесты, линтинг, тестирование frontend
4. **deploy** - Деплой в staging/production окружения

### Автоматические триггеры
- Push в ветки `main` или `dev`
- Merge requests в ветки `main` или `dev`
- Ручной запуск pipeline

### Локальное тестирование CI/CD
```bash
# Полное тестирование CI/CD пайплайна локально
make test-ci

# Быстрый запуск с различными режимами
./ci/scripts/start-all.sh --help
```

## 📚 Документация

- [CI/CD Documentation](docs/CI-CD.md) - Подробная документация по CI/CD
- [Deployment Guide](docs/DEPLOYMENT.md) - Руководство по деплою
- [CI Configuration](ci/README.md) - Описание CI конфигурации

## 🐳 Сервисы

### Backend Services
- **backend-api**: Основной FastAPI backend (порт 8000)
- **postgres**: PostgreSQL база данных
- **redis**: Redis кеш
- **detect**: YOLO detection сервис (порт 8002)
- **backend**: Prosto Board backend (порт 8001)

### Frontend Services
- **admin-frontend**: Админ панель (порт 8080)
- **seller-frontend**: Интерфейс продавца (порт 8081)
- **buyer-frontend**: Интерфейс покупателя (порт 8082)

## 🔧 Конфигурация окружений

### Development
- Debug режим включен
- Hot reload для frontend
- Локальные порты (3000+)

### Production
- Оптимизированная сборка
- Nginx для статики
- Стандартные порты (80, 8000+)

### CI
- Health checks для всех сервисов
- Временные базы данных (tmpfs)
- Оптимизированные настройки для тестирования

## 🚀 Быстрые команды

```bash
# Разработка
make up-dev                    # Запуск в режиме разработки
./ci/scripts/start-all.sh --dev  # Альтернативный способ

# Продакшен
make up-prod                   # Запуск в продакшен режиме
./ci/scripts/start-all.sh      # Альтернативный способ

# CI/CD тестирование
make test-ci                   # Полное тестирование
make health-check              # Проверка здоровья сервисов

# Управление
make down                      # Остановка всех сервисов
make logs                      # Просмотр логов
make ps                        # Статус контейнеров
```