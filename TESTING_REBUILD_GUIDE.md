# 🔄 Testing Rebuild Commands - Корневой Makefile

## 🎯 Новые команды rebuild в корневом Makefile

Добавлены команды для запуска функциональных тестов с полной пересборкой Docker образов из корневой директории проекта.

### 📋 Доступные команды

#### Основные команды rebuild
```bash
make test-rebuild              # Все тесты с пересборкой
make test-api-rebuild          # API тесты с пересборкой  
make test-browser-rebuild      # Браузерные тесты с пересборкой
make test-integration-rebuild  # Интеграционные тесты с пересборкой
```

#### Обычные команды (без пересборки)
```bash
make test                      # Все тесты
make test-api                  # API тесты
make test-browser              # Браузерные тесты
make test-integration          # Интеграционные тесты
```

## ⚠️ Когда использовать rebuild команды

### Обязательно используйте `-rebuild` команды когда:
- ✅ Изменили код в `functional_tests/`
- ✅ Обновили `functional_tests/requirements.txt`
- ✅ Изменили `functional_tests/docker-compose.test.yaml`
- ✅ Обновили backend код
- ✅ Изменили любые Dockerfile
- ✅ После `git pull` с новыми изменениями
- ✅ При первом запуске после клонирования репозитория

### Можно использовать обычные команды когда:
- ✅ Повторный запуск без изменений в коде
- ✅ Быстрое тестирование без изменений
- ✅ Отладка уже собранных образов

## 🚀 Примеры использования

### Сценарий 1: После изменений в функциональных тестах
```bash
# Изменили файлы в functional_tests/
git add functional_tests/
git commit -m "feat: обновлены тесты"

# ОБЯЗАТЕЛЬНО используем rebuild
make test-rebuild
```

### Сценарий 2: После обновления backend
```bash
# Изменили backend код
git add backend/
git commit -m "fix: исправлен API"

# ОБЯЗАТЕЛЬНО используем rebuild для проверки
make test-api-rebuild
```

### Сценарий 3: После git pull
```bash
# Получили обновления
git pull origin main

# ОБЯЗАТЕЛЬНО пересобираем и тестируем
make test-rebuild
```

### Сценарий 4: Быстрое повторное тестирование
```bash
# Первый запуск с пересборкой
make test-api-rebuild

# Повторный запуск без изменений (быстрее)
make test-api
```

## 🔧 Как работают rebuild команды

### Последовательность выполнения:
1. **Проверка зависимостей** - проверяет наличие Docker и файлов
2. **Пересборка образов** - `make test-build` (с `--no-cache`)
3. **Остановка старых контейнеров** - очистка окружения
4. **Запуск новых контейнеров** - с обновленными образами
5. **Выполнение тестов** - запуск указанного типа тестов
6. **Очистка** - остановка контейнеров после тестов
7. **Отчеты** - показ результатов и путей к отчетам

### Отличия от обычных команд:
- **Rebuild команды**: всегда пересобирают образы перед запуском
- **Обычные команды**: используют существующие образы или собирают только при необходимости

## 📊 Время выполнения

### Rebuild команды (с пересборкой):
- `make test-rebuild` - 8-12 минут
- `make test-api-rebuild` - 5-8 минут
- `make test-browser-rebuild` - 6-9 минут
- `make test-integration-rebuild` - 7-10 минут

### Обычные команды (без пересборки):
- `make test` - 3-5 минут
- `make test-api` - 2-3 минуты
- `make test-browser` - 2-4 минуты
- `make test-integration` - 3-4 минуты

## 🔍 Диагностика проблем

### Если rebuild команды не работают:

#### 1. Проверка зависимостей
```bash
# Проверка Docker
docker --version
docker-compose --version

# Проверка файлов
ls -la functional_tests/docker-compose.test.yaml
```

#### 2. Ручная пересборка
```bash
# Если автоматическая пересборка не работает
make test-build
make test-up
make test-status
```

#### 3. Полная очистка и пересборка
```bash
# При серьезных проблемах
make test-clean
make test-build
make test-rebuild
```

#### 4. Проверка логов
```bash
# Логи последнего запуска
make test-logs

# Статистика тестов
make test-logs-stats

# Детальные отчеты
make test-reports
```

## 📚 Интеграция с CI/CD

### В GitLab CI/CD pipeline:
```yaml
test_functional:
  stage: test
  script:
    - make test-rebuild
  artifacts:
    reports:
      junit: functional_tests/reports/junit.xml
    paths:
      - functional_tests/reports/
      - functional_tests/logs/
```

### В GitHub Actions:
```yaml
- name: Run functional tests
  run: make test-rebuild
  
- name: Upload test reports
  uses: actions/upload-artifact@v3
  with:
    name: test-reports
    path: functional_tests/reports/
```

## 🎯 Лучшие практики

### Для разработчиков:
1. **После каждого изменения** - используйте rebuild команды
2. **Перед коммитом** - запустите `make test-rebuild`
3. **После git pull** - всегда `make test-rebuild`
4. **При отладке** - используйте обычные команды для скорости

### Для команды:
1. **В документации** - указывайте когда нужен rebuild
2. **В PR** - требуйте прохождения `make test-rebuild`
3. **В CI/CD** - используйте только rebuild команды
4. **При релизе** - обязательный `make test-rebuild`

## 🔗 Связь с functional_tests Makefile

### Корневой Makefile делегирует команды:
- `make test-rebuild` → `cd functional_tests && make test-rebuild`
- `make test-api-rebuild` → `cd functional_tests && make test-api-rebuild`

### Можно использовать напрямую:
```bash
# Из корня проекта
make test-rebuild

# Или из functional_tests/
cd functional_tests
make test-rebuild
```

### Преимущества корневого Makefile:
- ✅ Единая точка входа для всех команд
- ✅ Автоматическая проверка зависимостей
- ✅ Консистентное поведение
- ✅ Интеграция с основными командами проекта

## 📋 Чек-лист использования

### Перед запуском rebuild команд:
- [ ] Убедитесь, что Docker запущен
- [ ] Проверьте наличие свободного места (минимум 5GB)
- [ ] Закройте ненужные Docker контейнеры
- [ ] Сохраните все изменения в коде

### После запуска:
- [ ] Проверьте статистику тестов: `make test-logs-stats`
- [ ] Просмотрите отчеты: `make test-reports`
- [ ] При ошибках - изучите логи: `make test-logs`
- [ ] Убедитесь в успешном прохождении всех тестов

## 🆘 Поддержка

### При проблемах с rebuild командами:

1. **Проверьте справку:**
```bash
make help-test
```

2. **Запустите диагностику:**
```bash
make test-status
cd functional_tests && make selenium-diagnostics
```

3. **Полная очистка:**
```bash
make test-clean
make clean-all
make test-rebuild
```

4. **Обратитесь за помощью:**
- Приложите вывод `make test-logs`
- Укажите команду, которая не работает
- Опишите изменения, после которых возникла проблема

---

**Помните: rebuild команды - это гарантия актуальности тестов после любых изменений! 🔄**
