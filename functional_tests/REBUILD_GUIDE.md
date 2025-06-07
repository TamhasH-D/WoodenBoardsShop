# 🔄 Руководство по Rebuild командам

## ⚠️ Когда ОБЯЗАТЕЛЬНО нужна пересборка

### После изменений в коде
```bash
# Изменили тесты или backend код
make test-rebuild

# Изменили только UUID тесты
make test-uuid-rebuild

# Изменили только API тесты
make test-api-rebuild
```

### Конкретные случаи

#### ✅ Изменения в тестах
- Обновили `utils/data_factory.py`
- Изменили любые файлы в `api_tests/`
- Добавили новые тесты в `integration_tests/`
- Обновили `conftest.py` или `base/test_base.py`

#### ✅ Изменения в зависимостях
- Обновили `requirements.txt`
- Добавили новые Python пакеты
- Изменили версии библиотек

#### ✅ Изменения в backend
- Обновили код backend API
- Изменили модели данных
- Обновили схемы базы данных

#### ✅ Изменения в конфигурации
- Обновили `Dockerfile`
- Изменили `docker-compose.test.yaml`
- Обновили переменные окружения

#### ✅ После git операций
- Сделали `git pull` с новыми изменениями
- Переключились на другую ветку
- Смержили изменения

## 🚀 Доступные rebuild команды

### Основные команды
```bash
make rebuild              # Только пересборка образов
make test-rebuild         # Пересборка + все тесты
make test-api-rebuild     # Пересборка + API тесты
make test-uuid-rebuild    # Пересборка + UUID тесты
```

### Специализированные команды
```bash
# UUID тестирование
make test-uuid-rebuild                    # Все UUID тесты
make test-uuid-validation                 # Валидация UUID (локально)
make test-uuid-integration                # Интеграционные UUID тесты (локально)

# API тестирование
make test-api-rebuild                     # Все API тесты
make test-api-local                       # API тесты локально

# Полное тестирование
make test-rebuild                         # Все тесты с пересборкой
```

## 📋 Алгоритм принятия решения

### 1. Первый запуск
```bash
# Можно использовать обычные команды
make test-uuid
make test-api
```

### 2. После изменений в коде
```bash
# ОБЯЗАТЕЛЬНО используйте rebuild
make test-uuid-rebuild
make test-api-rebuild
```

### 3. Повторный запуск без изменений
```bash
# Можно использовать обычные команды
make test-uuid
make test-api
```

### 4. Локальная разработка
```bash
# Для быстрой итерации
make test-uuid-local
make dev-test-uuid
```

## 🔍 Диагностика проблем

### Если тесты не видят изменения
```bash
# 1. Принудительная пересборка
make rebuild

# 2. Очистка и пересборка
make clean
make test-rebuild

# 3. Проверка образов
docker images | grep functional-tests
```

### Если ошибки при сборке
```bash
# 1. Очистка Docker кэша
docker system prune -f

# 2. Пересборка без кэша
make rebuild

# 3. Полная очистка
make clean
make test-rebuild
```

### Если проблемы с зависимостями
```bash
# 1. Проверка requirements.txt
cat requirements.txt

# 2. Пересборка с очисткой
make clean
make rebuild

# 3. Проверка установки пакетов
make shell
pip list
```

## 💡 Лучшие практики

### Для разработчиков
1. **После каждого изменения кода** - используйте `-rebuild`
2. **Перед коммитом** - запустите `make test-rebuild`
3. **После git pull** - всегда `make test-rebuild`
4. **При отладке** - используйте локальные команды для скорости

### Для CI/CD
```bash
# В pipeline всегда используйте rebuild
make test-rebuild
make ci-test
```

### Для production проверок
```bash
# Полная проверка с пересборкой
make clean
make test-rebuild
make reports
```

## 🎯 Примеры использования

### Сценарий 1: Обновили data_factory.py
```bash
# Изменили utils/data_factory.py
git add utils/data_factory.py
git commit -m "fix: обновлена генерация UUID"

# ОБЯЗАТЕЛЬНО пересборка
make test-uuid-rebuild
```

### Сценарий 2: Добавили новый тест
```bash
# Создали test_new_feature.py
git add api_tests/test_new_feature.py
git commit -m "feat: добавлен тест новой функции"

# ОБЯЗАТЕЛЬНО пересборка
make test-api-rebuild
```

### Сценарий 3: Обновили backend
```bash
# Изменили backend код
git pull origin main

# ОБЯЗАТЕЛЬНО пересборка
make test-rebuild
```

### Сценарий 4: Быстрая итерация
```bash
# Разработка нового теста
make test-uuid-local  # Быстро

# Финальная проверка
make test-uuid-rebuild  # С пересборкой
```

## 🚨 Частые ошибки

### ❌ Не используете rebuild после изменений
```bash
# НЕПРАВИЛЬНО
# Изменили код
make test-uuid  # Старая версия!

# ПРАВИЛЬНО
# Изменили код
make test-uuid-rebuild  # Новая версия!
```

### ❌ Используете rebuild без необходимости
```bash
# НЕЭФФЕКТИВНО
make test-uuid-rebuild  # Каждый раз
make test-uuid-rebuild  # Без изменений
make test-uuid-rebuild  # Медленно

# ЭФФЕКТИВНО
make test-uuid-rebuild  # После изменений
make test-uuid          # Повторные запуски
make test-uuid-local    # Для разработки
```

### ❌ Забываете очистку при проблемах
```bash
# При странных ошибках
make clean              # Очистка
make test-rebuild       # Пересборка
```

## 📊 Время выполнения

### Обычные команды
- `make test-uuid` - ~30 секунд
- `make test-api` - ~60 секунд

### Rebuild команды
- `make test-uuid-rebuild` - ~2-3 минуты
- `make test-api-rebuild` - ~3-4 минуты
- `make test-rebuild` - ~5-7 минут

### Локальные команды
- `make test-uuid-local` - ~10-15 секунд
- `make dev-test-uuid` - ~5 секунд

## ✅ Чек-лист перед коммитом

```bash
# 1. Изменили код тестов?
make test-uuid-rebuild

# 2. Все тесты проходят?
make test-api-rebuild

# 3. Нет ошибок в логах?
make logs-test

# 4. Отчеты генерируются?
make reports

# 5. Готово к коммиту!
git commit -m "..."
```

---

**Помните: rebuild команды - это гарантия актуальности тестов! 🔄**
