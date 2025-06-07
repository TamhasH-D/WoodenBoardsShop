# Комплексная система функциональных тестов WoodenBoardsShop

## 🎯 Обзор

Это enterprise-уровня система функциональных тестов для проекта WoodenBoardsShop, обеспечивающая полное покрытие всей функциональности системы.

## 📋 Структура тестов

### 🔧 API тесты (`api_tests/`)
- **Полное CRUD тестирование** всех 11 сущностей
- **Валидация данных** и обработка ошибок
- **Тестирование производительности** и нагрузки
- **Безопасность API** (SQL injection, XSS)
- **Пагинация** и фильтрация
- **Связи между сущностями**

### 🌐 Браузерные тесты (`browser_tests/`)
- **End-to-end сценарии** для всех 3 фронтендов
- **Кроссбраузерное тестирование**
- **Адаптивный дизайн** (Desktop, Tablet, Mobile)
- **JavaScript функциональность**
- **Формы и навигация**
- **Пользовательские сценарии**

### 🔗 Интеграционные тесты (`integration_tests/`)
- **Взаимодействие микросервисов**
- **YOLO интеграция** для обработки изображений
- **Консистентность базы данных**
- **Конкурентные операции**
- **Обработка ошибок**
- **Файловые операции**

## 🚀 Быстрый старт

### Запуск всех тестов
```bash
make -f Makefile.comprehensive test-all
```

### Запуск по типам
```bash
# API тесты
make -f Makefile.comprehensive test-api

# Браузерные тесты
make -f Makefile.comprehensive test-browser

# Интеграционные тесты
make -f Makefile.comprehensive test-integration
```

### Запуск по функциональности
```bash
# CRUD операции
make -f Makefile.comprehensive test-crud

# Валидация данных
make -f Makefile.comprehensive test-validation

# Пагинация
make -f Makefile.comprehensive test-pagination

# YOLO интеграция
make -f Makefile.comprehensive test-yolo
```

### Запуск по frontend
```bash
# Buyer frontend
make -f Makefile.comprehensive test-buyer

# Seller frontend
make -f Makefile.comprehensive test-seller

# Admin frontend
make -f Makefile.comprehensive test-admin
```

## 📊 Типы тестов

### ⚡ По скорости выполнения
- **Быстрые тесты** (`fast`) - выполняются < 30 секунд
- **Медленные тесты** (`slow`) - выполняются > 30 секунд

```bash
# Только быстрые тесты
make -f Makefile.comprehensive test-fast

# Только медленные тесты
make -f Makefile.comprehensive test-slow
```

### 🎯 По важности
- **Smoke тесты** (`smoke`) - базовая функциональность
- **Критические тесты** (`critical`) - ключевые сценарии
- **Регрессионные тесты** (`regression`) - проверка регрессий

### 🔒 По безопасности
- **Тесты безопасности** (`security`) - SQL injection, XSS, валидация
- **Тесты производительности** (`performance`) - нагрузка, время ответа

## 🛠 Управление окружением

### Запуск окружения
```bash
make -f Makefile.comprehensive test-up
```

### Остановка окружения
```bash
make -f Makefile.comprehensive test-down
```

### Статус контейнеров
```bash
make -f Makefile.comprehensive test-status
```

### Просмотр логов
```bash
make -f Makefile.comprehensive test-logs
```

### Очистка данных
```bash
make -f Makefile.comprehensive test-clean
```

### Пересборка контейнеров
```bash
make -f Makefile.comprehensive test-rebuild
```

## 📈 Отчеты и анализ

### Генерация отчетов
```bash
make -f Makefile.comprehensive test-reports
```

### Анализ покрытия
```bash
make -f Makefile.comprehensive test-coverage
```

### Параллельное выполнение
```bash
make -f Makefile.comprehensive test-parallel
```

## 🔧 Конфигурация

### Основные файлы конфигурации
- `pytest.ini` - настройки pytest
- `conftest.py` - фикстуры и хуки
- `requirements.txt` - зависимости Python
- `Makefile.comprehensive` - команды управления

### Переменные окружения
```bash
# Backend URL
BACKEND_URL=http://test-backend:8000

# Frontend URLs
BUYER_FRONTEND_URL=http://test-buyer-frontend:3000
SELLER_FRONTEND_URL=http://test-seller-frontend:3000
ADMIN_FRONTEND_URL=http://test-admin-frontend:3000

# Selenium Grid
SELENIUM_HUB_URL=http://selenium-hub:4444/wd/hub

# Тайм-ауты
TEST_TIMEOUT=30.0
PAGE_LOAD_TIMEOUT=10.0
```

## 📁 Структура директорий

```
functional_tests/
├── api_tests/                    # API тесты
│   ├── test_comprehensive_api.py
│   └── test_*.py
├── browser_tests/                # Браузерные тесты
│   ├── test_comprehensive_frontend.py
│   └── test_*.py
├── integration_tests/            # Интеграционные тесты
│   ├── test_comprehensive_integration.py
│   └── test_*.py
├── utils/                        # Утилиты
│   ├── api_client.py
│   ├── data_factory.py
│   ├── enhanced_data_factory.py
│   └── test_logger.py
├── reports/                      # Отчеты
├── logs/                         # Логи
├── screenshots/                  # Скриншоты
├── conftest.py                   # Фикстуры pytest
├── pytest.ini                   # Конфигурация pytest
├── requirements.txt              # Зависимости
├── Makefile.comprehensive        # Команды управления
└── README_COMPREHENSIVE.md       # Документация
```

## 🎨 Фабрики тестовых данных

### Базовая фабрика (`TestDataFactory`)
```python
# Создание покупателя
buyer = await factory.create_buyer()

# Создание продавца
seller = await factory.create_seller()

# Создание продукта
product = await factory.create_product(seller_id, wood_type_id)
```

### Расширенная фабрика (`EnhancedTestDataFactory`)
```python
# Создание полного сценария маркетплейса
scenario = await factory.create_complete_marketplace_scenario()

# Создание множества тестовых данных
bulk_data = await factory.create_bulk_test_data(count=50)
```

## 🔍 Маркеры pytest

### Использование маркеров
```bash
# Запуск только API тестов
pytest -m "api"

# Запуск быстрых тестов
pytest -m "fast"

# Запуск критических тестов
pytest -m "critical"

# Комбинирование маркеров
pytest -m "api and fast"
pytest -m "browser and not slow"
```

### Доступные маркеры
- `api`, `browser`, `integration`
- `performance`, `security`
- `crud`, `validation`, `pagination`
- `yolo`, `database`, `error_handling`
- `buyer`, `seller`, `admin`
- `fast`, `slow`
- `smoke`, `critical`, `regression`

## 🐛 Отладка

### Запуск одного теста
```bash
make -f Makefile.comprehensive debug-test TEST_NAME=test_specific_function
```

### Отладочная оболочка
```bash
make -f Makefile.comprehensive debug-shell
```

### Мониторинг здоровья системы
```bash
make -f Makefile.comprehensive monitor-health
```

## 📋 CI/CD интеграция

### Команда для CI/CD
```bash
make -f Makefile.comprehensive ci-test
```

### GitLab CI пример
```yaml
test:
  script:
    - cd functional_tests
    - make -f Makefile.comprehensive ci-test
  artifacts:
    reports:
      junit: functional_tests/reports/ci_tests_junit.xml
    paths:
      - functional_tests/reports/
```

## 🎯 Лучшие практики

### 1. Независимость тестов
- Каждый тест создает свои данные
- Автоматическая очистка после тестов
- Использование уникальных UUID

### 2. Стабильность
- Retry механизмы для нестабильных тестов
- Ожидание готовности сервисов
- Graceful handling ошибок

### 3. Производительность
- Параллельное выполнение
- Кэширование данных
- Оптимизация запросов

### 4. Мониторинг
- Подробное логирование
- Скриншоты при падении
- Метрики производительности

## 🚨 Устранение неполадок

### Проблемы с Selenium
```bash
# Проверка статуса Selenium Grid
docker-compose -f docker-compose.test.yaml ps selenium-hub

# Просмотр логов Selenium
docker-compose -f docker-compose.test.yaml logs selenium-hub
```

### Проблемы с API
```bash
# Проверка здоровья backend
curl http://localhost:8000/api/v1/health

# Просмотр логов backend
docker-compose logs backend
```

### Проблемы с тестами
```bash
# Запуск с подробным выводом
pytest -vvv -s test_name.py

# Отладка с pdb
pytest --pdb test_name.py
```

## 📞 Поддержка

Для получения помощи:
1. Проверьте логи в директории `logs/`
2. Просмотрите отчеты в директории `reports/`
3. Используйте команду `make -f Makefile.comprehensive info` для диагностики

---

**Система готова к использованию! 🚀**
