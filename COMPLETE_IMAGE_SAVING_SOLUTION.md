# 🖼️ Полное решение для сохранения изображений в Docker

## Обзор проблемы
Изначально при создании товара продавцом изображения не сохранялись корректно из-за:
1. Отсутствия папки uploads
2. Использования относительных путей
3. Несоответствия FormData и backend API
4. Отсутствия Docker volume для persistent storage

## Полное решение

### ✅ Этап 1: Базовое исправление сохранения
- Добавлены настройки uploads в `settings.py`
- Исправлен `ImageService` для правильных путей
- Создана структура папок `uploads/products/`
- Исправлен FormData в frontend (seller_id → keycloak_id)

### ✅ Этап 2: Docker интеграция
- Добавлен volume `./uploads:/app/uploads` в docker-compose.yaml
- Исправлен `uploads_path` для определения Docker/local окружения
- Добавлена переменная окружения `BACKEND_UPLOADS_DIR`
- Обновлен `.env.example` с настройками uploads

## Итоговая конфигурация

### Docker Compose
```yaml
services:
  api:
    volumes:
      - ./migrations:/app/migrations
      - ./uploads:/app/uploads  # Persistent storage для изображений
    environment:
      BACKEND_UPLOADS_DIR: ${BACKEND_UPLOADS_DIR:-uploads}
```

### Settings.py
```python
@property
def uploads_path(self) -> pathlib.Path:
    if pathlib.Path(self.uploads_dir).is_absolute():
        return pathlib.Path(self.uploads_dir)
    
    # Docker vs Local detection
    if pathlib.Path("/app").exists():
        return pathlib.Path("/app") / self.uploads_dir  # Docker
    else:
        return pathlib.Path(__file__).parent.parent / self.uploads_dir  # Local
```

### Frontend API
```javascript
// Правильный FormData для backend
formData.append('keycloak_id', productData.seller_id);
formData.append('volume', parseFloat(productData.volume || 0));
```

## Структура файлов

### В Docker контейнере:
```
/app/
├── uploads/products/          ← Изображения товаров
│   ├── {product_id}_{image_id}.jpg
│   └── {product_id}_{image_id}.png
└── backend/
    └── ...
```

### На хост-системе:
```
backend/backend/
├── uploads/                   ← Volume mount point
│   └── products/
│       ├── {product_id}_{image_id}.jpg
│       └── {product_id}_{image_id}.png
└── docker-compose.yaml
```

## Преимущества решения

✅ **Persistent Storage** - изображения сохраняются на хосте  
✅ **Docker Ready** - работает в контейнере и локально  
✅ **Configurable** - настраивается через переменные окружения  
✅ **Backward Compatible** - не ломает существующий код  
✅ **Production Ready** - готово для продакшена  

## Инструкции по использованию

### 1. Настройка окружения
```bash
# Скопировать .env.example в .env
cp .env.example .env

# Настроить BACKEND_UPLOADS_DIR если нужно (по умолчанию: uploads)
```

### 2. Запуск в Docker
```bash
cd backend/backend
make up
```

### 3. Проверка работы
```bash
# Создать товар с изображением через seller frontend
# Проверить файлы на хосте
ls -la backend/backend/uploads/products/

# Проверить API
curl http://localhost:8000/api/v1/images/{image_id}/file
```

### 4. Тестирование persistence
```bash
# Перезапустить контейнер
make down && make up

# Убедиться, что изображения остались
ls -la backend/backend/uploads/products/
```

## Файлы изменены
- `backend/backend/backend/settings.py` - настройки uploads
- `backend/backend/backend/services/image_service.py` - правильные пути
- `backend/backend/backend/routes/product_routes.py` - использование settings
- `backend/backend/docker-compose.yaml` - volume для uploads
- `frontend/seller/src/services/api.js` - исправлен FormData
- `backend/backend/uploads/products/.gitkeep` - структура папок
- `.env.example` - настройки uploads

## Результат
🎉 **Изображения теперь сохраняются правильно в Docker и переживают перезапуск контейнера!**
