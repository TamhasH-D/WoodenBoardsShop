# UUID Testing в функциональных тестах

Документация по тестированию UUID функциональности в backend API.

## 🎯 Архитектурная особенность

Backend API требует, чтобы **frontend самостоятельно генерировал и передавал UUID** в теле POST запросов при создании любых записей. Это означает:

- Все InputDTO содержат обязательное поле `id: UUID`
- Backend не генерирует UUID автоматически
- Frontend должен обеспечить уникальность UUID
- Backend возвращает тот же UUID, который был передан

## 📋 Анализ API контрактов

### Сущности, требующие UUID при создании:

1. **Buyer** (`BuyerInputDTO`)
   - `id: UUID` - основной идентификатор
   - `keycloak_uuid: UUID` - идентификатор аутентификации

2. **Seller** (`SellerInputDTO`)
   - `id: UUID` - основной идентификатор
   - `keycloak_uuid: UUID` - идентификатор аутентификации

3. **Product** (`ProductInputDTO`)
   - `id: UUID` - основной идентификатор
   - `seller_id: UUID` - ссылка на продавца

4. **WoodType** (`WoodTypeInputDTO`)
   - `id: UUID` - основной идентификатор

5. **WoodTypePrice** (`WoodTypePriceInputDTO`)
   - `id: UUID` - основной идентификатор
   - `wood_type_id: UUID` - ссылка на тип древесины

6. **WoodenBoard** (`WoodenBoardInputDTO`)
   - `id: UUID` - основной идентификатор

7. **Image** (`ImageInputDTO`)
   - `id: UUID` - основной идентификатор

8. **ChatThread** (`ChatThreadInputDTO`)
   - `id: UUID` - основной идентификатор
   - `buyer_id: UUID` - ссылка на покупателя
   - `seller_id: UUID` - ссылка на продавца

9. **ChatMessage** (`ChatMessageInputDTO`)
   - `id: UUID` - основной идентификатор
   - `thread_id: UUID` - ссылка на тред
   - `sender_id: UUID` - ссылка на отправителя

## 🔧 Обновленная система тестирования

### UUIDManager

Новый класс для управления уникальностью UUID в рамках тестового запуска:

```python
class UUIDManager:
    def __init__(self):
        self._used_uuids: Set[str] = set()
    
    def generate_unique_uuid(self) -> str:
        """Генерация уникального UUID в рамках тестового запуска."""
        while True:
            new_uuid = str(uuid.uuid4())
            if new_uuid not in self._used_uuids:
                self._used_uuids.add(new_uuid)
                return new_uuid
```

### Обновленная TestDataFactory

Все методы создания сущностей обновлены для использования UUIDManager:

```python
async def create_buyer(self, **kwargs) -> Dict[str, Any]:
    """Создание тестового покупателя с автоматической генерацией UUID."""
    buyer_data = {
        "id": self.generate_uuid(),
        "keycloak_uuid": self.generate_uuid(),
        "is_online": fake.boolean(),
        **kwargs
    }
    
    result = await self.api_client.create_buyer(buyer_data)
    self.created_entities['buyers'].append(result['data']['id'])
    return result
```

### Методы для негативных тестов

Добавлены специальные методы для тестирования невалидных UUID:

```python
def create_invalid_uuid_data(self, entity_type: str, **kwargs) -> Dict[str, Any]:
    """Создание данных с невалидным UUID для негативных тестов."""
    # Возвращает данные с невалидным UUID формата

def create_duplicate_uuid_data(self, existing_uuid: str, entity_type: str, **kwargs) -> Dict[str, Any]:
    """Создание данных с дублирующимся UUID для негативных тестов."""
    # Возвращает данные с существующим UUID
```

## 🧪 Типы тестов

### 1. Позитивные тесты создания

Проверяют корректное создание сущностей с валидными UUID:

```python
@pytest.mark.asyncio
async def test_create_buyer_success(self, api_client, test_data_factory):
    """Тест успешного создания покупателя с корректным UUID."""
    buyer_data = {
        "id": test_data_factory.generate_uuid(),
        "keycloak_uuid": test_data_factory.generate_uuid(),
        "is_online": True
    }
    
    response = await api_client.create_buyer(buyer_data)
    
    # Проверяем, что backend вернул тот же UUID
    assert response["data"]["id"] == buyer_data["id"]
```

### 2. Негативные тесты UUID

#### Отсутствие UUID
```python
@pytest.mark.asyncio
async def test_create_buyer_missing_uuid(self, api_client):
    """Тест создания покупателя без UUID - должен вернуть ошибку."""
    invalid_data = {
        "keycloak_uuid": str(uuid.uuid4()),
        "is_online": True
        # Отсутствует обязательное поле "id"
    }
    
    with pytest.raises(Exception):
        await api_client.create_buyer(invalid_data)
```

#### Невалидный формат UUID
```python
@pytest.mark.asyncio
async def test_create_buyer_invalid_uuid_format(self, api_client, test_data_factory):
    """Тест создания покупателя с невалидным форматом UUID."""
    invalid_data = test_data_factory.create_invalid_uuid_data("buyer")
    
    with pytest.raises(Exception):
        await api_client.create_buyer(invalid_data)
```

#### Дублирующийся UUID
```python
@pytest.mark.asyncio
async def test_create_buyer_duplicate_uuid(self, api_client, test_data_factory):
    """Тест создания покупателя с дублирующимся UUID."""
    # Создаем первого покупателя
    first_buyer = await test_data_factory.create_buyer()
    
    # Пытаемся создать второго с тем же UUID
    duplicate_data = test_data_factory.create_duplicate_uuid_data(
        first_buyer["data"]["id"], "buyer"
    )
    
    with pytest.raises(Exception):
        await api_client.create_buyer(duplicate_data)
```

### 3. Тесты консистентности UUID

Проверяют, что UUID остается неизменным при различных операциях:

```python
@pytest.mark.asyncio
async def test_buyer_uuid_consistency(self, api_client, test_data_factory):
    """Тест консистентности UUID покупателя через все операции."""
    original_uuid = test_data_factory.generate_uuid()
    
    # Создание
    buyer = await api_client.create_buyer({"id": original_uuid, ...})
    assert buyer["data"]["id"] == original_uuid
    
    # Получение
    retrieved = await api_client.get_buyer(original_uuid)
    assert retrieved["data"]["id"] == original_uuid
    
    # Обновление
    updated = await api_client.update_buyer(original_uuid, {...})
    assert updated["data"]["id"] == original_uuid
```

### 4. Тесты связей между сущностями

Проверяют корректность UUID в связях:

```python
@pytest.mark.asyncio
async def test_uuid_in_relationships(self, api_client, test_data_factory):
    """Тест корректности UUID в связях между сущностями."""
    # Создаем продавца
    seller = await test_data_factory.create_seller()
    seller_id = seller["data"]["id"]
    
    # Создаем продукт, связанный с продавцом
    product = await test_data_factory.create_product(seller_id=seller_id)
    
    # Проверяем связь
    retrieved_product = await api_client.get_product(product["data"]["id"])
    assert retrieved_product["data"]["seller_id"] == seller_id
```

## 🔗 Интеграционные тесты

### Комплексные сценарии

Файл `test_uuid_integration.py` содержит end-to-end тесты:

1. **Полный сценарий маркетплейса** - создание всех связанных сущностей с отслеживанием UUID
2. **Консистентность при операциях** - проверка UUID при обновлениях
3. **Уникальность между типами** - проверка уникальности UUID между разными сущностями
4. **Массовые операции** - тестирование UUID при создании множества сущностей
5. **Каскадные операции** - проверка UUID при удалении связанных данных

### Пример комплексного теста

```python
@pytest.mark.asyncio
async def test_complete_marketplace_scenario_with_uuid_tracking(self, api_client, test_data_factory):
    """Тест полного сценария маркетплейса с отслеживанием UUID."""
    
    # Создаем всех участников
    buyer = await test_data_factory.create_buyer()
    seller = await test_data_factory.create_seller()
    
    # Создаем продукт
    product = await test_data_factory.create_product(seller_id=seller["data"]["id"])
    
    # Создаем чат
    chat = await test_data_factory.create_chat_thread(
        buyer_id=buyer["data"]["id"],
        seller_id=seller["data"]["id"]
    )
    
    # Проверяем все UUID и связи
    # ... детальные проверки
```

## 📊 Валидация UUID

### Форматы UUID

Тесты проверяют различные форматы UUID:

- **Валидные**: стандартные UUID4, нулевые UUID, UUID в разных регистрах
- **Невалидные**: короткие строки, длинные строки, невалидные символы

### Чувствительность к регистру

Специальные тесты проверяют поведение системы с UUID в разных регистрах:

```python
@pytest.mark.asyncio
async def test_uuid_case_sensitivity(self, api_client):
    """Тест чувствительности UUID к регистру."""
    lower_uuid = str(uuid.uuid4()).lower()
    upper_uuid = lower_uuid.upper()
    
    # Создаем с нижним регистром
    await api_client.create_buyer({"id": lower_uuid, ...})
    
    # Проверяем поведение с верхним регистром
    # ...
```

## 🚀 Запуск тестов

### Команды для запуска

```bash
# Все UUID тесты
make test-api

# Только валидация UUID
pytest functional_tests/api_tests/test_uuid_validation.py -v

# Интеграционные UUID тесты
pytest functional_tests/integration_tests/test_uuid_integration.py -v

# Конкретная сущность
pytest functional_tests/api_tests/test_buyer_api.py::TestBuyerAPI::test_create_buyer_success -v
```

### Отладка UUID проблем

```bash
# Запуск с подробным выводом
make test-debug

# Только UUID тесты с логированием
TEST_TYPE=api PYTEST_ARGS="-v -s -k uuid" make test
```

## 📝 Лучшие практики

### При написании новых тестов

1. **Всегда используйте `test_data_factory.generate_uuid()`** для генерации UUID
2. **Проверяйте возвращаемые UUID** - backend должен вернуть тот же UUID
3. **Тестируйте связи** - проверяйте корректность UUID в foreign key полях
4. **Добавляйте негативные тесты** - невалидные UUID, дублирование, отсутствие

### При отладке

1. **Проверьте формат UUID** - должен соответствовать стандарту UUID4
2. **Убедитесь в уникальности** - нет дублирующихся UUID в тестах
3. **Проверьте связи** - все foreign key UUID существуют
4. **Логируйте UUID** - используйте систему логирования для отслеживания

## 🔍 Мониторинг и анализ

### Логирование UUID

Система логирования автоматически записывает:
- UUID созданных сущностей
- Ошибки валидации UUID
- Проблемы с дублированием
- Время выполнения UUID операций

### Анализ результатов

```bash
# Статистика UUID тестов
make test-logs-stats

# Поиск проблем с UUID
grep -i "uuid" functional_tests/logs/test_results_*.log

# Анализ ошибок валидации
python functional_tests/utils/log_analyzer.py --latest | grep -i "uuid\|validation"
```

## 🎯 Заключение

Обновленная система тестирования обеспечивает:

- ✅ **Полное покрытие** UUID функциональности
- ✅ **Автоматическую генерацию** уникальных UUID
- ✅ **Валидацию** всех аспектов UUID
- ✅ **Интеграционные тесты** для комплексных сценариев
- ✅ **Негативные тесты** для проверки обработки ошибок
- ✅ **Документацию** и примеры использования

Система готова к использованию в production окружении и обеспечивает надежное тестирование UUID архитектуры backend API.
