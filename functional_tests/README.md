# Функциональные тесты - Diplom Project

Комплексная система функциональных тестов для всех API эндпоинтов и frontend приложений проекта.

## 🏗️ Архитектура тестирования

### Компоненты системы
- **Docker контейнер** для изолированного тестового окружения
- **Selenium WebDriver** для автоматизации браузерных тестов
- **Docker Compose** для оркестрации всех сервисов
- **Pytest** как основной тестовый фреймворк

### Структура тестов
```
functional_tests/
├── api_tests/              # API тесты для всех эндпоинтов
├── browser_tests/          # Браузерные тесты для frontend
├── integration_tests/      # End-to-end интеграционные тесты
├── base/                   # Базовые классы и миксины
├── utils/                  # Утилиты (API клиент, фабрики данных)
└── reports/               # Отчеты и скриншоты
```

## 🎯 Покрытие тестами

### API Эндпоинты
- ✅ **Buyer API** - CRUD операции для покупателей
- ✅ **Seller API** - CRUD операции для продавцов
- ✅ **Product API** - Управление продуктами
- ✅ **Wood Type API** - Типы древесины
- ✅ **Wood Type Price API** - Цены на древесину
- ✅ **Wooden Board API** - Деревянные доски
- ✅ **Image API** - Управление изображениями
- ✅ **Chat Thread API** - Треды чатов
- ✅ **Chat Message API** - Сообщения чатов
- ✅ **Health API** - Проверка здоровья системы
- ✅ **Demo API** - Демонстрационные эндпоинты

### Frontend Приложения
- ✅ **Buyer Frontend** - Интерфейс покупателя
- ✅ **Seller Frontend** - Интерфейс продавца
- ✅ **Admin Frontend** - Административный интерфейс

### Типы тестов
- **Позитивные сценарии** - Валидные данные и операции
- **Негативные сценарии** - Невалидные данные, ошибки валидации
- **Граничные случаи** - Несуществующие ресурсы, пустые данные
- **Интеграционные тесты** - End-to-end сценарии

## 🚀 Запуск тестов

### Предварительные требования
- Docker и Docker Compose
- Доступ к интернету для загрузки образов

### Запуск всех тестов
```bash
# Запуск всех тестов
docker-compose -f functional_tests/docker-compose.test.yaml up --build

# Или через переменную окружения
TEST_TYPE=all docker-compose -f functional_tests/docker-compose.test.yaml up --build
```

### Запуск отдельных типов тестов

#### API тесты
```bash
TEST_TYPE=api docker-compose -f functional_tests/docker-compose.test.yaml up --build
```

#### Браузерные тесты
```bash
TEST_TYPE=browser docker-compose -f functional_tests/docker-compose.test.yaml up --build
```

#### Интеграционные тесты
```bash
TEST_TYPE=integration docker-compose -f functional_tests/docker-compose.test.yaml up --build
```

### Локальный запуск (для разработки)
```bash
cd functional_tests

# Установка зависимостей
pip install -r requirements.txt

# Запуск конкретных тестов
pytest api_tests/test_buyer_api.py -v
pytest browser_tests/test_buyer_frontend.py -v
pytest integration_tests/test_end_to_end.py -v
```

## 🔧 Конфигурация

### Переменные окружения
```bash
# Backend сервис
BACKEND_URL=http://test-backend:8000

# Selenium Hub
SELENIUM_HUB_URL=http://selenium-hub:4444/wd/hub

# Frontend приложения
FRONTEND_ADMIN_URL=http://admin-frontend
FRONTEND_SELLER_URL=http://seller-frontend
FRONTEND_BUYER_URL=http://buyer-frontend

# Тип тестов
TEST_TYPE=all|api|browser|integration
```

### Настройка базы данных
Тесты используют отдельную тестовую базу данных:
- **Host**: test-postgres
- **Database**: test_diplom
- **User**: test_user
- **Password**: test_password

## 📊 Отчеты и логирование

### HTML отчеты
Генерируются автоматически в директории `reports/`:
- `api_tests_report.html` - Отчет по API тестам
- `browser_tests_report.html` - Отчет по браузерным тестам
- `integration_tests_report.html` - Отчет по интеграционным тестам
- `all_tests_report.html` - Общий отчет
- `coverage/` - Отчет о покрытии кода

### Скриншоты
При падении браузерных тестов автоматически создаются скриншоты в `screenshots/`

### Логирование
- Детальные логи выполнения тестов
- Информация о состоянии сервисов
- Ошибки и исключения с полным стеком

## 🛠️ Разработка тестов

### Базовые классы
- `BaseAPITest` - Базовый класс для API тестов
- `BaseBrowserTest` - Базовый класс для браузерных тестов
- `BaseIntegrationTest` - Базовый класс для интеграционных тестов

### Миксины
- `APITestMixin` - Общие методы для API тестов
- `BrowserTestMixin` - Общие методы для браузерных тестов

### Фабрики данных
`TestDataFactory` предоставляет методы для создания тестовых данных:
```python
# Создание тестовых сущностей
buyer = await test_data_factory.create_buyer()
seller = await test_data_factory.create_seller()
product = await test_data_factory.create_product(seller_id=seller_id)

# Создание комплексных сценариев
product_set = await test_data_factory.create_complete_product_set()
chat_scenario = await test_data_factory.create_chat_scenario()
```

### API клиент
`APIClient` предоставляет методы для всех API эндпоинтов:
```python
# CRUD операции
response = await api_client.create_buyer(buyer_data)
buyer = await api_client.get_buyer(buyer_id)
await api_client.update_buyer(buyer_id, update_data)
await api_client.delete_buyer(buyer_id)

# Списки с пагинацией
buyers = await api_client.get_buyers(limit=10, offset=0)
```

## 🔍 Отладка тестов

### Просмотр логов
```bash
# Логи тестового контейнера
docker logs functional-tests

# Логи backend сервиса
docker logs test-backend

# Логи Selenium Hub
docker logs selenium-hub
```

### Подключение к контейнерам
```bash
# Подключение к тестовому контейнеру
docker exec -it functional-tests bash

# Подключение к тестовой БД
docker exec -it test-postgres psql -U test_user -d test_diplom
```

### Отладка браузерных тестов
- Скриншоты сохраняются автоматически при ошибках
- Можно добавить `self.take_screenshot("debug_point")` в любом месте теста
- Selenium Hub доступен по адресу http://localhost:4444 для мониторинга

## 🚦 CI/CD интеграция

### GitLab CI/CD
Тесты интегрированы в пайплайн GitLab:
```yaml
functional_tests:
  stage: test
  script:
    - docker-compose -f functional_tests/docker-compose.test.yaml up --build --abort-on-container-exit
  artifacts:
    reports:
      junit: functional_tests/reports/junit.xml
    paths:
      - functional_tests/reports/
      - functional_tests/screenshots/
```

### Переменные для CI
- `CI_REGISTRY_IMAGE` - Образ для тестов
- `TEST_TYPE` - Тип запускаемых тестов
- `BACKEND_URL` - URL backend сервиса в CI

## 📋 Чек-лист для новых тестов

При добавлении новых тестов убедитесь:
- ✅ Тест наследуется от соответствующего базового класса
- ✅ Используется `test_data_factory` для создания данных
- ✅ Добавлена автоочистка данных после теста
- ✅ Тест покрывает позитивные и негативные сценарии
- ✅ Добавлены проверки ошибок и граничных случаев
- ✅ Тест документирован с описанием сценария
- ✅ Добавлены скриншоты для браузерных тестов при ошибках

## 🤝 Участие в разработке

1. Создайте ветку для новых тестов
2. Следуйте принципам TDD
3. Добавляйте тесты для новых API эндпоинтов
4. Обновляйте документацию
5. Создавайте PR с описанием изменений

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи контейнеров
2. Убедитесь, что все сервисы запущены
3. Проверьте переменные окружения
4. Создайте issue с описанием проблемы и логами