# 🔧 Исправление сохранения изображений при создании товара

## Проблема
При создании товара продавцом изображения не сохранялись корректно из-за следующих проблем:

1. **Отсутствие папки uploads** - папка `uploads/products` не существовала
2. **Относительные пути** - код использовал относительные пути, которые могли не работать в контейнере
3. **Несогласованность FormData** - frontend отправлял `seller_id`, а backend ожидал `keycloak_id`
4. **Отсутствие настроек** - не было централизованных настроек для путей к файлам

## Исправления

### 1. Настройки в settings.py
```python
# Добавлены настройки для файлов
uploads_dir: str = "uploads"
max_file_size: int = 10 * 1024 * 1024  # 10MB

@property
def uploads_path(self) -> pathlib.Path:
    """Get absolute path to uploads directory."""
    if pathlib.Path(self.uploads_dir).is_absolute():
        return pathlib.Path(self.uploads_dir)
    # Relative to project root (where backend/backend is located)
    return pathlib.Path(__file__).parent.parent / self.uploads_dir

@property
def products_uploads_path(self) -> pathlib.Path:
    """Get absolute path to products uploads directory."""
    return self.uploads_path / "products"
```

### 2. ImageService исправлен
```python
def __init__(self):
    """Initialize image service."""
    self.upload_dir = settings.products_uploads_path
    self.upload_dir.mkdir(parents=True, exist_ok=True)
```

### 3. Старый endpoint исправлен
В `product_routes.py` endpoint `/products/with-analysis`:
```python
upload_dir = settings.products_uploads_path
upload_dir.mkdir(parents=True, exist_ok=True)
```

### 4. Frontend FormData исправлен
В `frontend/seller/src/services/api.js`:
```javascript
// Было:
formData.append('seller_id', productData.seller_id);

// Стало:
formData.append('keycloak_id', productData.seller_id); // seller_id is actually keycloak_id
formData.append('volume', parseFloat(productData.volume || 0));
```

### 5. Создана структура папок
```
backend/backend/uploads/
└── products/
    └── .gitkeep
```

## Результат

✅ **Изображения теперь сохраняются корректно**
- Используются абсолютные пути
- Папка создается автоматически при старте
- FormData соответствует ожиданиям backend API
- Централизованные настройки для путей

## Тестирование

1. **Запустить backend**:
   ```bash
   make backend-up
   ```

2. **Создать товар через seller frontend** с изображением

3. **Проверить папку uploads**:
   ```bash
   ls -la backend/backend/uploads/products/
   ```

4. **Проверить API получения изображения**:
   ```bash
   curl http://localhost:8000/api/v1/images/{image_id}/file
   ```

## Файлы изменены
- `backend/backend/backend/settings.py`
- `backend/backend/backend/services/image_service.py`
- `backend/backend/backend/routes/product_routes.py`
- `frontend/seller/src/services/api.js`
- `backend/backend/uploads/products/.gitkeep` (создан)
