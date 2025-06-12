# 🐳 Исправление сохранения изображений в Docker

## Проблема
В предыдущем исправлении не был учтен Docker контейнер:

1. **Отсутствие volume** - изображения сохранялись внутри контейнера
2. **Потеря данных** - при перезапуске контейнера все изображения терялись
3. **Неправильные пути** - settings.py не учитывал Docker окружение
4. **Нет доступа с хоста** - невозможно просмотреть сохраненные файлы

## Исправления для Docker

### 1. Добавлен volume в docker-compose.yaml
```yaml
volumes:
  - ./migrations:/app/migrations
  - ./uploads:/app/uploads  # ← НОВЫЙ volume для изображений
```

### 2. Добавлена переменная окружения
```yaml
environment:
  BACKEND_UPLOADS_DIR: ${BACKEND_UPLOADS_DIR:-uploads}
```

### 3. Исправлен uploads_path в settings.py
```python
@property
def uploads_path(self) -> pathlib.Path:
    """Get absolute path to uploads directory."""
    if pathlib.Path(self.uploads_dir).is_absolute():
        return pathlib.Path(self.uploads_dir)
    
    # In Docker container, working directory is /app
    # In local development, we're in backend/backend
    if pathlib.Path("/app").exists():
        # Docker environment
        return pathlib.Path("/app") / self.uploads_dir
    else:
        # Local development
        return pathlib.Path(__file__).parent.parent / self.uploads_dir
```

### 4. Обновлен .env.example
```bash
### File Upload Settings ###
BACKEND_UPLOADS_DIR=uploads
```

## Результат

✅ **Теперь изображения сохраняются правильно в Docker:**

1. **Persistent storage** - файлы сохраняются на хосте в `backend/backend/uploads/`
2. **Доступ с хоста** - можно просматривать файлы в файловой системе
3. **Переживают перезапуск** - изображения не теряются при restart контейнера
4. **Гибкая настройка** - путь можно изменить через переменную окружения

## Структура файлов

### В контейнере:
```
/app/
├── uploads/
│   └── products/
│       ├── {product_id}_{image_id}.jpg
│       └── {product_id}_{image_id}.png
└── backend/
    └── ...
```

### На хосте:
```
backend/backend/
├── uploads/           ← Volume mount point
│   └── products/
│       ├── {product_id}_{image_id}.jpg
│       └── {product_id}_{image_id}.png
└── backend/
    └── ...
```

## Тестирование

1. **Запустить backend в Docker:**
   ```bash
   cd backend/backend
   make up
   ```

2. **Создать товар с изображением** через seller frontend

3. **Проверить файлы на хосте:**
   ```bash
   ls -la backend/backend/uploads/products/
   ```

4. **Перезапустить контейнер:**
   ```bash
   make down && make up
   ```

5. **Убедиться, что изображения остались:**
   ```bash
   curl http://localhost:8000/api/v1/images/{image_id}/file
   ```

## Файлы изменены
- `backend/backend/docker-compose.yaml` - добавлен volume
- `backend/backend/backend/settings.py` - исправлен uploads_path для Docker
- `.env.example` - добавлена настройка BACKEND_UPLOADS_DIR
