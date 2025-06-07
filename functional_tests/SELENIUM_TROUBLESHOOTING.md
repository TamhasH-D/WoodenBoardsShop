# 🔧 Selenium Troubleshooting Guide

## 🚨 Проблема: Selenium Hub не отвечает

Если вы видите ошибку типа:
```
❌ Проблема: Selenium Hub не отвечает на http://selenium-hub:4444/wd/hub
```

## 🔍 Быстрая диагностика

### 1. Проверка статуса контейнеров
```bash
make selenium-status
```

### 2. Автоматическая диагностика
```bash
make selenium-diagnostics
```

### 3. Просмотр логов
```bash
make logs-selenium          # Логи Hub
make logs-selenium-chrome    # Логи Chrome Node
```

## 🛠️ Автоматическое исправление

### Быстрое исправление (рекомендуется)
```bash
make selenium-fix-local
```

Этот скрипт автоматически:
- ✅ Остановит проблемные контейнеры
- ✅ Удалит старые контейнеры
- ✅ Обновит Selenium образы
- ✅ Запустит сервисы заново
- ✅ Проверит их готовность

### Альтернативные команды исправления:
```bash
make selenium-fix        # Python скрипт (может иметь проблемы с DNS)
make selenium-fix-docker # Через Docker контейнер
make selenium-fix-local  # Bash скрипт (рекомендуется)
```

### Ручное исправление

#### Шаг 1: Остановка и очистка
```bash
make down
make clean
```

#### Шаг 2: Пересборка с обновленными образами
```bash
make rebuild
```

#### Шаг 3: Запуск с проверкой
```bash
make up
make health
```

## 🔧 Частые проблемы и решения

### Проблема 1: Hub не запускается
**Симптомы:**
- Контейнер selenium-hub постоянно перезапускается
- Health check не проходит

**Решения:**
```bash
# Проверить логи
make logs-selenium

# Увеличить timeout в docker-compose.test.yaml
# Обновить версию образа Selenium
```

### Проблема 2: Chrome Node не подключается к Hub
**Симптомы:**
- Hub запущен, но Node не регистрируется
- Ошибки подключения в логах Chrome Node

**Решения:**
```bash
# Проверить сетевые настройки
docker network ls
docker network inspect diplom-functional-tests_test_network

# Перезапустить только Selenium сервисы
make selenium-restart
```

### Проблема 3: Недостаточно памяти для Chrome
**Симптомы:**
- Chrome Node падает при запуске браузера
- Ошибки "out of memory" в логах

**Решения:**
- Увеличить `shm_size` в docker-compose.test.yaml
- Уменьшить количество параллельных сессий
- Добавить больше памяти Docker

### Проблема 4: Сетевые проблемы
**Симптомы:**
- DNS не разрешает имена контейнеров
- Timeout при подключении

**Решения:**
```bash
# Пересоздать сети
docker network prune
make down
make up

# Проверить Docker daemon
sudo systemctl restart docker
```

## 📊 Конфигурация Selenium

### Обновленные настройки в docker-compose.test.yaml

#### Selenium Hub
```yaml
selenium-hub:
  image: selenium/hub:4.25.0  # Обновленная версия
  environment:
    SE_EVENT_BUS_HOST: selenium-hub
    SE_EVENT_BUS_PUBLISH_PORT: 4442
    SE_EVENT_BUS_SUBSCRIBE_PORT: 4443
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:4444/wd/hub/status"]
    interval: 15s
    timeout: 10s
    retries: 10
    start_period: 30s
```

#### Chrome Node
```yaml
selenium-chrome:
  image: selenium/node-chrome:4.25.0  # Обновленная версия
  environment:
    SE_EVENT_BUS_HOST: selenium-hub
    NODE_MAX_INSTANCES: 2  # Уменьшено для стабильности
    NODE_MAX_SESSION: 2
  shm_size: 2gb  # Увеличенная память
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:5555/status"]
```

## 🚀 Команды для работы с Selenium

### Диагностика
```bash
make selenium-status         # Статус контейнеров
make selenium-diagnostics    # Полная диагностика
make logs-selenium          # Логи Hub
make logs-selenium-chrome   # Логи Chrome Node
```

### Исправление
```bash
make selenium-fix-local     # Автоматическое исправление (рекомендуется)
make selenium-fix           # Python скрипт исправления
make selenium-restart       # Перезапуск сервисов
make rebuild               # Полная пересборка
```

### Тестирование
```bash
make test-rebuild          # Тесты с пересборкой
make test-browser          # Только браузерные тесты
make health               # Проверка всех сервисов
```

## 🎯 Проверка успешного исправления

После исправления проблем выполните:

```bash
# 1. Проверка статуса
make selenium-status

# 2. Проверка здоровья
make health

# 3. Запуск тестов
make test-rebuild
```

Успешный результат должен показать:
- ✅ selenium-hub: готов
- ✅ selenium-chrome: готов
- ✅ Все сервисы отвечают на health check

## 🔍 Продвинутая диагностика

### Проверка Selenium Grid API
```bash
# Внутри functional-tests контейнера
curl http://selenium-hub:4444/wd/hub/status
curl http://selenium-hub:4444/grid/api/hub
curl http://selenium-chrome:5555/status
```

### Проверка сетевой связности
```bash
# Проверка DNS
nslookup selenium-hub
ping selenium-hub

# Проверка портов
telnet selenium-hub 4444
telnet selenium-chrome 5555
```

### Мониторинг ресурсов
```bash
# Использование памяти и CPU
docker stats selenium-hub selenium-chrome

# Логи в реальном времени
docker logs -f selenium-hub
docker logs -f selenium-chrome
```

## 📋 Чек-лист исправления

- [ ] Проверен статус контейнеров: `make selenium-status`
- [ ] Просмотрены логи: `make logs-selenium`
- [ ] Запущена диагностика: `make selenium-diagnostics`
- [ ] Выполнено автоматическое исправление: `make selenium-fix`
- [ ] Проверено здоровье сервисов: `make health`
- [ ] Запущены тесты: `make test-rebuild`
- [ ] Все тесты проходят успешно

## 🆘 Если ничего не помогает

1. **Полная очистка и пересборка:**
```bash
make clean
docker system prune -f
make test-rebuild
```

2. **Проверка системных ресурсов:**
```bash
df -h          # Свободное место
free -h        # Память
docker system df  # Использование Docker
```

3. **Перезапуск Docker:**
```bash
sudo systemctl restart docker
```

4. **Обращение за помощью:**
- Сохраните логи: `make logs-selenium > selenium_logs.txt`
- Сохраните диагностику: `make selenium-diagnostics > diagnostics.txt`
- Приложите к отчету о проблеме

---

**Помните: большинство проблем Selenium решается командой `make selenium-fix-local`! 🔧**
