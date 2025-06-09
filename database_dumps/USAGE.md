# Руководство по использованию дампов базы данных

## Быстрый старт

### Создание дампов

```bash
# Создать все типы дампов
make db-dump

# Создать только полный дамп
make db-dump-full

# Создать только структуру
make db-dump-schema

# Создать только данные
make db-dump-data

# Создать сжатый дамп
make db-dump-compressed

# Получить информацию о БД
make db-info
```

### Использование скрипта напрямую

```bash
# Показать справку
./database_dumps/create_dump.sh --help

# Создать все дампы
./database_dumps/create_dump.sh --all

# Создать только полный дамп
./database_dumps/create_dump.sh --full

# Создать структуру и данные отдельно
./database_dumps/create_dump.sh --schema --data

# Создать сжатый дамп
./database_dumps/create_dump.sh --compress

# Получить только информацию о БД
./database_dumps/create_dump.sh --info

# Создать дампы без очистки старых
./database_dumps/create_dump.sh --all --no-cleanup
```

## Восстановление базы данных

### Автоматическое восстановление (через Makefile)

```bash
# Интерактивное восстановление
make db-restore
```

### Ручное восстановление

```bash
# Остановить приложение
make down

# Восстановить полную базу данных
docker exec -i backend-pg psql -U backend -d postgres < database_dumps/diplom_database_full_YYYYMMDD_HHMMSS.sql

# Или восстановить только структуру
docker exec -i backend-pg psql -U backend -d backend < database_dumps/diplom_database_schema_YYYYMMDD_HHMMSS.sql

# Затем загрузить данные
docker exec -i backend-pg psql -U backend -d backend < database_dumps/diplom_database_data_YYYYMMDD_HHMMSS.sql

# Запустить приложение
make up
```

### Восстановление из сжатого дампа

```bash
# Распаковать и восстановить
gunzip -c database_dumps/diplom_database_full_YYYYMMDD_HHMMSS.sql.gz | docker exec -i backend-pg psql -U backend -d postgres
```

## Типы дампов

### 1. Полный дамп (`diplom_database_full_*.sql`)
- **Содержимое**: Структура + данные + команды создания/удаления БД
- **Размер**: ~22-24KB
- **Использование**: Полное восстановление базы данных
- **Команды**: `--clean --if-exists --create`

### 2. Дамп структуры (`diplom_database_schema_*.sql`)
- **Содержимое**: Только структура таблиц, индексы, ограничения
- **Размер**: ~19KB
- **Использование**: Создание пустой БД с правильной структурой
- **Команды**: `--schema-only --clean --if-exists --create`

### 3. Дамп данных (`diplom_database_data_*.sql`)
- **Содержимое**: Только данные таблиц (INSERT команды)
- **Размер**: ~3KB (для пустых таблиц)
- **Использование**: Загрузка данных в существующую БД
- **Команды**: `--data-only`

### 4. Сжатый дамп (`diplom_database_full_*.sql.gz`)
- **Содержимое**: Полный дамп в сжатом виде
- **Размер**: ~5-7KB (сжатие ~70%)
- **Использование**: Экономия места при хранении
- **Команды**: `gzip` после создания дампа

## Автоматическая очистка

Скрипт автоматически удаляет старые дампы, оставляя последние 5 файлов каждого типа:

```bash
# Отключить автоматическую очистку
./database_dumps/create_dump.sh --all --no-cleanup

# Ручная очистка старых дампов
find database_dumps/ -name "diplom_database_*.sql" -mtime +30 -delete
```

## Мониторинг и анализ

### Информация о базе данных

```bash
# Получить актуальную информацию
make db-info

# Посмотреть последний информационный файл
cat database_dumps/database_info_*.txt | tail -1
```

### Анализ размеров дампов

```bash
# Показать размеры всех дампов
ls -lh database_dumps/diplom_database_*.sql*

# Сравнить размеры по типам
du -h database_dumps/diplom_database_full_*.sql
du -h database_dumps/diplom_database_schema_*.sql
du -h database_dumps/diplom_database_data_*.sql
```

## Автоматизация

### Cron задача для регулярных дампов

```bash
# Добавить в crontab для ежедневных дампов в 2:00
0 2 * * * cd /path/to/project && ./database_dumps/create_dump.sh --compress --no-cleanup

# Еженедельная полная очистка старых дампов
0 3 * * 0 find /path/to/project/database_dumps/ -name "diplom_database_*.sql*" -mtime +7 -delete
```

### Скрипт для CI/CD

```bash
#!/bin/bash
# Создание дампа перед деплоем
cd /path/to/project
./database_dumps/create_dump.sh --full
if [ $? -eq 0 ]; then
    echo "✅ Дамп создан успешно"
    # Продолжить деплой
else
    echo "❌ Ошибка создания дампа"
    exit 1
fi
```

## Устранение неполадок

### Проблема: Контейнер не найден

```bash
# Проверить запущенные контейнеры
docker ps | grep postgres

# Запустить базу данных
make backend-up
```

### Проблема: Ошибка подключения к БД

```bash
# Проверить логи контейнера
docker logs backend-pg

# Проверить переменные окружения
cat .env | grep -E "(POSTGRES|DB)"
```

### Проблема: Недостаточно прав

```bash
# Сделать скрипт исполняемым
chmod +x database_dumps/create_dump.sh

# Проверить права на директорию
ls -la database_dumps/
```

### Проблема: Нет места на диске

```bash
# Проверить свободное место
df -h

# Очистить старые дампы
rm database_dumps/diplom_database_*_$(date -d '30 days ago' +%Y%m%d)_*.sql*
```

## Безопасность

### Рекомендации по хранению

1. **Не коммитить дампы с данными** в Git репозиторий
2. **Использовать .gitignore** для исключения файлов с данными:
   ```
   database_dumps/*_data_*.sql
   database_dumps/*_full_*.sql
   database_dumps/database_info_*.txt
   ```
3. **Хранить дампы в безопасном месте** с ограниченным доступом
4. **Шифровать дампы** при передаче или долгосрочном хранении

### Шифрование дампов

```bash
# Создать зашифрованный дамп
./database_dumps/create_dump.sh --full
gpg --symmetric --cipher-algo AES256 database_dumps/diplom_database_full_*.sql

# Расшифровать дамп
gpg --decrypt database_dumps/diplom_database_full_*.sql.gpg > restored_dump.sql
```

## Интеграция с системами резервного копирования

### Rsync для удаленного копирования

```bash
# Синхронизация дампов на удаленный сервер
rsync -avz database_dumps/ user@backup-server:/backups/diplom/
```

### AWS S3 для облачного хранения

```bash
# Загрузка в S3 (требует AWS CLI)
aws s3 sync database_dumps/ s3://my-backup-bucket/diplom-db-dumps/
```

## Заключение

Система дампов базы данных обеспечивает:
- ✅ Автоматизированное создание резервных копий
- ✅ Различные типы дампов для разных сценариев
- ✅ Удобные команды через Makefile
- ✅ Автоматическую очистку старых файлов
- ✅ Подробную документацию и логирование
- ✅ Простое восстановление данных

Для получения дополнительной помощи используйте:
```bash
./database_dumps/create_dump.sh --help
make help
```
