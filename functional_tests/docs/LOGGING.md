# Система логирования функциональных тестов

Комплексная система логирования результатов функциональных тестов с поддержкой реального времени, анализа и отчетности.

## 🎯 Возможности

- **Автоматическое логирование** всех тестов через pytest плагин
- **Файлы логов** с уникальными именами для каждого запуска
- **Реальное время** - логи создаются во время выполнения тестов
- **Поддержка кириллицы** в сообщениях об ошибках
- **JSON отчеты** для программного анализа
- **Автоочистка** старых логов (>30 дней)
- **Анализ статистики** и трендов

## 📁 Структура файлов

```
functional_tests/
├── logs/                           # Директория логов
│   ├── test_results_2024-01-15_14-30-25.log  # Лог файл
│   └── test_results_2024-01-15_14-30-25.json # JSON отчет
├── utils/
│   ├── test_logger.py             # Основная система логирования
│   ├── pytest_logger_plugin.py   # Pytest плагин
│   └── log_analyzer.py           # Анализатор логов
└── docs/
    └── LOGGING.md                # Эта документация
```

## 📝 Формат логов

### Формат записи
```
[TIMESTAMP] TEST_NAME | STATUS | DURATION | ERROR_MESSAGE
```

### Пример лога
```
================================================================================
ФУНКЦИОНАЛЬНЫЕ ТЕСТЫ - DIPLOM PROJECT
================================================================================
Дата и время начала: 2024-01-15 14:30:25
Тип тестов: API
Файл лога: test_results_2024-01-15_14-30-25.log
================================================================================

ФОРМАТ: [TIMESTAMP] TEST_NAME | STATUS | DURATION | ERROR_MESSAGE

[2024-01-15 14:30:26] ===== API TESTS =====
[2024-01-15 14:30:26] test_health_api::test_health_check_success | STARTED | - | Тест запущен
[2024-01-15 14:30:27] test_health_api::test_health_check_success | PASSED | 0.856s | -
[2024-01-15 14:30:27] test_buyer_api::test_create_buyer_success | STARTED | - | Тест запущен
[2024-01-15 14:30:28] test_buyer_api::test_create_buyer_success | FAILED | 1.234s | AssertionError: Expected status 201, got 500
[2024-01-15 14:30:28] ===== API TESTS ЗАВЕРШЕНО =====
Пройдено: 1, Упало: 1, Пропущено: 0

================================================================================
ИТОГОВАЯ СТАТИСТИКА
================================================================================
Время окончания: 2024-01-15 14:30:28
Общее время выполнения: 3.2 секунд
Всего тестов: 2
Пройдено: 1
Упало: 1
Пропущено: 0
Процент успешности: 50.0%
================================================================================

УПАВШИЕ ТЕСТЫ:
----------------------------------------
• test_buyer_api::test_create_buyer_success
  Ошибка: AssertionError: Expected status 201, got 500
  Длительность: 1.234s
```

## 🚀 Использование

### Автоматическое логирование

Логирование происходит автоматически при запуске тестов:

```bash
# Запуск с автоматическим логированием
make test-api
make test-browser
make test-integration
make test
```

### Просмотр логов

```bash
# Показать последний лог
make logs-test

# Следить за логом в реальном времени
make logs-tail

# Список всех логов
make logs-list

# Статистика последнего запуска
make logs-stats
```

### Анализ логов

```bash
# Статистика последнего запуска
python utils/log_analyzer.py --latest

# Сводная статистика за 7 дней
python utils/log_analyzer.py --summary 7

# Список всех логов
python utils/log_analyzer.py --list
```

## 🔧 Программное использование

### Использование LogCapture

```python
from utils.test_logger import LogCapture

def test_example():
    with LogCapture("test_example"):
        # Ваш тест здесь
        assert True
    # Результат автоматически логируется
```

### Прямое использование TestLogger

```python
from utils.test_logger import get_test_logger

def test_with_manual_logging():
    logger = get_test_logger()
    
    logger.log_test_start("manual_test")
    
    try:
        # Ваш тест
        result = some_operation()
        logger.log_test_result("manual_test", "PASSED", 1.5)
    except Exception as e:
        logger.log_test_result("manual_test", "FAILED", 1.5, str(e))
```

### Работа с JSON отчетами

```python
import json
from utils.test_logger import TestLogger

# Загрузка JSON отчета
with open("logs/test_results_2024-01-15_14-30-25.json", "r") as f:
    report = json.load(f)

# Анализ данных
stats = report["statistics"]
print(f"Успешность: {stats['passed'] / stats['total'] * 100:.1f}%")

# Поиск упавших тестов
failed_tests = [t for t in report["test_results"] if t["status"] == "FAILED"]
```

## 📊 Анализ и отчетность

### Статистика последнего запуска

```bash
make logs-stats
```

Выводит:
- Тип тестов
- Время выполнения
- Количество пройденных/упавших/пропущенных тестов
- Процент успешности
- Список упавших тестов с ошибками

### Сводная статистика

```bash
python utils/log_analyzer.py --summary 30
```

Показывает за указанный период:
- Общее количество запусков
- Статистику по типам тестов
- Ежедневную статистику
- Наиболее падающие тесты
- Среднее время выполнения

### Экспорт данных

Все логи автоматически экспортируются в JSON формат для программного анализа:

```json
{
  "test_session": {
    "start_time": "2024-01-15T14:30:25",
    "end_time": "2024-01-15T14:30:28",
    "test_type": "api",
    "log_file": "logs/test_results_2024-01-15_14-30-25.log"
  },
  "statistics": {
    "total": 2,
    "passed": 1,
    "failed": 1,
    "skipped": 0
  },
  "test_results": [
    {
      "name": "test_health_api::test_health_check_success",
      "status": "PASSED",
      "duration": 0.856,
      "error": null,
      "timestamp": "2024-01-15 14:30:27"
    }
  ]
}
```

## 🧹 Управление логами

### Очистка логов

```bash
# Очистить все логи
make clean-logs

# Очистить старые логи (>30 дней)
make clean-old-logs

# Полная очистка (логи, отчеты, скриншоты)
make clean
```

### Автоматическая очистка

Система автоматически удаляет логи старше 30 дней при каждом запуске тестов.

## 🐳 Docker интеграция

### Volume mapping

В `docker-compose.test.yaml` настроен volume mapping для сохранения логов на хосте:

```yaml
volumes:
  - ./logs:/app/logs
```

### Переменные окружения

```yaml
environment:
  TEST_TYPE: ${TEST_TYPE:-all}
  LOG_LEVEL: INFO
```

## 🔍 Отладка

### Проверка создания логов

```bash
# Проверить, создаются ли логи
ls -la functional_tests/logs/

# Проверить последний лог
tail -f functional_tests/logs/test_results_*.log
```

### Проблемы с кодировкой

Все файлы создаются с кодировкой UTF-8 для поддержки кириллицы:

```python
with open(log_file, 'w', encoding='utf-8') as f:
    f.write(content)
```

### Проблемы с правами доступа

В Docker контейнере логи создаются с правами пользователя контейнера. Для доступа с хоста:

```bash
# Изменить владельца логов
sudo chown -R $USER:$USER functional_tests/logs/
```

## 📈 Интеграция с CI/CD

### GitLab CI/CD

Логи автоматически сохраняются как артефакты:

```yaml
artifacts:
  paths:
    - functional_tests/logs/
  expire_in: 1 week
  when: always
```

### Анализ в пайплайне

```bash
# В CI/CD скрипте
python functional_tests/utils/log_analyzer.py --latest
```

## 🛠️ Настройка

### Изменение формата логов

Отредактируйте `utils/test_logger.py`:

```python
def log_test_result(self, test_name: str, status: str, duration: float, 
                   error_message: Optional[str] = None):
    # Измените формат здесь
    message = f"[{timestamp}] {test_name} | {status} | {duration_str} | {error_message}\n"
```

### Изменение периода очистки

```python
# В TestLogger.__init__()
cutoff_date = datetime.now() - timedelta(days=60)  # Изменить на 60 дней
```

### Добавление новых метрик

Расширьте класс `TestLogger` для добавления новых метрик:

```python
def log_performance_metric(self, test_name: str, metric_name: str, value: float):
    # Ваша реализация
    pass
```

## 🤝 Участие в разработке

1. Все изменения в системе логирования должны быть обратно совместимы
2. Добавляйте тесты для новой функциональности
3. Обновляйте документацию при изменениях
4. Следите за производительностью - логирование не должно замедлять тесты

## 📞 Поддержка

При возникновении проблем:

1. Проверьте права доступа к директории `logs/`
2. Убедитесь, что pytest плагин загружается корректно
3. Проверьте кодировку файлов (должна быть UTF-8)
4. Посмотрите логи Docker контейнера для диагностики
