"""
Тесты POST /api/v1/wood-type-prices/ endpoint.
Проверяют создание цен на типы древесины.
"""

import pytest
import httpx

from api_tests.api_client import (
    assert_response_success,
    generate_test_data,
    validate_entity_fields,
)

URI = "/api/v1/wood-type-prices/"
WOOD_TYPES_URI = "/api/v1/wood-types/"


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.crud
@pytest.mark.fast
async def test_post_wood_type_price_success() -> None:
    """Тест создания цены на тип древесины: 201."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем тип древесины
        wood_type_data = generate_test_data("wood_type")
        wood_type_response = await client.post(WOOD_TYPES_URI, json=wood_type_data)
        created_wood_type = assert_response_success(wood_type_response, 201)
        
        # Подготовка данных цены
        input_json = generate_test_data("wood_type_price")
        input_json["wood_type_id"] = created_wood_type["id"]
        
        # Выполнение запроса
        response = await client.post(URI, json=input_json)
        
        # Проверка ответа
        response_data = assert_response_success(response, 201)
        
        # Валидация полей
        validate_entity_fields(response_data, "wood_type_price")
        
        # Проверка соответствия входных и выходных данных
        assert response_data["price_per_m3"] == input_json["price_per_m3"]
        assert response_data["wood_type_id"] == input_json["wood_type_id"]


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_wood_type_price_invalid_data() -> None:
    """Тест создания цены с невалидными данными: 422."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Тест с невалидными типами данных
        invalid_data = {
            "id": "invalid-uuid",  # Невалидный UUID
            "price_per_m3": "not-a-number",  # Должно быть числом
            "wood_type_id": 123  # Должно быть строкой UUID
        }
        
        response = await client.post(URI, json=invalid_data)
        
        # Ожидаем ошибку валидации
        assert response.status_code in [400, 422], (
            f"Expected validation error (400 or 422), got {response.status_code}. "
            f"Response: {response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_wood_type_price_missing_fields() -> None:
    """Тест создания цены с отсутствующими полями: 422."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Тест с отсутствующими обязательными полями
        incomplete_data = {
            "id": "550e8400-e29b-41d4-a716-446655440000"
            # Отсутствуют price_per_m3 и wood_type_id
        }
        
        response = await client.post(URI, json=incomplete_data)
        
        # Ожидаем ошибку валидации
        assert response.status_code in [400, 422], (
            f"Expected validation error (400 or 422), got {response.status_code}. "
            f"Response: {response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_wood_type_price_nonexistent_wood_type() -> None:
    """Тест создания цены с несуществующим wood_type_id: 400/422."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Подготовка данных с несуществующим wood_type_id
        input_json = generate_test_data("wood_type_price")
        input_json["wood_type_id"] = "550e8400-e29b-41d4-a716-446655440000"  # Несуществующий ID
        
        response = await client.post(URI, json=input_json)
        
        # Ожидаем ошибку валидации или внешнего ключа
        assert response.status_code in [400, 422], (
            f"Expected validation error (400 or 422), got {response.status_code}. "
            f"Response: {response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_wood_type_price_negative_price() -> None:
    """Тест создания цены с отрицательной стоимостью."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем тип древесины
        wood_type_data = generate_test_data("wood_type")
        wood_type_response = await client.post(WOOD_TYPES_URI, json=wood_type_data)
        created_wood_type = assert_response_success(wood_type_response, 201)
        
        # Подготовка данных с отрицательной ценой
        input_json = generate_test_data("wood_type_price")
        input_json["wood_type_id"] = created_wood_type["id"]
        input_json["price_per_m3"] = -100.0  # Отрицательная цена
        
        response = await client.post(URI, json=input_json)
        
        # API может либо принять отрицательную цену (201), либо отклонить (400/422)
        assert response.status_code in [201, 400, 422], (
            f"Expected success (201) or validation error (400/422), got {response.status_code}. "
            f"Response: {response.text}"
        )
        
        if response.status_code == 201:
            response_data = assert_response_success(response, 201)
            validate_entity_fields(response_data, "wood_type_price")


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_wood_type_price_various_prices() -> None:
    """Тест создания цен с различными значениями."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем тип древесины
        wood_type_data = generate_test_data("wood_type")
        wood_type_response = await client.post(WOOD_TYPES_URI, json=wood_type_data)
        created_wood_type = assert_response_success(wood_type_response, 201)
        
        # Тестируем различные цены
        test_prices = [
            0.0,      # Нулевая цена
            0.01,     # Минимальная цена
            1000.0,   # Обычная цена
            99999.99, # Высокая цена
            123.456,  # Цена с дробной частью
        ]
        
        for price in test_prices:
            input_json = generate_test_data("wood_type_price")
            input_json["wood_type_id"] = created_wood_type["id"]
            input_json["price_per_m3"] = price
            
            response = await client.post(URI, json=input_json)
            
            # API должен принимать различные цены
            assert response.status_code in [201, 400, 422], (
                f"Expected success (201) or validation error (400/422) for price {price}, "
                f"got {response.status_code}. Response: {response.text}"
            )
            
            if response.status_code == 201:
                response_data = assert_response_success(response, 201)
                validate_entity_fields(response_data, "wood_type_price")
                assert response_data["price_per_m3"] == price


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.crud
@pytest.mark.fast
async def test_get_wood_type_prices() -> None:
    """Тест получения списка цен на типы древесины: 200."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        response = await client.get(URI)
        
        response_data = assert_response_success(response, 200)
        
        # Проверяем, что возвращается список
        assert isinstance(response_data, list), f"Expected list, got {type(response_data)}"
        
        # Проверяем структуру каждого элемента
        for price in response_data:
            validate_entity_fields(price, "wood_type_price")


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.integration
@pytest.mark.fast
async def test_wood_type_price_workflow() -> None:
    """Интеграционный тест: создание цены и проверка."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем тип древесины
        wood_type_data = generate_test_data("wood_type")
        wood_type_response = await client.post(WOOD_TYPES_URI, json=wood_type_data)
        created_wood_type = assert_response_success(wood_type_response, 201)
        
        # Создаем цену
        input_json = generate_test_data("wood_type_price")
        input_json["wood_type_id"] = created_wood_type["id"]
        
        create_response = await client.post(URI, json=input_json)
        created_price = assert_response_success(create_response, 201)
        
        # Проверяем, что цена появилась в списке
        list_response = await client.get(URI)
        prices_list = assert_response_success(list_response, 200)
        
        # Ищем созданную цену в списке
        price_ids = [price["id"] for price in prices_list]
        assert created_price["id"] in price_ids, (
            f"Created price {created_price['id']} not found in prices list"
        )
        
        # Находим созданную цену и проверяем данные
        found_price = next(price for price in prices_list if price["id"] == created_price["id"])
        assert found_price["price_per_m3"] == created_price["price_per_m3"]
        assert found_price["wood_type_id"] == created_price["wood_type_id"]


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.performance
@pytest.mark.fast
async def test_wood_type_price_creation_performance() -> None:
    """Тест производительности создания цен."""
    import time
    
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем несколько типов древесины
        created_wood_types = []
        for i in range(3):
            wood_type_data = generate_test_data("wood_type")
            wood_type_response = await client.post(WOOD_TYPES_URI, json=wood_type_data)
            wood_type = assert_response_success(wood_type_response, 201)
            created_wood_types.append(wood_type)
        
        # Измеряем время создания цен
        start_time = time.time()
        
        created_prices = []
        for wood_type in created_wood_types:
            price_data = generate_test_data("wood_type_price")
            price_data["wood_type_id"] = wood_type["id"]
            
            create_response = await client.post(URI, json=price_data)
            created_price = assert_response_success(create_response, 201)
            created_prices.append(created_price)
        
        end_time = time.time()
        creation_time = end_time - start_time
        
        # Проверяем производительность (не более 5 секунд на 3 цены)
        assert creation_time < 5.0, f"Creating 3 prices took too long: {creation_time:.2f} seconds"
        
        # Проверяем, что все цены созданы корректно
        for price in created_prices:
            validate_entity_fields(price, "wood_type_price")


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.integration
@pytest.mark.fast
async def test_wood_type_price_with_multiple_prices() -> None:
    """Тест создания нескольких цен для одного типа древесины."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем один тип древесины
        wood_type_data = generate_test_data("wood_type")
        wood_type_response = await client.post(WOOD_TYPES_URI, json=wood_type_data)
        created_wood_type = assert_response_success(wood_type_response, 201)
        
        # Создаем несколько цен для одного типа древесины
        prices = [1000.0, 1500.0, 2000.0]
        created_prices = []
        
        for price_value in prices:
            price_data = generate_test_data("wood_type_price")
            price_data["wood_type_id"] = created_wood_type["id"]
            price_data["price_per_m3"] = price_value
            
            create_response = await client.post(URI, json=price_data)
            
            # API может либо разрешить несколько цен (201), либо запретить дублирование (400/409)
            assert create_response.status_code in [201, 400, 409], (
                f"Expected success (201) or conflict (400/409) for price {price_value}, "
                f"got {create_response.status_code}. Response: {create_response.text}"
            )
            
            if create_response.status_code == 201:
                created_price = assert_response_success(create_response, 201)
                created_prices.append(created_price)
                validate_entity_fields(created_price, "wood_type_price")
        
        # Проверяем, что все цены связаны с одним типом древесины
        for price in created_prices:
            assert price["wood_type_id"] == created_wood_type["id"]
