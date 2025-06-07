# Команды для функциональных тестов

Полное руководство по использованию Make команд для запуска и управления функциональными тестами.

## 🚀 Быстрый старт

```bash
# Проверить готовность системы
make test-health

# Запустить все тесты
make test

# Посмотреть результаты
make test-logs-stats
make test-reports
```

## 📋 Основные команды тестирования

### `make test`
Запуск всех функциональных тестов (API + браузерные + интеграционные)

```bash
make test
```

**Что происходит:**
1. Проверка зависимостей (Docker, docker-compose)
2. Остановка предыдущих тестовых контейнеров
3. Запуск тестового окружения
4. Ожидание готовности сервисов
5. Выполнение всех тестов
6. Остановка тестового окружения
7. Показ результатов

### `make test-api`
Запуск только API тестов

```bash
make test-api
```

**Особенности:**
- Быстрое выполнение (обычно 5-10 минут)
- Тестирование всех REST API эндпоинтов
- Проверка бизнес-логики и валидации данных

### `make test-browser`
Запуск только браузерных тестов

```bash
make test-browser
```

**Особенности:**
- Использует Selenium WebDriver
- Тестирует все три frontend приложения
- Автоматические скриншоты при ошибках
- Длительное выполнение (20-30 минут)

### `make test-integration`
Запуск только интеграционных тестов

```bash
make test-integration
```

**Особенности:**
- End-to-end сценарии
- Тестирование взаимодействия между сервисами
- Полные пользовательские workflow

## ⚡ Команды с дополнительными опциями

### `make test-quick`
Быстрый запуск критических тестов

```bash
make test-quick
```

**Использование:**
- Для быстрой проверки основной функциональности
- Запускает только тесты помеченные как `@pytest.mark.critical`
- Выполняется за 2-5 минут

### `make test-local`
Запуск тестов локально (без Docker)

```bash
make test-local
```

**Когда использовать:**
- Для отладки тестов
- Когда Docker недоступен
- Для разработки новых тестов

**Требования:**
- Python 3.8+
- Запущенные сервисы на localhost
- Установленные зависимости из requirements.txt

### `make test-debug`
Запуск тестов в режиме отладки

```bash
make test-debug
```

**Особенности:**
- Подробный вывод (`-v -s`)
- Полный traceback (`--tb=long`)
- Без захвата вывода (`--capture=no`)
- Удобно для поиска проблем

### `make test-coverage`
Запуск тестов с отчетом о покрытии

```bash
make test-coverage
```

**Результаты:**
- HTML отчет: `functional_tests/reports/coverage/index.html`
- XML отчет: `functional_tests/reports/coverage.xml`
- Консольный вывод с процентами покрытия

### `make test-with-script`
Запуск через расширенный скрипт

```bash
make test-with-script
# или с параметрами
TEST_TYPE=api PYTEST_ARGS="-v" make test-with-script
```

**Преимущества:**
- Расширенное логирование
- Автоматическая очистка при ошибках
- Проверка состояния сервисов
- Timeout защита

## 🔧 Управление окружением

### `make test-build`
Сборка Docker образов для тестов

```bash
make test-build
```

**Когда использовать:**
- После изменения Dockerfile
- При обновлении зависимостей
- При первом запуске

### `make test-up`
Запуск тестового окружения без выполнения тестов

```bash
make test-up
```

**Полезно для:**
- Отладки окружения
- Ручного тестирования
- Проверки конфигурации

### `make test-down`
Остановка тестового окружения

```bash
make test-down
```

### `make test-clean`
Полная очистка тестовых данных

```bash
make test-clean
```

**Что очищается:**
- Все тестовые контейнеры
- Volumes с данными
- Отчеты и скриншоты
- Временные файлы

### `make test-health`
Проверка готовности системы к тестированию

```bash
make test-health
```

**Проверяет:**
- Установку Docker и docker-compose
- Наличие конфигурационных файлов
- Доступность портов
- Состояние сервисов
- Ресурсы системы (память, диск)

## 📊 Работа с результатами

### `make test-logs`
Просмотр логов последнего запуска

```bash
make test-logs
```

### `make test-logs-latest`
Показать последний лог тестов

```bash
make test-logs-latest
```

### `make test-logs-tail`
Мониторинг логов в реальном времени

```bash
make test-logs-tail
```

**Использование:**
- Запустите в отдельном терминале
- Следите за выполнением тестов в реальном времени
- Прервите с помощью Ctrl+C

### `make test-logs-stats`
Статистика последнего запуска

```bash
make test-logs-stats
```

**Показывает:**
- Общее количество тестов
- Количество пройденных/упавших/пропущенных
- Процент успешности
- Время выполнения

### `make test-reports`
Открытие HTML отчетов в браузере

```bash
make test-reports
```

**Автоматически открывает:**
- Отчеты pytest-html
- Отчеты о покрытии кода
- Работает на Linux (xdg-open) и macOS (open)

### `make test-status`
Проверка статуса тестовых сервисов

```bash
make test-status
```

## 🧹 Очистка и обслуживание

### `make test-clean-logs`
Очистить только логи тестов

```bash
make test-clean-logs
```

### `make test-clean-old-logs`
Очистить логи старше 30 дней

```bash
make test-clean-old-logs
```

## 📚 Справочная информация

### `make help-test`
Полная справка по командам тестирования

```bash
make help-test
```

### `make help`
Общая справка по всем командам проекта

```bash
make help
```

## 🔧 Переменные окружения

Команды поддерживают настройку через переменные окружения:

```bash
# Тип тестов
TEST_TYPE=api make test

# Дополнительные аргументы pytest
PYTEST_ARGS="-v -s" make test-debug

# Таймаут для тестов
TIMEOUT=600 make test

# Порты сервисов (из .env файла)
BACKEND_PORT=8000
FRONTEND_ADMIN_PORT=8080
FRONTEND_SELLER_PORT=8081
FRONTEND_BUYER_PORT=8082
```

## 🎯 Примеры использования

### Разработка новых тестов
```bash
# Запустить окружение
make test-up

# Разработать тесты локально
make test-local

# Остановить окружение
make test-down
```

### Отладка упавших тестов
```bash
# Проверить готовность системы
make test-health

# Запустить в режиме отладки
make test-debug

# Посмотреть детальные логи
make test-logs-latest

# Открыть HTML отчеты
make test-reports
```

### CI/CD интеграция
```bash
# В пайплайне
make test-health
make test
make test-logs-stats
```

### Быстрая проверка
```bash
# Только критические тесты
make test-quick

# Только API тесты
make test-api

# Статистика
make test-logs-stats
```

## 🚨 Устранение проблем

### Тесты не запускаются
1. Проверьте готовность: `make test-health`
2. Очистите окружение: `make test-clean`
3. Пересоберите образы: `make test-build`

### Тесты падают
1. Проверьте логи: `make test-logs-latest`
2. Запустите в режиме отладки: `make test-debug`
3. Проверьте состояние сервисов: `make test-status`

### Медленное выполнение
1. Используйте быстрые тесты: `make test-quick`
2. Запускайте только нужный тип: `make test-api`
3. Проверьте ресурсы системы: `make test-health`

### Проблемы с Docker
1. Проверьте Docker: `docker info`
2. Очистите ресурсы: `make clean-all`
3. Перезапустите Docker daemon

## 📈 Мониторинг и аналитика

### Анализ трендов
```bash
# Статистика за 7 дней
cd functional_tests
python utils/log_analyzer.py --summary 7

# Список всех логов
python utils/log_analyzer.py --list

# Детальный анализ последнего запуска
python utils/log_analyzer.py --latest
```

### Экспорт данных
Все результаты автоматически экспортируются в:
- **JSON отчеты** для программного анализа
- **HTML отчеты** для визуального просмотра
- **XML отчеты** для интеграции с CI/CD
- **Логи** для детального анализа

## 🤝 Интеграция с IDE

### VS Code
Добавьте в `.vscode/tasks.json`:
```json
{
    "label": "Run Functional Tests",
    "type": "shell",
    "command": "make test",
    "group": "test"
}
```

### PyCharm
Создайте Run Configuration:
- Type: Shell Script
- Script: `make test`
- Working Directory: `$ProjectFileDir$`
