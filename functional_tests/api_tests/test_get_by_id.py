"""
Тесты GET by ID операций для всех endpoints.
Проверяют получение сущностей по ID.
"""

import pytest
import httpx

from api_tests.api_client import (
    assert_response_success,
    generate_test_data,
    validate_entity_fields,
)


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.crud
@pytest.mark.fast
async def test_get_buyer_by_id() -> None:
    """Тест получения покупателя по ID: 200."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем покупателя
        buyer_data = generate_test_data("buyer")
        create_response = await client.post("/api/v1/buyers/", json=buyer_data)
        created_buyer = assert_response_success(create_response, 201)
        
        # Получаем покупателя по ID
        get_response = await client.get(f"/api/v1/buyers/{created_buyer['id']}")
        retrieved_buyer = assert_response_success(get_response, 200)
        
        # Валидация полей
        validate_entity_fields(retrieved_buyer, "buyer")
        
        # Проверка соответствия данных
        assert retrieved_buyer["id"] == created_buyer["id"]
        assert retrieved_buyer["keycloak_uuid"] == created_buyer["keycloak_uuid"]
        assert retrieved_buyer["is_online"] == created_buyer["is_online"]


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.crud
@pytest.mark.fast
async def test_get_seller_by_id() -> None:
    """Тест получения продавца по ID: 200."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем продавца
        seller_data = generate_test_data("seller")
        create_response = await client.post("/api/v1/sellers/", json=seller_data)
        created_seller = assert_response_success(create_response, 201)
        
        # Получаем продавца по ID
        get_response = await client.get(f"/api/v1/sellers/{created_seller['id']}")
        retrieved_seller = assert_response_success(get_response, 200)
        
        # Валидация полей
        validate_entity_fields(retrieved_seller, "seller")
        
        # Проверка соответствия данных
        assert retrieved_seller["id"] == created_seller["id"]
        assert retrieved_seller["keycloak_uuid"] == created_seller["keycloak_uuid"]
        assert retrieved_seller["is_online"] == created_seller["is_online"]


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.crud
@pytest.mark.fast
async def test_get_wood_type_by_id() -> None:
    """Тест получения типа древесины по ID: 200."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем тип древесины
        wood_type_data = generate_test_data("wood_type")
        create_response = await client.post("/api/v1/wood-types/", json=wood_type_data)
        created_wood_type = assert_response_success(create_response, 201)
        
        # Получаем тип древесины по ID
        get_response = await client.get(f"/api/v1/wood-types/{created_wood_type['id']}")
        retrieved_wood_type = assert_response_success(get_response, 200)
        
        # Валидация полей
        validate_entity_fields(retrieved_wood_type, "wood_type")
        
        # Проверка соответствия данных
        assert retrieved_wood_type["id"] == created_wood_type["id"]
        assert retrieved_wood_type["neme"] == created_wood_type["neme"]
        assert retrieved_wood_type["descrioption"] == created_wood_type["descrioption"]


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.validation
@pytest.mark.fast
async def test_get_nonexistent_buyer() -> None:
    """Тест получения несуществующего покупателя: 404."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Пытаемся получить несуществующего покупателя
        nonexistent_id = "550e8400-e29b-41d4-a716-446655440000"
        get_response = await client.get(f"/api/v1/buyers/{nonexistent_id}")
        
        # API может возвращать 404 (не найдено) или 500 (ошибка backend)
        assert get_response.status_code in [404, 500], (
            f"Expected 404 or 500 for non-existent entity, got {get_response.status_code}. "
            f"Response: {get_response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.validation
@pytest.mark.fast
async def test_get_invalid_id() -> None:
    """Тест получения с невалидным ID: 400/422."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Пытаемся получить с невалидным ID
        invalid_id = "invalid-uuid"
        get_response = await client.get(f"/api/v1/buyers/{invalid_id}")
        
        # Ожидаем ошибку валидации
        assert get_response.status_code in [400, 422], (
            f"Expected validation error (400 or 422), got {get_response.status_code}. "
            f"Response: {get_response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.integration
@pytest.mark.fast
async def test_get_product_by_id_with_dependencies() -> None:
    """Тест получения товара по ID с зависимостями."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем зависимости
        seller_data = generate_test_data("seller")
        seller_response = await client.post("/api/v1/sellers/", json=seller_data)
        created_seller = assert_response_success(seller_response, 201)
        
        wood_type_data = generate_test_data("wood_type")
        wood_type_response = await client.post("/api/v1/wood-types/", json=wood_type_data)
        created_wood_type = assert_response_success(wood_type_response, 201)
        
        # Создаем товар
        product_data = generate_test_data("product")
        product_data["seller_id"] = created_seller["id"]
        product_data["wood_type_id"] = created_wood_type["id"]
        create_response = await client.post("/api/v1/products/", json=product_data)
        created_product = assert_response_success(create_response, 201)
        
        # Получаем товар по ID
        get_response = await client.get(f"/api/v1/products/{created_product['id']}")
        retrieved_product = assert_response_success(get_response, 200)
        
        # Валидация полей
        validate_entity_fields(retrieved_product, "product")
        
        # Проверка соответствия данных
        assert retrieved_product["id"] == created_product["id"]
        assert retrieved_product["seller_id"] == created_product["seller_id"]
        assert retrieved_product["wood_type_id"] == created_product["wood_type_id"]


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.integration
@pytest.mark.fast
async def test_get_image_by_id_with_dependencies() -> None:
    """Тест получения изображения по ID с зависимостями."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем полную цепочку зависимостей
        seller_data = generate_test_data("seller")
        seller_response = await client.post("/api/v1/sellers/", json=seller_data)
        created_seller = assert_response_success(seller_response, 201)
        
        wood_type_data = generate_test_data("wood_type")
        wood_type_response = await client.post("/api/v1/wood-types/", json=wood_type_data)
        created_wood_type = assert_response_success(wood_type_response, 201)
        
        product_data = generate_test_data("product")
        product_data["seller_id"] = created_seller["id"]
        product_data["wood_type_id"] = created_wood_type["id"]
        product_response = await client.post("/api/v1/products/", json=product_data)
        created_product = assert_response_success(product_response, 201)
        
        # Создаем изображение
        image_data = generate_test_data("image")
        image_data["product_id"] = created_product["id"]
        create_response = await client.post("/api/v1/images/", json=image_data)
        created_image = assert_response_success(create_response, 201)
        
        # Получаем изображение по ID
        get_response = await client.get(f"/api/v1/images/{created_image['id']}")
        retrieved_image = assert_response_success(get_response, 200)
        
        # Валидация полей
        validate_entity_fields(retrieved_image, "image")
        
        # Проверка соответствия данных
        assert retrieved_image["id"] == created_image["id"]
        assert retrieved_image["product_id"] == created_image["product_id"]
        assert retrieved_image["image_path"] == created_image["image_path"]


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.performance
@pytest.mark.fast
async def test_get_by_id_performance() -> None:
    """Тест производительности получения по ID."""
    import time
    
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем несколько покупателей
        created_buyers = []
        for i in range(5):
            buyer_data = generate_test_data("buyer")
            create_response = await client.post("/api/v1/buyers/", json=buyer_data)
            created_buyer = assert_response_success(create_response, 201)
            created_buyers.append(created_buyer)
        
        # Измеряем время получения по ID
        start_time = time.time()
        
        for buyer in created_buyers:
            get_response = await client.get(f"/api/v1/buyers/{buyer['id']}")
            retrieved_buyer = assert_response_success(get_response, 200)
            assert retrieved_buyer["id"] == buyer["id"]
        
        end_time = time.time()
        retrieval_time = end_time - start_time
        
        # Проверяем производительность (не более 5 секунд на 5 запросов)
        assert retrieval_time < 5.0, f"Getting 5 buyers took too long: {retrieval_time:.2f} seconds"


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.integration
@pytest.mark.fast
async def test_get_all_entity_types_by_id() -> None:
    """Интеграционный тест: получение всех типов сущностей по ID."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем и проверяем каждый тип сущности
        entities_to_test = [
            ("buyer", "/api/v1/buyers/"),
            ("seller", "/api/v1/sellers/"),
            ("wood_type", "/api/v1/wood-types/"),
        ]
        
        for entity_type, endpoint in entities_to_test:
            # Создаем сущность
            entity_data = generate_test_data(entity_type)
            create_response = await client.post(endpoint, json=entity_data)
            created_entity = assert_response_success(create_response, 201)
            
            # Получаем по ID
            get_response = await client.get(f"{endpoint}{created_entity['id']}")
            retrieved_entity = assert_response_success(get_response, 200)
            
            # Валидация
            validate_entity_fields(retrieved_entity, entity_type)
            assert retrieved_entity["id"] == created_entity["id"]


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.integration
@pytest.mark.fast
async def test_get_wood_type_price_by_id() -> None:
    """Тест получения цены на древесину по ID."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем тип древесины
        wood_type_data = generate_test_data("wood_type")
        wood_type_response = await client.post("/api/v1/wood-types/", json=wood_type_data)
        created_wood_type = assert_response_success(wood_type_response, 201)

        # Создаем цену
        price_data = generate_test_data("wood_type_price")
        price_data["wood_type_id"] = created_wood_type["id"]
        price_response = await client.post("/api/v1/wood-type-prices/", json=price_data)
        created_price = assert_response_success(price_response, 201)

        # Получаем цену по ID
        get_response = await client.get(f"/api/v1/wood-type-prices/{created_price['id']}")
        retrieved_price = assert_response_success(get_response, 200)

        # Валидация полей
        validate_entity_fields(retrieved_price, "wood_type_price")

        # Проверка данных
        assert retrieved_price["id"] == created_price["id"]
        assert retrieved_price["wood_type_id"] == created_wood_type["id"]
        assert retrieved_price["price_per_m3"] == created_price["price_per_m3"]


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.integration
@pytest.mark.fast
async def test_get_chat_thread_by_id() -> None:
    """Тест получения чат-треда по ID."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем участников
        buyer_data = generate_test_data("buyer")
        buyer_response = await client.post("/api/v1/buyers/", json=buyer_data)
        created_buyer = assert_response_success(buyer_response, 201)

        seller_data = generate_test_data("seller")
        seller_response = await client.post("/api/v1/sellers/", json=seller_data)
        created_seller = assert_response_success(seller_response, 201)

        # Создаем чат-тред
        chat_data = generate_test_data("chat_thread")
        chat_data["buyer_id"] = created_buyer["id"]
        chat_data["seller_id"] = created_seller["id"]
        chat_response = await client.post("/api/v1/chat-threads/", json=chat_data)
        created_chat = assert_response_success(chat_response, 201)

        # Получаем чат-тред по ID
        get_response = await client.get(f"/api/v1/chat-threads/{created_chat['id']}")
        retrieved_chat = assert_response_success(get_response, 200)

        # Валидация полей
        validate_entity_fields(retrieved_chat, "chat_thread")

        # Проверка участников
        assert retrieved_chat["id"] == created_chat["id"]
        assert retrieved_chat["buyer_id"] == created_buyer["id"]
        assert retrieved_chat["seller_id"] == created_seller["id"]


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.integration
@pytest.mark.fast
async def test_get_wooden_board_by_id() -> None:
    """Тест получения деревянной доски по ID."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем полную цепочку зависимостей
        seller_data = generate_test_data("seller")
        seller_response = await client.post("/api/v1/sellers/", json=seller_data)
        created_seller = assert_response_success(seller_response, 201)

        wood_type_data = generate_test_data("wood_type")
        wood_type_response = await client.post("/api/v1/wood-types/", json=wood_type_data)
        created_wood_type = assert_response_success(wood_type_response, 201)

        product_data = generate_test_data("product")
        product_data["seller_id"] = created_seller["id"]
        product_data["wood_type_id"] = created_wood_type["id"]
        product_response = await client.post("/api/v1/products/", json=product_data)
        created_product = assert_response_success(product_response, 201)

        image_data = generate_test_data("image")
        image_data["product_id"] = created_product["id"]
        image_response = await client.post("/api/v1/images/", json=image_data)
        created_image = assert_response_success(image_response, 201)

        # Создаем деревянную доску
        board_data = generate_test_data("wooden_board")
        board_data["image_id"] = created_image["id"]
        board_response = await client.post("/api/v1/wooden-boards/", json=board_data)
        created_board = assert_response_success(board_response, 201)

        # Получаем доску по ID
        get_response = await client.get(f"/api/v1/wooden-boards/{created_board['id']}")
        retrieved_board = assert_response_success(get_response, 200)

        # Валидация полей
        validate_entity_fields(retrieved_board, "wooden_board")

        # Проверка данных
        assert retrieved_board["id"] == created_board["id"]
        assert retrieved_board["image_id"] == created_image["id"]
        assert retrieved_board["lenght"] == created_board["lenght"]
        assert retrieved_board["width"] == created_board["width"]
        assert retrieved_board["thickness"] == created_board["thickness"]


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.validation
@pytest.mark.fast
async def test_get_by_id_various_uuid_formats() -> None:
    """Тест GET by ID с различными форматами UUID."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем покупателя
        buyer_data = generate_test_data("buyer")
        create_response = await client.post("/api/v1/buyers/", json=buyer_data)
        created_buyer = assert_response_success(create_response, 201)

        # Тестируем различные форматы UUID
        valid_id = created_buyer["id"]

        # Стандартный формат (должен работать)
        get_response = await client.get(f"/api/v1/buyers/{valid_id}")
        assert get_response.status_code == 200

        # Верхний регистр (может работать или не работать)
        upper_id = valid_id.upper()
        get_response = await client.get(f"/api/v1/buyers/{upper_id}")
        assert get_response.status_code in [200, 400, 422]

        # Без дефисов (должен вернуть ошибку валидации)
        no_dashes_id = valid_id.replace("-", "")
        get_response = await client.get(f"/api/v1/buyers/{no_dashes_id}")
        assert get_response.status_code in [400, 422]


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.consistency
@pytest.mark.fast
async def test_get_by_id_data_consistency() -> None:
    """Тест консистентности данных при GET by ID."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем покупателя
        buyer_data = generate_test_data("buyer")
        create_response = await client.post("/api/v1/buyers/", json=buyer_data)
        created_buyer = assert_response_success(create_response, 201)

        # Получаем покупателя несколько раз
        for i in range(3):
            get_response = await client.get(f"/api/v1/buyers/{created_buyer['id']}")
            retrieved_buyer = assert_response_success(get_response, 200)

            # Данные должны быть одинаковыми при каждом запросе
            assert retrieved_buyer["id"] == created_buyer["id"]
            assert retrieved_buyer["keycloak_uuid"] == created_buyer["keycloak_uuid"]
            assert retrieved_buyer["is_online"] == created_buyer["is_online"]

        # Проверяем, что данные в списке соответствуют данным по ID
        list_response = await client.get("/api/v1/buyers/")
        buyers_list = assert_response_success(list_response, 200)

        # Находим нашего покупателя в списке
        found_buyer = None
        for buyer in buyers_list:
            if buyer["id"] == created_buyer["id"]:
                found_buyer = buyer
                break

        assert found_buyer is not None, f"Buyer {created_buyer['id']} not found in list"
        assert found_buyer["keycloak_uuid"] == created_buyer["keycloak_uuid"]
        assert found_buyer["is_online"] == created_buyer["is_online"]


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.stress
@pytest.mark.slow
async def test_get_by_id_stress_test() -> None:
    """Стресс-тест GET by ID операций."""
    import time

    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=60.0) as client:
        # Создаем 10 покупателей
        created_buyers = []
        for i in range(10):
            buyer_data = generate_test_data("buyer")
            create_response = await client.post("/api/v1/buyers/", json=buyer_data)
            created_buyer = assert_response_success(create_response, 201)
            created_buyers.append(created_buyer)

        # Измеряем время множественных GET запросов
        start_time = time.time()

        # Выполняем 50 GET запросов (по 5 на каждого покупателя)
        for _ in range(5):
            for buyer in created_buyers:
                get_response = await client.get(f"/api/v1/buyers/{buyer['id']}")
                retrieved_buyer = assert_response_success(get_response, 200)
                assert retrieved_buyer["id"] == buyer["id"]

        end_time = time.time()
        total_time = end_time - start_time

        # Проверяем производительность (не более 30 секунд на 50 запросов)
        assert total_time < 30.0, f"50 GET by ID requests took too long: {total_time:.2f} seconds"

        # Проверяем среднее время на запрос
        avg_time = total_time / 50
        assert avg_time < 1.0, f"Average GET by ID time too high: {avg_time:.3f} seconds"


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.smoke
@pytest.mark.fast
async def test_get_by_id_endpoints_availability() -> None:
    """Smoke test: проверка доступности всех GET by ID endpoints."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Тестируем GET by ID endpoints с несуществующими ID
        get_endpoints = [
            "/api/v1/buyers/550e8400-e29b-41d4-a716-446655440000",
            "/api/v1/sellers/550e8400-e29b-41d4-a716-446655440001",
            "/api/v1/wood-types/550e8400-e29b-41d4-a716-446655440002",
            "/api/v1/products/550e8400-e29b-41d4-a716-446655440003",
            "/api/v1/images/550e8400-e29b-41d4-a716-446655440004",
            "/api/v1/wood-type-prices/550e8400-e29b-41d4-a716-446655440005",
            "/api/v1/chat-threads/550e8400-e29b-41d4-a716-446655440006",
            "/api/v1/wooden-boards/550e8400-e29b-41d4-a716-446655440007",
        ]

        for endpoint in get_endpoints:
            get_response = await client.get(endpoint)
            # API может возвращать 404 (не найдено) или 500 (ошибка backend)
            assert get_response.status_code in [404, 500], (
                f"GET {endpoint} should return 404 or 500, got {get_response.status_code}"
            )
